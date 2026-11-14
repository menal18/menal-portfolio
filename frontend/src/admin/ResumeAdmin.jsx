import { useEffect, useState } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import api, { errMsg, resumeUrl } from '../services/api.js';
import { PageHeader, Spinner, fmtDate, useConfirm, useToast } from './ui.jsx';

export default function ResumeAdmin() {
  const toast = useToast();
  const confirm = useConfirm();
  const [meta, setMeta] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.get('/admin/resume').then((r) => setMeta(r.data)).catch((e) => toast(errMsg(e), 'error'));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const pick = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { toast('Choose a PDF file', 'error'); e.target.value = ''; return; }
    if (f.size > 10 * 1024 * 1024) { toast('The PDF is over 10 MB', 'error'); e.target.value = ''; return; }
    setFile(f);
  };
  const upload = async () => {
    const fd = new FormData();
    fd.append('resume', file);
    setBusy(true);
    try {
      const { data } = await api.post('/admin/resume', fd);
      toast(data.cleanupWarning
        ? `Resume uploaded, but the previous Cloudinary file could not be removed: ${data.cleanupWarning}`
        : 'Resume uploaded. The public download now serves this file.');
      setFile(null);
      load();
    } catch (e) { toast(errMsg(e), 'error'); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!await confirm({ title: 'Remove the resume?', message: 'The public resume download will no longer be available.', confirmLabel: 'Remove resume' })) return;
    try { await api.delete('/admin/resume'); toast('Resume removed'); load(); } catch (e) { toast(errMsg(e), 'error'); }
  };

  if (!meta) return <Spinner />;
  return (
    <>
      <PageHeader title="Resume" sub="Uploading a new PDF replaces the old one. The public download always serves the latest." />
      <section className="a-panel">
        <h2>Current file</h2>
        {meta.available ? (
          <>
            <p><strong>{meta.fileName}</strong> <span className="muted">{(meta.size / 1024).toFixed(0)} KB, uploaded {fmtDate(meta.updatedAt)}</span></p>
            <div className="a-actions">
              <a className="a-btn" href={resumeUrl} target="_blank" rel="noopener noreferrer"><Download size={16} /> Open public download</a>
              <button type="button" className="a-btn danger" onClick={remove}><Trash2 size={16} /> Remove</button>
            </div>
          </>
        ) : <p className="muted">No resume uploaded yet.</p>}
      </section>
      <section className="a-panel">
        <h2>{meta.available ? 'Replace resume' : 'Upload resume'}</h2>
        <label className="a-resume-upload" htmlFor="pdf">
          <span className="a-upload-icon"><Upload size={19} aria-hidden="true" /></span>
          <span><strong>{file?.name || 'Choose a PDF file'}</strong><small>PDF only · Maximum 10 MB</small></span>
          <input id="pdf" className="a-file-input" type="file" accept="application/pdf" onChange={pick} />
        </label>
        <button type="button" className="a-btn primary" disabled={!file || busy} onClick={upload}><Upload size={16} /> {busy ? 'Uploading...' : 'Upload resume'}</button>
      </section>
    </>
  );
}
