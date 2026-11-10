import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2, Undo2 } from 'lucide-react';

/* ---------- toasts ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, type = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, message, type }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), type === 'error' ? 6500 : 3200);
  }, []);
  const value = useMemo(() => push, [push]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- layout bits ---------- */
export const PageHeader = ({ title, children, sub }) => (
  <div className="a-head">
    <div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div>
    <div className="a-head-actions">{children}</div>
  </div>
);

export const Empty = ({ children }) => <p className="a-empty">{children}</p>;

export function Field({ label, hint, children, htmlFor }) {
  return (
    <div className="a-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }) {
  return <p className="a-loading" role="status">{label}...</p>;
}

/* ---------- image picker (existing + new, with client-side validation) ---------- */
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX = 8 * 1024 * 1024;

export function ImagePicker({ label, hint, existing = [], removed, setRemoved, files, setFiles, multiple = false }) {
  const toast = useToast();
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const onPick = (e) => {
    const picked = [...e.target.files];
    e.target.value = '';
    const good = [];
    for (const f of picked) {
      if (!OK_TYPES.includes(f.type)) { toast(`${f.name}: use JPG, PNG, WebP, GIF or AVIF`, 'error'); continue; }
      if (f.size > MAX) { toast(`${f.name} is over 8 MB`, 'error'); continue; }
      good.push(f);
    }
    setFiles(multiple ? [...files, ...good] : good.slice(0, 1));
  };
  const toggle = (id) => setRemoved(removed.includes(id) ? removed.filter((x) => x !== id) : [...removed, id]);

  return (
    <div className="a-field">
      <label>{label}</label>
      <div className="thumbs">
        {existing.map((im) => (
          <figure key={im._id || im.url} className={removed.includes(im._id || 'cover') ? 'gone' : ''}>
            <img src={im.url} alt="" />
            <button type="button" className="thumb-x" onClick={() => toggle(im._id || 'cover')} aria-label={removed.includes(im._id || 'cover') ? 'Keep image' : 'Remove image'}>
              {removed.includes(im._id || 'cover') ? <Undo2 size={14} /> : <Trash2 size={14} />}
            </button>
          </figure>
        ))}
        {previews.map((u, i) => (
          <figure key={u} className="new">
            <img src={u} alt="" />
            <button type="button" className="thumb-x" onClick={() => setFiles(files.filter((_, k) => k !== i))} aria-label="Discard new image"><Trash2 size={14} /></button>
          </figure>
        ))}
        <label className="thumb-add">
          <ImagePlus size={20} /><span>{multiple ? 'Add images' : existing.length || files.length ? 'Replace' : 'Choose image'}</span>
          <input type="file" accept={OK_TYPES.join(',')} multiple={multiple} onChange={onPick} hidden />
        </label>
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export const fmtDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
