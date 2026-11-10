import { useState } from 'react';
import api, { errMsg } from '../services/api.js';
import { Field, PageHeader, useToast } from './ui.jsx';

export default function Account() {
  const toast = useToast();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api.put('/auth/password', { currentPassword: cur, newPassword: next }); toast('Password changed'); setCur(''); setNext(''); } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader title="Change password" />
      <form className="a-form narrow" onSubmit={submit}>
        <Field label="Current password" htmlFor="cp"><input id="cp" type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" required /></Field>
        <Field label="New password" hint="At least 10 characters" htmlFor="np"><input id="np" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={10} required /></Field>
        <div className="a-actions"><button className="a-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Update password'}</button></div>
      </form>
    </>
  );
}
