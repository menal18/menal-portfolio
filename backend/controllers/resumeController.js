import Resume from '../models/Resume.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { uploadBuffer, destroyAsset } from '../services/uploadService.js';

export const meta = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  res.json(r ? { available: true, fileName: r.fileName, size: r.size, updatedAt: r.updatedAt, url: r.url } : { available: false });
});

// Public download always points at the most recent upload
export const download = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  if (!r) throw new AppError('No resume has been uploaded yet', 404);
  res.set('Cache-Control', 'no-store');
  res.redirect(302, r.url);
});

export const upload = asyncHandler(async (req, res) => {
  const existing = await Resume.findOne({ singleton: 'main' });
  const result = await uploadBuffer(req.file.buffer, {
    folder: 'resume',
    resourceType: 'raw',
    publicId: `resume-${Date.now()}.pdf`,
  });
  const fileName = (req.file.originalname || 'Menal-Resume.pdf').replace(/[^\w.\- ]+/g, '_');
  const doc = await Resume.findOneAndUpdate(
    { singleton: 'main' },
    { url: result.secure_url, publicId: result.public_id, fileName, size: req.file.size },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (existing?.publicId) await destroyAsset(existing.publicId, 'raw');
  res.status(201).json(doc);
});

export const remove = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  if (!r) throw new AppError('No resume to remove', 404);
  await destroyAsset(r.publicId, 'raw');
  await r.deleteOne();
  res.json({ message: 'Resume removed' });
});
