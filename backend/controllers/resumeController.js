// import Resume from '../models/Resume.js';
// import asyncHandler from '../utils/asyncHandler.js';
// import AppError from '../utils/AppError.js';
// import { uploadBuffer, verifyPublicDelivery, destroyAsset } from '../services/uploadService.js';

// const getResourceType = (resume) =>
//   resume.resourceType || (resume.url?.includes('/raw/upload/') ? 'raw' : 'image');

// export const meta = asyncHandler(async (_req, res) => {
//   const r = await Resume.findOne({ singleton: 'main' });
//   res.json(r ? { available: true, fileName: r.fileName, size: r.size, updatedAt: r.updatedAt, url: r.url } : { available: false });
// });

// // Public download always points at the most recent upload
// export const download = asyncHandler(async (_req, res) => {
//   const r = await Resume.findOne({ singleton: 'main' });
//   if (!r) throw new AppError('No resume has been uploaded yet', 404);
//   let url;
//   try {
//     url = new URL(r.url);
//   } catch {
//     throw new AppError('The stored resume URL is invalid. Please upload the PDF again.', 503);
//   }
//   if (url.protocol !== 'https:' || !r.publicId || !['image', 'raw'].includes(getResourceType(r))) {
//     throw new AppError('The stored resume is not available for public download. Please upload the PDF again.', 503);
//   }
//   res.set('Cache-Control', 'no-store');
//   res.redirect(302, url.toString());
// });


// export const upload = asyncHandler(async (req, res) => {
//   if (!req.file) {
//     throw new AppError('Please select a resume PDF.', 400);
//   }

//   if (req.file.mimetype !== 'application/pdf') {
//     throw new AppError('Only PDF files are allowed.', 400);
//   }

//   const existing = await Resume.findOne({ singleton: 'main' });

//   const result = await uploadBuffer(req.file.buffer, {
//     folder: 'resume',
//     resourceType: 'raw',
//     deliveryType: 'upload',
//     publicId: `resume-${Date.now()}.pdf`,
//   });

//   try {
//     await verifyPublicDelivery(result.secure_url, 'application/pdf');
//   } catch (err) {
//     try {
//       await destroyAsset(result.public_id, 'raw', 'upload', { strict: true });
//     } catch (cleanupErr) {
//       console.error(`Resume delivery verification failed and the new Cloudinary asset could not be removed: ${cleanupErr.message}`);
//     }
//     throw err;
//   }

//   const fileName = (req.file.originalname || 'Menal-Resume.pdf')
//     .replace(/[^\w.\- ]+/g, '_');

//   let doc;

//   try {
//     doc = await Resume.findOneAndUpdate(
//       { singleton: 'main' },
//       {
//         url: result.secure_url,
//         publicId: result.public_id,
//         resourceType: 'raw',
//         fileName,
//         size: req.file.size,
//       },
//       {
//         upsert: true,
//         new: true,
//         setDefaultsOnInsert: true,
//       }
//     );
//   } catch (err) {
//     try {
//       await destroyAsset(result.public_id, 'raw', 'upload', {
//         strict: true,
//       });
//     } catch (cleanupErr) {
//       console.error('New resume cleanup failed:', cleanupErr.message);
//     }

//     throw err;
//   }

//   if (existing?.publicId) {
//     try {
//       await destroyAsset(
//         existing.publicId,
//         getResourceType(existing),
//         'upload',
//         { strict: true }
//       );
//     } catch (err) {
//       console.error('Old resume cleanup failed:', err.message);
//     }
//   }

//   res.status(201).json(doc);
// });


// export const remove = asyncHandler(async (_req, res) => {
//   const r = await Resume.findOne({ singleton: 'main' });
//   if (!r) throw new AppError('No resume to remove', 404);
//   await destroyAsset(r.publicId, getResourceType(r), 'upload', { strict: true });
//   await r.deleteOne();
//   res.json({ message: 'Resume removed' });
// });

import Resume from '../models/Resume.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { destroyAsset } from '../services/uploadService.js';

export const meta = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  res.json(
    r
      ? { available: true, fileName: r.fileName, size: r.size, updatedAt: r.updatedAt }
      : { available: false }
  );
});

// Public download: streams the PDF straight from the backend
export const download = asyncHandler(async (req, res) => {
  const r = await Resume.findOne({ singleton: 'main' }).select('+data');
  if (!r || !r.data?.length) throw new AppError('No resume has been uploaded yet', 404);

  const safeName = (r.fileName || 'Menal-Resume.pdf').replace(/[^\w.\- ]+/g, '_');
  const disposition = req.query.download === '1' ? 'attachment' : 'inline';
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': r.data.length,
    'Content-Disposition': `${disposition}; filename="${safeName}"`,
    'Cache-Control': 'no-store',
  });
  res.send(r.data);
});

export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Please select a resume PDF.', 400);
  if (req.file.mimetype !== 'application/pdf') throw new AppError('Only PDF files are allowed.', 400);

  const existing = await Resume.findOne({ singleton: 'main' });
  const fileName = (req.file.originalname || 'Menal-Resume.pdf').replace(/[^\w.\- ]+/g, '_');

  const doc = await Resume.findOneAndUpdate(
    { singleton: 'main' },
    {
      data: req.file.buffer,
      contentType: 'application/pdf',
      fileName,
      size: req.file.size,
      $unset: { url: '', publicId: '', resourceType: '' },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Clean up an old Cloudinary copy, if there was one (best effort)
  if (existing?.publicId) {
    destroyAsset(existing.publicId, existing.resourceType || 'raw', 'upload').catch(() => {});
  }

  res.status(201).json({
    available: true,
    fileName: doc.fileName,
    size: doc.size,
    updatedAt: doc.updatedAt,
  });
});

export const remove = asyncHandler(async (_req, res) => {
  const r = await Resume.findOne({ singleton: 'main' });
  if (!r) throw new AppError('No resume to remove', 404);
  if (r.publicId) {
    await destroyAsset(r.publicId, r.resourceType || 'raw', 'upload').catch(() => {});
  }
  await r.deleteOne();
  res.json({ message: 'Resume removed' });
});