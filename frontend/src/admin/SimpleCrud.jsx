import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { Empty, Field, PageHeader, Spinner, useToast } from './ui.jsx';

// Config-driven list + inline form used for categories, skills and experience
function CrudPage({ title, sub, endpoint, blank, fields, line, noun, arrayFields = [] }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api.get(`/admin/${endpoint}`).then((r) => setItems(r.data)).catch((e) => toast(errMsg(e), 'error')), [endpoint, toast]);
  useEffect(() => { load(); }, [load]);

  const reset = () => { setForm(blank); setEditing(null); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      for (const name of arrayFields) {
        payload[name] = String(form[name] ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
      }
      if (editing) await api.put(`/admin/${endpoint}/${editing}`, payload); else await api.post(`/admin/${endpoint}`, payload);
      toast(editing ? `${noun} updated` : `${noun} added`);
      reset(); load();
    } catch (x) { toast(errMsg(x), 'error'); } finally { setBusy(false); }
  };
  const del = async (it) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}?`)) return;
    try { await api.delete(`/admin/${endpoint}/${it._id}`); toast(`${noun} deleted`); if (editing === it._id) reset(); load(); } catch (x) { toast(errMsg(x), 'error'); }
  };
  const edit = (it) => {
    setEditing(it._id);
    setForm(Object.fromEntries(Object.keys(blank).map((k) => [
      k,
      arrayFields.includes(k) && Array.isArray(it[k])
        ? it[k].join(', ')
        : it[k] ?? blank[k],
    ])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader title={title} sub={sub} />
      <form className="a-form inline" onSubmit={submit}>
        <h2>{editing ? `Edit ${noun.toLowerCase()}` : `Add ${noun.toLowerCase()}`}</h2>
        <div className="a-cols">
          {fields.map((fl) => fl.type === 'checkbox' ? (
            <label key={fl.name} className="a-check"><input type="checkbox" checked={!!form[fl.name]} onChange={set(fl.name)} /> {fl.label}</label>
          ) : (
            <Field key={fl.name} label={fl.label} hint={fl.hint} htmlFor={`f-${fl.name}`}>
              {fl.type === 'select' ? (
                <select id={`f-${fl.name}`} value={form[fl.name]} onChange={set(fl.name)}>{fl.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
              ) : fl.type === 'textarea' ? (
                <textarea id={`f-${fl.name}`} rows={3} value={form[fl.name]} onChange={set(fl.name)} />
              ) : (
                <input id={`f-${fl.name}`} type={fl.type || 'text'} min={fl.min} max={fl.max} value={form[fl.name]} onChange={set(fl.name)} required={fl.required} />
              )}
            </Field>
          ))}
        </div>
        <div className="a-actions">
          <button className="a-btn primary" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : `Add ${noun.toLowerCase()}`}</button>
          {editing && <button type="button" className="a-btn" onClick={reset}>Cancel</button>}
        </div>
      </form>
      {!items ? <Spinner /> : items.length === 0 ? <Empty>Nothing here yet.</Empty> : (
        <ul className="a-rows plain">
          {items.map((it) => (
            <li key={it._id}>
              <div className="a-row-main">{line(it)}</div>
              <div className="a-row-actions">
                <button type="button" className="icon-btn" aria-label="Edit" onClick={() => edit(it)}><Pencil size={16} /></button>
                <button type="button" className="icon-btn danger" aria-label="Delete" onClick={() => del(it)}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export const Categories = () => (
  <CrudPage title="Categories" sub="Used to group projects. A category in use cannot be deleted." endpoint="categories" noun="Category"
    blank={{ name: '', order: 0 }}
    fields={[{ name: 'name', label: 'Name', required: true }, { name: 'order', label: 'Order', type: 'number' }]}
    line={(c) => <><strong>{c.name}</strong><span className="muted">/{c.slug}</span></>} />
);

export const Skills = () => (
  <CrudPage title="Expertise" sub="Manage the active items shown in the public Expertise section." endpoint="skills" noun="Expertise"
    blank={{ name: '', group: 'Development', description: '', technologies: '', icon: 'Sparkles', active: true, level: 0, order: 0 }}
    arrayFields={['technologies']}
    fields={[
      { name: 'name', label: 'Expertise name', required: true },
      { name: 'group', label: 'Group', type: 'select', options: ['Development', 'Marketing', 'Creative', 'Tools'] },
      { name: 'description', label: 'Short description', type: 'textarea', hint: 'Describe this area of expertise.' },
      { name: 'technologies', label: 'Technologies or tools', hint: 'Separate items with commas.' },
      { name: 'icon', label: 'Icon', type: 'select', options: ['Code2', 'Database', 'Server', 'Megaphone', 'Palette', 'Smartphone', 'Cloud', 'Wrench', 'Globe', 'Sparkles', 'Shapes', 'Layers'] },
      { name: 'level', label: 'Level (0-100)', type: 'number', min: 0, max: 100, hint: '0 hides the bar' },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'active', label: 'Show on public website', type: 'checkbox' },
    ]}
    line={(s) => <><strong>{s.name}</strong><span className="muted">{s.group}{s.active === false ? ', Inactive' : ', Active'}{s.level ? `, ${s.level}%` : ''}</span></>} />
);

export const ExperienceAdmin = () => (
  <CrudPage title="Experience" sub="Listed in the order below (lower order first)." endpoint="experience" noun="Entry"
    blank={{ role: '', organization: '', location: '', startDate: '', endDate: '', current: false, kind: 'work', description: '', order: 0 }}
    fields={[
      { name: 'role', label: 'Role or title', required: true },
      { name: 'organization', label: 'Organization' },
      { name: 'location', label: 'Location' },
      { name: 'startDate', label: 'Start', required: true, hint: 'e.g. Jun 2024' },
      { name: 'endDate', label: 'End', hint: 'Leave empty if current' },
      { name: 'current', label: 'I currently do this', type: 'checkbox' },
      { name: 'kind', label: 'Type', type: 'select', options: ['work', 'education', 'other'] },
      { name: 'order', label: 'Order', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ]}
    line={(x) => <><strong>{x.role}</strong><span className="muted">{[x.organization, `${x.startDate} to ${x.current ? 'Present' : x.endDate || '?'}`].filter(Boolean).join(', ')}</span></>} />
);
