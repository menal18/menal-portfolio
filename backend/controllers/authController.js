import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { required } from '../utils/validate.js';

const sign = (admin) => jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const login = asyncHandler(async (req, res) => {
  required(req.body, ['username', 'password']);
  const id = String(req.body.username).toLowerCase().trim();
  const admin = await Admin.findOne({ $or: [{ username: id }, { email: id }] });
  // Same message for unknown user and wrong password
  if (!admin || !(await admin.matchPassword(String(req.body.password)))) throw new AppError('Invalid username or password', 401);
  admin.lastLoginAt = new Date();
  await admin.save();
  res.json({ token: sign(admin), admin: { id: admin._id, username: admin.username, email: admin.email } });
});

export const me = (req, res) => res.json({ admin: req.admin });

export const changePassword = asyncHandler(async (req, res) => {
  required(req.body, ['currentPassword', 'newPassword']);
  if (String(req.body.newPassword).length < 10) throw new AppError('New password must be at least 10 characters', 400);
  const admin = await Admin.findById(req.admin._id);
  if (!(await admin.matchPassword(String(req.body.currentPassword)))) throw new AppError('Current password is incorrect', 401);
  admin.password = String(req.body.newPassword);
  await admin.save();
  res.json({ message: 'Password updated' });
});
