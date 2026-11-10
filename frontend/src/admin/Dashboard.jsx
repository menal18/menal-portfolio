import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { PageHeader, Spinner, fmtDate } from './ui.jsx';

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  if (err) return <p className="a-error">{err}</p>;
  if (!s) return <Spinner />;
  const rows = [
    ['Projects published', `${s.published} of ${s.projects}`, '/admin/projects'],
    ['Drafts waiting', s.drafts, '/admin/projects'],
    ['Featured projects', s.featured, '/admin/projects'],
    ['Marketing campaigns live', `${s.publishedCampaigns} of ${s.campaigns}`, '/admin/marketing'],
    ['Expertise items', s.skills, '/admin/skills'],
    ['Experience entries', s.experience, '/admin/experience'],
    ['Unread enquiries', s.unread, '/admin/messages'],
  ];
  return (
    <>
      <PageHeader title="Overview" sub="What visitors see right now." />
      <dl className="a-stats">
        {rows.map(([k, v, to]) => (<Link to={to} key={k}><dt>{k}</dt><dd>{v}</dd></Link>))}
      </dl>
      <section className="a-panel">
        <h2>Resume</h2>
        {s.resume ? <p>{s.resume.fileName}, uploaded {fmtDate(s.resume.updatedAt)}</p> : <p className="muted">No resume uploaded. <Link to="/admin/resume">Upload one</Link></p>}
      </section>
      <section className="a-panel">
        <h2>Latest enquiries</h2>
        {s.recent.length === 0 ? <p className="muted">No enquiries yet.</p> : (
          <ul className="a-list">
            {s.recent.map((m) => (<li key={m._id}><strong>{m.name}</strong> {!m.read && <span className="pill">New</span>}<span className="muted"> {m.subject || m.message.slice(0, 60)}</span></li>))}
          </ul>
        )}
      </section>
    </>
  );
}
