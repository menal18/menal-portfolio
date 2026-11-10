import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { required, email } from '../utils/validate.js';

export const submit = asyncHandler(async (req, res) => {
  const { name, email: from, subject = '', message, website } = req.body;
  // Honeypot: bots fill the hidden "website" field; pretend success
  if (website) return res.status(201).json({ message: 'Message sent' });
  required({ name, email: from, message }, ['name', 'email', 'message']);
  if (!email(from)) throw new AppError('Enter a valid email address', 400);
  if (String(message).length < 10) throw new AppError('Message should be at least 10 characters', 400);
  await ContactMessage.create({ name, email: from, subject, message });
  res.status(201).json({ message: 'Message sent' });
});

export const list = asyncHandler(async (_req, res) => res.json(await ContactMessage.find().sort({ createdAt: -1 })));

export const markRead = asyncHandler(async (req, res) => {
  const m = await ContactMessage.findByIdAndUpdate(req.params.id, { read: req.body.read !== false }, { new: true });
  if (!m) throw new AppError('Message not found', 404);
  res.json(m);
});

export const remove = asyncHandler(async (req, res) => {
  const m = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!m) throw new AppError('Message not found', 404);
  res.json({ message: 'Deleted' });
});
