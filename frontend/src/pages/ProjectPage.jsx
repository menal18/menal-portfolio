import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { imgOf, optimize } from '../services/images.js';
import { parseVideo } from '../services/video.js';
import useTitle from '../hooks/useTitle.js';
import Reveal from '../components/Reveal.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { Loader } from '../components/StateScreen.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function ProjectPage() {
  const { appearance } = useSite();
  const season = appearance.season;
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true });
  const [lb, setLb] = useState(-1);

  useEffect(() => {
    let off = false;
    setState({ loading: true });
    window.scrollTo(0, 0);
    api.get(`/projects/${slug}`)
      .then((r) => { if (!off) setState({ data: r.data }); })
      .catch((e) => { if (!off) setState({ error: errMsg(e), notFound: e.response?.status === 404 }); });
    return () => { off = true; };
  }, [slug]);

  useTitle(state.data ? `${state.data.project.title} | Menal` : undefined);

  if (state.loading) return <Loader />;
  if (state.error) {
    return (
      <main className="container pp-missing">
        <h1 className="display">{state.notFound ? 'Project not found' : 'Could not load project'}</h1>
        <p className="muted">{state.notFound ? 'It may have been unpublished or moved.' : state.error}</p>
        <Link className="btn ghost" to="/#projects"><ArrowLeft size={16} /> All projects</Link>
      </main>
    );
  }

  const { project: p, related } = state.data;
  const video = parseVideo(p.videoUrl);
  const gallery = p.gallery || [];

  return (
    <main className="pp">
      <header className="pp-head container">
        <Link className="back" to="/#projects"><ArrowLeft size={16} /> Projects</Link>
        <p className="muted">{p.category?.name}</p>
        <h1 className="display pp-title">{p.title}</h1>
        {p.summary && <p className="lead">{p.summary}</p>}
        <div className="pp-links">
          {p.liveUrl && <a className="btn primary" href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live demo <ExternalLink size={16} /></a>}
          {p.githubUrl && <a className="btn ghost" href={p.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={16} /> Source code</a>}
        </div>
      </header>

      <div className="pp-cover container"><img src={optimize(imgOf(p, undefined, season), 1600)} alt={`${p.title} cover`} /></div>

      <div className="container pp-grid">
        <Reveal as="aside" className="pp-meta">
          {p.technologies?.length > 0 && (<><h2>Technologies</h2><ul className="tags">{p.technologies.map((t) => <li className="tag" key={t}>{t}</li>)}</ul></>)}
        </Reveal>
        <Reveal className="pp-desc">
          {p.description ? p.description.split(/\n+/).map((t, i) => <p key={i}>{t}</p>) : <p className="muted">A full write-up is coming soon.</p>}
        </Reveal>
      </div>

      {video && (
        <div className="container pp-video">
          {video.type === 'iframe' && <iframe src={video.src} title={`${p.title} video`} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />}
          {video.type === 'video' && <video src={video.src} controls preload="metadata" />}
          {video.type === 'link' && <a className="btn ghost" href={video.src} target="_blank" rel="noopener noreferrer">Watch video <ExternalLink size={16} /></a>}
        </div>
      )}

      {gallery.length > 0 && (
        <section className="container pp-gallery" aria-label="Project gallery">
          <h2>Gallery</h2>
          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <Reveal key={g._id || i} delay={(i % 3) * 70} className={`g-item g${i % 4}`}>
                <button type="button" onClick={() => setLb(i)} aria-label={`Open image ${i + 1} of ${gallery.length}`}>
                  <img src={optimize(g.url, 900)} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      {lb >= 0 && <Lightbox images={gallery} index={lb} onIndex={setLb} onClose={() => setLb(-1)} />}

      {related.length > 0 && (
        <section className="container pp-related">
          <h2>More in {p.category?.name}</h2>
          <ul>
            {related.map((r) => (
              <li key={r._id}><Link to={`/projects/${r.slug}`} className="index-row"><img className="index-thumb" src={optimize(imgOf(r, undefined, season), 400)} alt="" /><span className="index-title">{r.title}</span></Link></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
