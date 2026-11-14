import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowUpRight, Eye, EyeOff, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { Empty, Field, ImagePicker, PageHeader, Spinner, useConfirm, useToast, fmtDate } from './ui.jsx';
import { placeholder } from '../services/images.js';

export function CampaignList() {
  const toast = useToast();
  const confirm = useConfirm();
  const [list, setList] = useState(null);
  const load = useCallback(() => api.get('/admin/campaigns').then((r) => setList(r.data)).catch((e) => toast(errMsg(e), 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (c) => {
    try { await api.patch(`/admin/campaigns/${c._id}/status`, { status: c.status === 'published' ? 'draft' : 'published' }); toast(c.status === 'published' ? 'Unpublished' : 'Published'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const toggleFeatured = async (c) => {
    try { await api.patch(`/admin/campaigns/${c._id}/status`, { featured: !c.featured }); toast(c.featured ? 'Campaign unfeatured' : 'Campaign featured'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };
  const del = async (c) => {
    if (!await confirm({ title: `Delete "${c.title}"?`, message: 'This will permanently remove the campaign and its uploaded creative images.', confirmLabel: 'Delete campaign' })) return;
    try { await api.delete(`/admin/campaigns/${c._id}`); toast('Campaign deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Marketing" sub="Campaigns, creatives, SEO and social work shown in the marketing showcase."><Link className="a-btn primary" to="/admin/marketing/new"><Plus size={16} /> New campaign</Link></PageHeader>
      {!list ? <Spinner /> : list.length === 0 ? <Empty>No campaigns yet.</Empty> : (
        <ul className="a-entity-grid">
          {list.map((c) => (
            <li className="a-entity-card" key={c._id}>
              <Link className="a-entity-image" to={`/admin/marketing/${c._id}`} aria-label={`Edit ${c.title}`}>
                <img src={c.coverImage?.url || c.creatives?.[0]?.url || placeholder(c.title, c.title, 480, 300)} alt="" />
                <span>View campaign <ArrowUpRight size={15} /></span>
              </Link>
              <div className="a-entity-content">
                <div className="a-entity-title-row">
                  <div className="a-entity-title">
                    <h2><Link to={`/admin/marketing/${c._id}`}>{c.title}</Link></h2>
                    <p>{[c.type, c.client, c.platform].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="a-badges">
                    <span className={`a-status ${c.status}`}>{c.status}</span>
                    {c.featured && <span className="a-badge-featured"><Star size={12} fill="currentColor" /> Featured</span>}
                  </div>
                </div>
                {c.summary && <p className="a-entity-summary">{c.summary}</p>}
                <div className="a-entity-footer">
                  <span className="a-entity-date">Updated {fmtDate(c.updatedAt || c.createdAt)}</span>
                  <div className="a-row-actions">
                    <button type="button" className={`icon-btn ${c.featured ? 'on' : ''}`} title={c.featured ? 'Remove from featured' : 'Feature'} aria-label={c.featured ? 'Remove from featured' : 'Feature campaign'} onClick={() => toggleFeatured(c)}><Star size={16} /></button>
                    <button type="button" className="icon-btn" title={c.status === 'published' ? 'Unpublish' : 'Publish'} aria-label={c.status === 'published' ? 'Unpublish campaign' : 'Publish campaign'} onClick={() => toggle(c)}>{c.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    <Link className="icon-btn" to={`/admin/marketing/${c._id}`} aria-label={`Edit ${c.title}`}><Pencil size={16} /></Link>
                    <button type="button" className="icon-btn danger" aria-label={`Delete ${c.title}`} onClick={() => del(c)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const BLANK = { title: '', type: 'Campaign', client: '', platform: '', summary: '', description: '', seoWork: '', socialContent: '', linkUrl: '', status: 'draft', featured: false, order: 0 };

export function CampaignForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState(BLANK);
  const [perf, setPerf] = useState([]);
  const [cover, setCover] = useState(null);
  const [creatives, setCreatives] = useState([]);
  const [newCover, setNewCover] = useState([]);
  const [newCreatives, setNewCreatives] = useState([]);
  const [rmCover, setRmCover] = useState([]);
  const [rmCreatives, setRmCreatives] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/campaigns/${id}`).then(({ data: c }) => {
      setF({ ...BLANK, ...c }); setPerf(c.performance || []); setCover(c.coverImage || null); setCreatives(c.creatives || []);
    }).catch((e) => toast(errMsg(e), 'error')).finally(() => setLoading(false));
  }, [id, toast]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setPerfRow = (i, k, v) => setPerf((rows) => rows.map((r, n) => (n === i ? { ...r, [k]: v } : r)));

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    ['title', 'type', 'client', 'platform', 'summary', 'description', 'seoWork', 'socialContent', 'linkUrl', 'status', 'order'].forEach((k) => fd.append(k, f[k] ?? ''));
    fd.append('featured', f.featured);
    fd.append('performance', JSON.stringify(perf));
    if (newCover[0]) fd.append('coverImage', newCover[0]);
    newCreatives.forEach((x) => fd.append('creatives', x));
    if (id) {
      if (rmCover.length && !newCover[0]) fd.append('removeCover', 'true');
      fd.append('removeCreatives', JSON.stringify(rmCreatives));
    }
    setBusy(true);
    try {
      if (id) await api.put(`/admin/campaigns/${id}`, fd); else await api.post('/admin/campaigns', fd);
      toast(f.status === 'published' ? 'Saved and live on the site' : 'Saved as draft');
      nav('/admin/marketing');
    } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  return (
    <>
      <PageHeader title={id ? 'Edit campaign' : 'New campaign'} />
      <form className="a-form a-editor-form" onSubmit={submit}>
        <Field label="Title" htmlFor="t"><input id="t" value={f.title} onChange={set('title')} required maxLength={140} /></Field>
        <div className="a-cols">
          <Field label="Type" htmlFor="ty"><select id="ty" value={f.type} onChange={set('type')}>{['Campaign', 'Creative', 'SEO', 'Social Media', 'Content'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Client or brand" htmlFor="cl"><input id="cl" value={f.client} onChange={set('client')} /></Field>
          <Field label="Platform" hint="e.g. Instagram, Google Search" htmlFor="pl"><input id="pl" value={f.platform} onChange={set('platform')} /></Field>
        </div>
        <Field label="Summary" htmlFor="s"><input id="s" value={f.summary} onChange={set('summary')} /></Field>
        <Field label="Description" htmlFor="d"><textarea id="d" rows={5} value={f.description} onChange={set('description')} /></Field>
        <Field label="SEO work" htmlFor="seo"><textarea id="seo" rows={4} value={f.seoWork} onChange={set('seoWork')} /></Field>
        <Field label="Social media content" htmlFor="soc"><textarea id="soc" rows={4} value={f.socialContent} onChange={set('socialContent')} /></Field>

        <fieldset className="a-perf">
          <legend>Performance information</legend>
          <p className="muted">Add only real, verified figures. Nothing is shown unless you add it.</p>
          {perf.map((r, i) => (
            <div className="perf-row" key={i}>
              <input aria-label="Label" placeholder="Label (e.g. Reach)" value={r.label} onChange={(e) => setPerfRow(i, 'label', e.target.value)} />
              <input aria-label="Value" placeholder="Value" value={r.value} onChange={(e) => setPerfRow(i, 'value', e.target.value)} />
              <input aria-label="Note" placeholder="Note (optional)" value={r.note || ''} onChange={(e) => setPerfRow(i, 'note', e.target.value)} />
              <button type="button" className="icon-btn danger" aria-label="Remove row" onClick={() => setPerf(perf.filter((_, n) => n !== i))}><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" className="a-btn" onClick={() => setPerf([...perf, { label: '', value: '', note: '' }])}><Plus size={16} /> Add metric</button>
        </fieldset>

        <ImagePicker label="Cover image" existing={cover ? [{ ...cover, _id: undefined }] : []} removed={rmCover} setRemoved={setRmCover} files={newCover} setFiles={setNewCover} />
        <ImagePicker label="Creatives" multiple existing={creatives} removed={rmCreatives} setRemoved={setRmCreatives} files={newCreatives} setFiles={setNewCreatives} hint="Posters, ad creatives, screenshots of SEO or social work." />
        <Field label="Link" htmlFor="lk"><input id="lk" type="url" value={f.linkUrl} onChange={set('linkUrl')} placeholder="https://" /></Field>
        <div className="a-cols">
          <Field label="Status" htmlFor="st"><select id="st" value={f.status} onChange={set('status')}><option value="draft">Draft (hidden)</option><option value="published">Published (visible)</option></select></Field>
          <Field label="Display order" htmlFor="o"><input id="o" type="number" value={f.order} onChange={set('order')} /></Field>
          <label className="a-check"><input type="checkbox" checked={!!f.featured} onChange={set('featured')} /> Show first</label>
        </div>
        <div className="a-actions">
          <button className="a-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save campaign'}</button>
          <Link className="a-btn" to="/admin/marketing">Cancel</Link>
        </div>
      </form>
    </>
  );
}
