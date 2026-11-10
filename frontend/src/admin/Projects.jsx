import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { Empty, Field, ImagePicker, PageHeader, Spinner, useToast } from './ui.jsx';
import { placeholder } from '../services/images.js';

export function ProjectList() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const load = useCallback(() => api.get('/admin/projects').then((r) => setList(r.data)).catch((e) => toast(errMsg(e), 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const patch = async (p, body, msg) => {
    try { await api.patch(`/admin/projects/${p._id}/status`, body); toast(msg); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const del = async (p) => {
    if (!window.confirm(`Delete "${p.title}" and its images? This cannot be undone.`)) return;
    try { await api.delete(`/admin/projects/${p._id}`); toast('Project deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Projects" sub="Published projects appear on the public site immediately."><Link className="a-btn primary" to="/admin/projects/new"><Plus size={16} /> New project</Link></PageHeader>
      {!list ? <Spinner /> : list.length === 0 ? <Empty>No projects yet. Create your first one.</Empty> : (
        <ul className="a-rows">
          {list.map((p) => (
            <li key={p._id}>
              <img src={p.coverImage?.url || placeholder(p.title, p.title, 160, 100)} alt="" />
              <div className="a-row-main">
                <strong>{p.title}</strong>
                <span className="muted">{p.category?.name}</span>
              </div>
              <span className={`pill ${p.status}`}>{p.status}</span>
              <div className="a-row-actions">
                <button type="button" className={`icon-btn ${p.featured ? 'on' : ''}`} title={p.featured ? 'Remove from featured' : 'Feature'} aria-label="Toggle featured" onClick={() => patch(p, { featured: !p.featured }, p.featured ? 'Unfeatured' : 'Featured')}><Star size={16} /></button>
                <button type="button" className="icon-btn" title={p.status === 'published' ? 'Unpublish' : 'Publish'} aria-label="Toggle published" onClick={() => patch(p, { status: p.status === 'published' ? 'draft' : 'published' }, p.status === 'published' ? 'Unpublished' : 'Published')}>{p.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                <Link className="icon-btn" to={`/admin/projects/${p._id}`} aria-label="Edit"><Pencil size={16} /></Link>
                <button type="button" className="icon-btn danger" aria-label="Delete" onClick={() => del(p)}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const BLANK = { title: '', summary: '', description: '', category: '', technologies: '', liveUrl: '', githubUrl: '', videoUrl: '', status: 'draft', featured: false, order: 0 };

export function ProjectForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState(BLANK);
  const [cats, setCats] = useState([]);
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [newCover, setNewCover] = useState([]);
  const [newGallery, setNewGallery] = useState([]);
  const [rmCover, setRmCover] = useState([]);
  const [rmGallery, setRmGallery] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/categories').then((r) => setCats(r.data));
    if (id) {
      api.get(`/admin/projects/${id}`).then(({ data: p }) => {
        setF({ ...BLANK, ...p, category: p.category?._id || '', technologies: (p.technologies || []).join(', ') });
        setCover(p.coverImage || null); setGallery(p.gallery || []);
      }).catch((e) => toast(errMsg(e), 'error')).finally(() => setLoading(false));
    }
  }, [id, toast]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!f.category) { toast('Choose a category (create one under Categories first)', 'error'); return; }
    const fd = new FormData();
    ['title', 'summary', 'description', 'category', 'technologies', 'liveUrl', 'githubUrl', 'videoUrl', 'status', 'order'].forEach((k) => fd.append(k, f[k] ?? ''));
    fd.append('featured', f.featured);
    if (newCover[0]) fd.append('coverImage', newCover[0]);
    newGallery.forEach((g) => fd.append('gallery', g));
    if (id) {
      if (rmCover.length && !newCover[0]) fd.append('removeCover', 'true');
      fd.append('removeGallery', JSON.stringify(rmGallery));
    }
    setBusy(true);
    try {
      if (id) await api.put(`/admin/projects/${id}`, fd); else await api.post('/admin/projects', fd);
      toast(f.status === 'published' ? 'Saved and live on the site' : 'Saved as draft');
      nav('/admin/projects');
    } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title={id ? 'Edit project' : 'New project'} />
      <form className="a-form" onSubmit={submit}>
        <Field label="Title" htmlFor="t"><input id="t" value={f.title} onChange={set('title')} required maxLength={120} /></Field>
        <Field label="Category" htmlFor="c">
          <select id="c" value={f.category} onChange={set('category')} required>
            <option value="">Select...</option>
            {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Short summary" hint="Shown on cards. Up to 240 characters." htmlFor="s"><input id="s" value={f.summary} onChange={set('summary')} maxLength={240} /></Field>
        <Field label="Description" hint="Blank lines start a new paragraph." htmlFor="d"><textarea id="d" rows={8} value={f.description} onChange={set('description')} /></Field>
        <Field label="Technologies" hint="Comma separated, e.g. React, Node.js, MongoDB" htmlFor="tech"><input id="tech" value={f.technologies} onChange={set('technologies')} /></Field>
        <div className="a-cols">
          <Field label="Live demo URL" htmlFor="l"><input id="l" type="url" value={f.liveUrl} onChange={set('liveUrl')} placeholder="https://" /></Field>
          <Field label="GitHub URL" htmlFor="g"><input id="g" type="url" value={f.githubUrl} onChange={set('githubUrl')} placeholder="https://github.com/" /></Field>
          <Field label="Video URL" hint="YouTube, Vimeo or a direct .mp4" htmlFor="v"><input id="v" type="url" value={f.videoUrl} onChange={set('videoUrl')} placeholder="https://" /></Field>
        </div>
        <ImagePicker label="Cover image" existing={cover ? [{ ...cover, _id: undefined }] : []} removed={rmCover} setRemoved={setRmCover} files={newCover} setFiles={setNewCover} hint="Without one, a generated placeholder is shown." />
        <ImagePicker label="Gallery images" multiple existing={gallery} removed={rmGallery} setRemoved={setRmGallery} files={newGallery} setFiles={setNewGallery} />
        <div className="a-cols">
          <Field label="Status" htmlFor="st"><select id="st" value={f.status} onChange={set('status')}><option value="draft">Draft (hidden)</option><option value="published">Published (visible)</option></select></Field>
          <Field label="Display order" hint="Lower numbers come first" htmlFor="o"><input id="o" type="number" value={f.order} onChange={set('order')} /></Field>
          <label className="a-check"><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Featured in Selected projects</label>
        </div>
        <div className="a-actions">
          <button className="a-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save project'}</button>
          <Link className="a-btn" to="/admin/projects">Cancel</Link>
        </div>
      </form>
    </>
  );
}
