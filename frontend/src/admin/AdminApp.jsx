import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { BarChart3, Briefcase, FileText, FolderKanban, Globe, Inbox, LogOut, Megaphone, Menu, Palette, Sparkles, Tag, User, X, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ToastProvider } from './ui.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import { ProjectList, ProjectForm } from './Projects.jsx';
import { CampaignList, CampaignForm } from './Campaigns.jsx';
import { Categories, Skills, ExperienceAdmin } from './SimpleCrud.jsx';
import ProfileAdmin from './ProfileAdmin.jsx';
import ResumeAdmin from './ResumeAdmin.jsx';
import Messages from './Messages.jsx';
import Account from './Account.jsx';
import Appearance from './Appearance.jsx';
import '../styles/admin.css';

const NAV = [
  ['/admin', 'Overview', BarChart3, true],
  ['/admin/projects', 'Projects', FolderKanban],
  ['/admin/categories', 'Categories', Tag],
  ['/admin/marketing', 'Marketing', Megaphone],
  ['/admin/profile', 'About and contact', User],
  ['/admin/appearance', 'Appearance & Design', Palette],
  ['/admin/skills', 'Expertise', Sparkles],
  ['/admin/experience', 'Experience', Briefcase],
  ['/admin/resume', 'Resume', FileText],
  ['/admin/messages', 'Enquiries', Inbox],
  ['/admin/account', 'Password', KeyRound],
];

function Shell() {
  const { admin, checking, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  if (checking) return <div className="admin"><p className="a-loading">Checking session...</p></div>;
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  return (
    <div className="admin">
      <header className="a-top">
        <button type="button" className="icon-btn" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <strong>Menal. admin</strong>
      </header>
      <aside className={`a-side ${open ? 'open' : ''}`}>
        <div className="a-brand">Menal<span>.</span> <small>admin</small></div>
        <nav>
          {NAV.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer"><Globe size={18} /> View site</a>
          <button type="button" onClick={logout}><LogOut size={18} /> Sign out</button>
        </div>
      </aside>
      {open && <div className="a-scrim" onClick={() => setOpen(false)} />}
      <main className="a-main"><Outlet /></main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/:id" element={<ProjectForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="marketing" element={<CampaignList />} />
          <Route path="marketing/new" element={<CampaignForm />} />
          <Route path="marketing/:id" element={<CampaignForm />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="appearance" element={<Appearance />} />
          <Route path="skills" element={<Skills />} />
          <Route path="experience" element={<ExperienceAdmin />} />
          <Route path="resume" element={<ResumeAdmin />} />
          <Route path="messages" element={<Messages />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
