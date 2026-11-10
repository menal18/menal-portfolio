import multer from 'multer';
import AppError from '../utils/AppError.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const make = (allowed, maxMB, label) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMB * 1024 * 1024, files: 20 },
    fileFilter: (_req, file, cb) =>
      allowed.includes(file.mimetype) ? cb(null, true) : cb(new AppError(`${file.originalname}: only ${label} files are allowed`, 415)),
  });

export const imageUpload = make(IMAGE_TYPES, 8, 'JPG, PNG, WebP, GIF or AVIF image');
export const pdfUpload = make(['application/pdf'], 10, 'PDF');

// Extra check: confirm the PDF magic bytes, not just the client-declared MIME type
export const verifyPdf = (req, _res, next) => {
  if (!req.file) return next(new AppError('Choose a PDF file to upload', 400));
  if (req.file.buffer.slice(0, 5).toString() !== '%PDF-') return next(new AppError('That file is not a valid PDF', 415));
  next();
};
