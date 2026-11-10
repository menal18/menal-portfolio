import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Authentication required', 401);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Session expired or invalid. Sign in again.', 401);
  }
  const admin = await Admin.findById(payload.id).select('-password');
  if (!admin) throw new AppError('Account no longer exists', 401);
  req.admin = admin;
  next();
});

// Authorization: only role "admin" may use write routes
export const adminOnly = (req, _res, next) => {
  if (req.admin?.role !== 'admin') return next(new AppError('Forbidden', 403));
  next();
};
