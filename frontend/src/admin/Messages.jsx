import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import api, { errMsg } from '../services/api.js';
import { Empty, PageHeader, Spinner, fmtDate, useConfirm, useToast } from './ui.jsx';

export default function Messages() {
  const toast = useToast();
  const confirm = useConfirm();
  const [list, setList] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/messages');
      setList(data);
      setSelectedId((current) => current && data.some((message) => message._id === current)
        ? current
        : data[0]?._id || null);
    } catch (cause) {
      toast(errMsg(cause), 'error');
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(
    () => list?.find((message) => message._id === selectedId) || null,
    [list, selectedId]
  );
  const unreadCount = list?.filter((message) => !message.read).length || 0;

  const mark = async (message, read) => {
    try {
      const { data } = await api.patch(`/admin/messages/${message._id}`, { read });
      setList((current) => current?.map((item) => item._id === data._id ? data : item) || current);
    } catch (cause) {
      toast(errMsg(cause), 'error');
    }
  };

  const select = (message) => {
    setSelectedId(message._id);
    if (!message.read) mark(message, true);
  };

  const del = async (message) => {
    if (!await confirm({ title: 'Delete this enquiry?', message: 'The message will be permanently removed from your inbox.', confirmLabel: 'Delete enquiry' })) return;
    try {
      await api.delete(`/admin/messages/${message._id}`);
      toast('Enquiry deleted');
      setSelectedId((current) => current === message._id ? null : current);
      await load();
    } catch (cause) {
      toast(errMsg(cause), 'error');
    }
  };

  return (
    <>
      <PageHeader title="Enquiries" sub="Messages sent through your portfolio contact form.">
        {list && <div className="a-inbox-counts"><span>{list.length} total</span><span className={unreadCount ? 'has-unread' : ''}>{unreadCount} unread</span></div>}
      </PageHeader>
      {!list ? <Spinner /> : list.length === 0 ? (
        <Empty>Your inbox is clear. New contact messages will appear here.</Empty>
      ) : (
        <section className="a-inbox" aria-label="Enquiry inbox">
          <div className="a-inbox-list">
            <div className="a-inbox-list-head">
              <span>Messages</span>
              <span>{list.length}</span>
            </div>
            <ul>
              {list.map((message) => (
                <li key={message._id}>
                  <button
                    type="button"
                    className={`a-inbox-item${selectedId === message._id ? ' selected' : ''}${!message.read ? ' unread' : ''}`}
                    onClick={() => select(message)}
                    aria-pressed={selectedId === message._id}
                  >
                    <span className="a-message-avatar" aria-hidden="true">{message.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    <span className="a-inbox-item-copy">
                      <span className="a-inbox-item-top"><strong>{message.name}</strong><time>{fmtDate(message.createdAt)}</time></span>
                      <span className="a-inbox-subject">{message.subject || 'No subject'}</span>
                      <span className="a-inbox-preview">{message.message}</span>
                    </span>
                    {!message.read && <span className="a-unread-dot" aria-label="Unread" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selected ? (
            <article className="a-message-detail">
              <header className="a-message-detail-head">
                <div>
                  <span className={`a-read-label ${selected.read ? '' : 'unread'}`}>
                    {selected.read ? <MailOpen size={14} /> : <Mail size={14} />}
                    {selected.read ? 'Read message' : 'Unread message'}
                  </span>
                  <h2>{selected.subject || 'No subject'}</h2>
                </div>
                <time>{fmtDate(selected.createdAt)}</time>
              </header>
              <div className="a-message-sender">
                <span className="a-message-avatar large" aria-hidden="true">{selected.name?.charAt(0)?.toUpperCase() || '?'}</span>
                <div><strong>{selected.name}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              </div>
              <p className="a-message-content">{selected.message}</p>
              <div className="a-message-actions">
                <a className="a-btn primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Your message'}`)}`}>Reply by email</a>
                <button type="button" className="a-btn" onClick={() => mark(selected, !selected.read)}>{selected.read ? 'Mark unread' : 'Mark read'}</button>
                <button type="button" className="a-btn danger" onClick={() => del(selected)}><Trash2 size={16} /> Delete</button>
              </div>
            </article>
          ) : (
            <div className="a-message-placeholder"><Mail size={25} /><p>Select a message to read it.</p></div>
          )}
        </section>
      )}
    </>
  );
}
