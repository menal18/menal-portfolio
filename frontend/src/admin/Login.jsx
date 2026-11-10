import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import '../styles/admin.css';

export default function Login() {
  const { admin, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      await login(u, p);
      nav(loc.state?.from || '/admin', { replace: true });
    } catch (x) {
      setErr(errMsg(x));
    } finally { setBusy(false); }
  };

  return (
    <div className="admin login-wrap">
      <form className="login" onSubmit={submit}>
        <div className="a-brand big">Menal<span>.</span></div>
        <p className="muted">Admin sign in</p>
        <div className="a-field"><label htmlFor="u">Username or email</label><input id="u" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required autoFocus /></div>
        <div className="a-field"><label htmlFor="p">Password</label><input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required /></div>
        {err && <p className="a-error" role="alert">{err}</p>}
        <button className="a-btn primary" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  );
}
