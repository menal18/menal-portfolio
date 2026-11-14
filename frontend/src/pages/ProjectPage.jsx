import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, Github, ZoomIn } from 'lucide-react';
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
    <main className="pp" data-season={season}>
        <header className="pp-head container">
          <Link className="back pp-back" to="/#projects"><ArrowLeft size={16} /> Projects</Link>
          <div className="pp-hero-layout">
            <div className="pp-hero-copy">
              {p.category?.name && <p className="pp-category">{p.category.name}</p>}
              <h1 className="display pp-title">{p.title}</h1>
              {p.summary && <p className="lead">{p.summary}</p>}
              <div className="pp-links">
                {p.liveUrl && <a className="btn primary pp-cta" href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live demo <ExternalLink size={16} /></a>}
                {p.githubUrl && <a className="btn ghost pp-cta" href={p.githubUrl} target="_blank" rel="noopener noreferrer"><Github size={16} /> Source code</a>}
              </div>
            </div>
            <div className="pp-hero-art" aria-hidden="true">
              <span className="pp-art-orbit" />
              <span className="pp-art-disc" />
              <span className="pp-art-mark" />
              <span className="pp-art-caption"><span>Seasonal edition</span><strong>{season}</strong></span>
            </div>
          </div>
        </header>

        <Reveal className="container pp-showcase">
          <figure className="pp-cover">
            <img src={optimize(imgOf(p, undefined, season), 1600)} alt={`${p.title} cover`} />
            <figcaption className="pp-preview-label"><span className="pp-preview-dot" /> Project preview</figcaption>
          </figure>
        </Reveal>

        <section className="container pp-story" aria-labelledby="pp-story-title">
          <header className="pp-section-heading">
            <span className="pp-section-number" aria-hidden="true">01</span>
            <div>
              <p className="pp-eyebrow">The case study</p>
              <h2 id="pp-story-title">Behind the project</h2>
            </div>
          </header>
          <div className="pp-grid">
            <Reveal as="aside" className="pp-meta">
              <p className="pp-overline">Technologies</p>
              {p.technologies?.length > 0 && (
                <ul className="pp-tech-list" aria-label="Technologies">
                  {p.technologies.map((t, i) => <li className="pp-tech-pill" key={t}><span>{String(i + 1).padStart(2, '0')}</span>{t}</li>)}
                </ul>
              )}
            </Reveal>
            <Reveal className="pp-desc">
              {p.description ? p.description.split(/\n+/).map((t, i) => <p key={i}>{t}</p>) : <p className="muted">A full write-up is coming soon.</p>}
            </Reveal>
          </div>
        </section>

        {video && (
          <Reveal as="section" className="container pp-video" aria-labelledby="pp-video-title">
            <header className="pp-section-heading pp-video-heading">
              <span className="pp-section-number" aria-hidden="true">02</span>
              <div>
                <p className="pp-eyebrow">A closer look</p>
                <h2 id="pp-video-title">In motion</h2>
              </div>
            </header>
            <div className="pp-video-frame">
              {video.type === 'iframe' && <iframe src={video.src} title={`${p.title} video`} allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />}
              {video.type === 'video' && <video src={video.src} controls preload="metadata" />}
              {video.type === 'link' && <a className="btn ghost" href={video.src} target="_blank" rel="noopener noreferrer">Watch video <ExternalLink size={16} /></a>}
            </div>
          </Reveal>
        )}

        {gallery.length > 0 && (
          <section className="container pp-gallery" aria-labelledby="pp-gallery-title">
            <header className="pp-section-heading">
              <span className="pp-section-number" aria-hidden="true">{video ? '03' : '02'}</span>
              <div>
                <p className="pp-eyebrow">Selected screens</p>
                <h2 id="pp-gallery-title">A closer look</h2>
              </div>
            </header>
            <div className="pp-premium-gallery-grid">
              {gallery.map((g, i) => (
                <Reveal key={g._id || i} delay={(i % 3) * 70} className="pp-gallery-card">
                  <button type="button" onClick={() => setLb(i)} aria-label={`Open image ${i + 1} of ${gallery.length}`}>
                    <img src={optimize(g.url, 900)} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" />
                    <span className="pp-gallery-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="pp-gallery-zoom" aria-hidden="true"><ZoomIn size={18} /></span>
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}
        {lb >= 0 && createPortal(<Lightbox images={gallery} index={lb} onIndex={setLb} onClose={() => setLb(-1)} />, document.body)}

        {related.length > 0 && (
          <Reveal as="section" className="container pp-related" aria-labelledby="pp-related-title">
            <header className="pp-section-heading">
              <span className="pp-section-number" aria-hidden="true">{gallery.length > 0 ? (video ? '04' : '03') : (video ? '03' : '02')}</span>
              <div>
                <p className="pp-eyebrow">Continue exploring</p>
                <h2 id="pp-related-title">More in {p.category?.name}</h2>
              </div>
            </header>
            <ul className="pp-related-grid">
              {related.map((r, i) => (
                <Reveal as="li" key={r._id} delay={(i % 2) * 90}>
                  <Link to={`/projects/${r.slug}`} className="pp-related-card">
                    <span className="pp-related-image">
                      <img src={optimize(imgOf(r, undefined, season), 700)} alt={`${r.title} cover`} loading="lazy" />
                      <span className="pp-related-arrow" aria-hidden="true"><ArrowRight size={19} /></span>
                    </span>
                    <span className="pp-related-info">
                      {r.category?.name && <span className="pp-related-category">{r.category.name}</span>}
                      <span className="pp-related-title">{r.title}</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </Reveal>
        )}
      </main>
  );
}
