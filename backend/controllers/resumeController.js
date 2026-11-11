import Resume from '../models/Resume.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { uploadBuffer, verifyPublicDelivery, destroyAsset } from '../services/uploadService.js';

const getResourceType = (resume) =>
  resume.resourceType || (resume.url?.includes('/raw/upload/') ? 'raw' : 'image');

export const meta = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  res.json(r ? { available: true, fileName: r.fileName, size: r.size, updatedAt: r.updatedAt, url: r.url } : { available: false });
});

// Public download always points at the most recent upload
export const download = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  if (!r) throw new AppError('No resume has been uploaded yet', 404);
  let url;
  try {
    url = new URL(r.url);
  } catch {
    throw new AppError('The stored resume URL is invalid. Please upload the PDF again.', 503);
  }
  if (url.protocol !== 'https:' || !r.publicId || !['image', 'raw'].includes(getResourceType(r))) {
    throw new AppError('The stored resume is not available for public download. Please upload the PDF again.', 503);
  }
  res.set('Cache-Control', 'no-store');
  res.redirect(302, url.toString());
});

export const upload = asyncHandler(async (req, res) => {
  const existing = await Resume.findOne({ singleton: 'main' });
  const result = await uploadBuffer(req.file.buffer, {
    folder: 'resume',
    resourceType: 'image',
    deliveryType: 'upload',
    publicId: `resume-${Date.now()}`,
  });
  try {
    await verifyPublicDelivery(result.secure_url, 'application/pdf');
  } catch (err) {
    try {
      await destroyAsset(result.public_id, 'image', 'upload', { strict: true });
    } catch (cleanupErr) {
      console.error(`Public resume delivery verification failed and the new Cloudinary asset could not be removed: ${cleanupErr.message}`);
    }
    throw err;
  }
  const fileName = (req.file.originalname || 'Menal-Resume.pdf').replace(/[^\w.\- ]+/g, '_');
  let doc;
  try {
    doc = await Resume.findOneAndUpdate(
      { singleton: 'main' },
      {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: 'image',
        fileName,
        size: req.file.size,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    try {
      await destroyAsset(result.public_id, 'image', 'upload', { strict: true });
    } catch (cleanupErr) {
      console.error(`Resume database save failed and the new Cloudinary asset could not be removed: ${cleanupErr.message}`);
    }
    throw err;
  }
  let cleanupWarning;
  if (existing?.publicId) {
    try {
      await destroyAsset(existing.publicId, getResourceType(existing), 'upload', { strict: true });
    } catch (err) {
      cleanupWarning = err.message;
      console.error(`Resume replaced, but the previous Cloudinary asset could not be removed: ${err.message}`);
    }
  }
  res.status(201).json({ ...doc.toObject(), ...(cleanupWarning ? { cleanupWarning } : {}) });
});

export const remove = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  if (!r) throw new AppError('No resume to remove', 404);
  await destroyAsset(r.publicId, getResourceType(r), 'upload', { strict: true });
  await r.deleteOne();
  res.json({ message: 'Resume removed' });
});
