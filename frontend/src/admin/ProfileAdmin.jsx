import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api.js';
import { Field, ImagePicker, PageHeader, Spinner, useToast } from './ui.jsx';

const SOCIALS = ['github', 'linkedin', 'instagram', 'twitter', 'facebook', 'youtube', 'website'];

export default function ProfileAdmin() {
  const toast = useToast();
  const [p, setP] = useState(null);
  const [titles, setTitles] = useState('');
  const [portrait, setPortrait] = useState(null);
  const [newPortrait, setNewPortrait] = useState([]);
  const [rm, setRm] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/admin/profile').then(({ data }) => { setP(data); setTitles((data.titles || []).join(', ')); setPortrait(data.portrait?.url ? data.portrait : null); }).catch((e) => toast(errMsg(e), 'error'));
  }, [toast]);

  if (!p) return <Spinner />;
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.value }));
  const setIn = (g, k) => (e) => setP((x) => ({ ...x, [g]: { ...x[g], [k]: e.target.value } }));

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    ['name', 'tagline', 'aboutHeading', 'aboutBody'].forEach((k) => fd.append(k, p[k] ?? ''));
    fd.append('titles', titles);
    fd.append('contact', JSON.stringify(p.contact || {}));
    fd.append('social', JSON.stringify(Object.fromEntries(SOCIALS.map((s) => [s, p.social?.[s] || '']))));
    if (newPortrait[0]) fd.append('portrait', newPortrait[0]);
    else if (rm.length) fd.append('removePortrait', 'true');
    setBusy(true);
    try {
      const { data } = await api.put('/admin/profile', fd);
      setP(data); setPortrait(data.portrait?.url ? data.portrait : null); setNewPortrait([]); setRm([]);
      toast('Profile saved. The public site is updated.');
    } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="About and contact" sub="Home hero, About section, contact details and social links." />
      <form className="a-form" onSubmit={submit}>
        <div className="a-cols">
          <Field label="Name" htmlFor="n"><input id="n" value={p.name} onChange={set('name')} /></Field>
          <Field label="Rotating titles" hint="Comma separated. Shown in the hero." htmlFor="tt"><input id="tt" value={titles} onChange={(e) => setTitles(e.target.value)} /></Field>
        </div>
        <Field label="Hero tagline" hint="Optional line above the name" htmlFor="tg"><input id="tg" value={p.tagline} onChange={set('tagline')} /></Field>
        <Field label="About heading" htmlFor="ah"><input id="ah" value={p.aboutHeading} onChange={set('aboutHeading')} /></Field>
        <Field label="About text" hint="Blank lines start a new paragraph." htmlFor="ab"><textarea id="ab" rows={9} value={p.aboutBody} onChange={set('aboutBody')} /></Field>
        <ImagePicker label="Portrait" existing={portrait ? [{ ...portrait, _id: undefined }] : []} removed={rm} setRemoved={setRm} files={newPortrait} setFiles={setNewPortrait} />
        <h2>Contact</h2>
        <div className="a-cols">
          <Field label="Email" htmlFor="ce"><input id="ce" type="email" value={p.contact?.email || ''} onChange={setIn('contact', 'email')} /></Field>
          <Field label="Phone" htmlFor="cp"><input id="cp" value={p.contact?.phone || ''} onChange={setIn('contact', 'phone')} /></Field>
          <Field label="Location" htmlFor="cl"><input id="cl" value={p.contact?.location || ''} onChange={setIn('contact', 'location')} /></Field>
        </div>
        <Field label="Availability note" htmlFor="ca"><input id="ca" value={p.contact?.availability || ''} onChange={setIn('contact', 'availability')} /></Field>
        <h2>Social links</h2>
        <div className="a-cols">
          {SOCIALS.map((s) => (
            <Field key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} htmlFor={`s-${s}`}><input id={`s-${s}`} type="url" placeholder="https://" value={p.social?.[s] || ''} onChange={setIn('social', s)} /></Field>
          ))}
        </div>
        <div className="a-actions"><button className="a-btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button></div>
      </form>
    </>
  );
}
