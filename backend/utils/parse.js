// multipart form fields arrive as strings; these helpers normalise them
export const toBool = (v) => v === true || v === 'true' || v === '1' || v === 'on';
export const toList = (v) => {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v !== 'string') return [];
  const t = v.trim();
  if (t.startsWith('[')) {
    try { return JSON.parse(t).map((s) => String(s).trim()).filter(Boolean); } catch { /* fall through */ }
  }
  return t.split(',').map((s) => s.trim()).filter(Boolean);
};
export const toJSON = (v, fallback) => {
  if (v === undefined || v === '') return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};
export const isHttpUrl = (v) => {
  if (!v) return true;
  try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
};
