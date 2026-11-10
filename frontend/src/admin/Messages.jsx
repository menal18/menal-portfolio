import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { Empty, PageHeader, Spinner, fmtDate, useToast } from './ui.jsx';

export default function Messages() {
  const toast = useToast();
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null);
  const load = useCallback(() => api.get('/admin/messages').then((r) => setList(r.data)).catch((e) => toast(errMsg(e), 'error')), [toast]);
  useEffect(() => { load(); }, [load]);

  const mark = async (m, read) => { try { await api.patch(`/admin/messages/${m._id}`, { read }); load(); } catch (e) { toast(errMsg(e), 'error'); } };
  const toggle = (m) => { setOpen(open === m._id ? null : m._id); if (!m.read) mark(m, true); };
  const del = async (m) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try { await api.delete(`/admin/messages/${m._id}`); toast('Deleted'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  return (
    <>
      <PageHeader title="Enquiries" sub="Messages sent from the contact form." />
      {!list ? <Spinner /> : list.length === 0 ? <Empty>No enquiries yet.</Empty> : (
        <ul className="a-rows plain msgs">
          {list.map((m) => (
            <li key={m._id} className={m.read ? '' : 'unread'}>
              <button type="button" className="msg-head" onClick={() => toggle(m)} aria-expanded={open === m._id}>
                {m.read ? <MailOpen size={18} /> : <Mail size={18} />}
                <span className="a-row-main"><strong>{m.name}</strong><span className="muted">{m.subject || m.message.slice(0, 70)}</span></span>
                <span className="muted small">{fmtDate(m.createdAt)}</span>
              </button>
              {open === m._id && (
                <div className="msg-body">
                  <p className="muted">{m.email}</p>
                  {m.subject && <p><strong>{m.subject}</strong></p>}
                  <p className="pre">{m.message}</p>
                  <div className="a-actions">
                    <a className="a-btn primary" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message'}`)}`}>Reply</a>
                    <button type="button" className="a-btn" onClick={() => mark(m, !m.read)}>{m.read ? 'Mark unread' : 'Mark read'}</button>
                    <button type="button" className="a-btn danger" onClick={() => del(m)}><Trash2 size={16} /> Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
