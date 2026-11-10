import AppError from './AppError.js';

export const required = (obj, fields) => {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || String(obj[f]).trim() === '');
  if (missing.length) throw new AppError(`Missing required field(s): ${missing.join(', ')}`, 400);
};
export const email = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || ''));
export const urls = (obj, fields) => {
  for (const f of fields) {
    const v = obj[f];
    if (v) {
      try {
        const u = new URL(v);
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error('bad');
      } catch {
        throw new AppError(`${f} must be a valid http(s) URL`, 400);
      }
    }
  }
};
