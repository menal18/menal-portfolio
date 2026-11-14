import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  FolderKanban,
  Inbox,
  Megaphone,
  Star,
  Eye,
} from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { placeholder } from '../services/images.js';
import { Empty, PageHeader, Spinner, fmtDate } from './ui.jsx';

const STAT_CARDS = [
  { key: 'projects', label: 'Total projects', detail: 'Across your portfolio', to: '/admin/projects', Icon: FolderKanban },
  { key: 'published', label: 'Published projects', detail: 'Visible on your website', to: '/admin/projects', Icon: Eye },
  { key: 'drafts', label: 'Draft projects', detail: 'Not yet published', to: '/admin/projects', Icon: FileText },
  { key: 'featured', label: 'Featured projects', detail: 'Highlighted on the site', to: '/admin/projects', Icon: Star },
  { key: 'campaigns', label: 'Marketing campaigns', detail: 'Published campaigns included', to: '/admin/marketing', Icon: Megaphone },
  { key: 'unread', label: 'Unread enquiries', detail: 'Messages to review', to: '/admin/messages', Icon: Inbox },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/admin/stats'), api.get('/admin/projects')])
      .then(([stats, projects]) => {
        if (active) setData({ stats: stats.data, projects: projects.data });
      })
      .catch((cause) => {
        if (active) setErr(errMsg(cause));
      });
    return () => { active = false; };
  }, []);

  if (err) return <p className="a-error" role="alert">{err}</p>;
  if (!data) return <Spinner />;

  const { stats } = data;
  const recentProjects = [...data.projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Overview" sub="A clear view of your portfolio, content and incoming messages." />
      <section className="a-stats" aria-label="Portfolio statistics">
        {STAT_CARDS.map(({ key, label, detail, to, Icon }) => (
          <Link className="a-stat-card" to={to} key={key}>
            <span className="a-stat-icon"><Icon size={19} aria-hidden="true" /></span>
            <span className="a-stat-label">{label}</span>
            <strong className="a-stat-value">{stats[key]}</strong>
            <span className="a-stat-detail">{key === 'campaigns' ? `${stats.publishedCampaigns} published · ${stats.campaigns} total` : detail}</span>
            <ArrowUpRight className="a-stat-arrow" size={17} aria-hidden="true" />
          </Link>
        ))}
      </section>

      <div className="a-dashboard-grid">
        <section className="a-panel a-dashboard-panel">
          <div className="a-section-head">
            <div><p className="a-eyebrow">Portfolio</p><h2>Recent projects</h2></div>
            <Link to="/admin/projects" className="a-text-link">All projects <ArrowUpRight size={15} /></Link>
          </div>
          {recentProjects.length === 0 ? <Empty>No projects yet. Create your first project to get started.</Empty> : (
            <ul className="a-recent-list">
              {recentProjects.map((project) => (
                <li key={project._id}>
                  <img src={project.coverImage?.url || placeholder(project.title, project.title, 160, 100)} alt="" />
                  <div className="a-recent-copy">
                    <Link to={`/admin/projects/${project._id}`}><strong>{project.title}</strong></Link>
                    <span>{project.category?.name || 'Uncategorized'} · {fmtDate(project.updatedAt || project.createdAt)}</span>
                  </div>
                  <span className={`a-status ${project.status}`}>{project.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-panel a-dashboard-panel">
          <div className="a-section-head">
            <div><p className="a-eyebrow">Inbox</p><h2>Recent enquiries</h2></div>
            <Link to="/admin/messages" className="a-text-link">Open inbox <ArrowUpRight size={15} /></Link>
          </div>
          {stats.recent.length === 0 ? <Empty>No enquiries yet. New contact messages will appear here.</Empty> : (
            <ul className="a-recent-list a-enquiry-list">
              {stats.recent.map((message) => (
                <li key={message._id} className={!message.read ? 'unread' : ''}>
                  <span className="a-message-avatar" aria-hidden="true">{message.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  <div className="a-recent-copy">
                    <Link to="/admin/messages"><strong>{message.name}</strong></Link>
                    <span>{message.subject || message.message.slice(0, 76)}{message.message.length > 76 && !message.subject ? '…' : ''}</span>
                    <span className="a-recent-email">{message.email}</span>
                  </div>
                  <span className="a-recent-date">{fmtDate(message.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="a-panel a-content-overview">
          <div className="a-section-head">
            <div><p className="a-eyebrow">Website content</p><h2>Content overview</h2></div>
          </div>
          <div className="a-content-items">
            <Link to="/admin/skills"><span className="a-content-icon"><Star size={18} /></span><span><strong>Expertise</strong><small>{stats.skills} items in your skill library</small></span><ArrowUpRight size={16} /></Link>
            <Link to="/admin/experience"><span className="a-content-icon"><Briefcase size={18} /></span><span><strong>Experience</strong><small>{stats.experience} entries on your timeline</small></span><ArrowUpRight size={16} /></Link>
            <Link to="/admin/resume"><span className="a-content-icon"><FileText size={18} /></span><span><strong>Resume</strong><small>{stats.resume ? `${stats.resume.fileName} · updated ${fmtDate(stats.resume.updatedAt)}` : 'No resume uploaded'}</small></span><ArrowUpRight size={16} /></Link>
          </div>
        </section>
      </div>
    </>
  );
}
