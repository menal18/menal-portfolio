import Profile from '../models/Profile.js';
import asyncHandler from '../utils/asyncHandler.js';
import { toList, toBool, toJSON } from '../utils/parse.js';
import { urls, email } from '../utils/validate.js';
import AppError from '../utils/AppError.js';
import { uploadImage, destroyAsset } from '../services/uploadService.js';

export const getProfileDoc = async () => (await Profile.findOne({ singleton: 'main' })) || Profile.create({ singleton: 'main' });

export const getProfile = asyncHandler(async (_req, res) => res.json(await getProfileDoc()));

export const updateProfile = asyncHandler(async (req, res) => {
  const p = await getProfileDoc();
  const b = req.body;
  for (const k of ['name', 'tagline', 'aboutHeading', 'aboutBody']) if (b[k] !== undefined) p[k] = String(b[k]);
  if (b.titles !== undefined) {
    const t = toList(b.titles);
    if (t.length) p.titles = t;
  }
  const contact = toJSON(b.contact, null);
  if (contact) {
    if (contact.email && !email(contact.email)) throw new AppError('Contact email is not valid', 400);
    p.contact = { ...p.contact.toObject(), ...contact };
  }
  const social = toJSON(b.social, null);
  if (social) {
    urls(social, Object.keys(social));
    p.social = { ...p.social.toObject(), ...social };
  }
  if (req.file) {
    const old = p.portrait?.publicId;
    p.portrait = await uploadImage(req.file, 'profile');
    await destroyAsset(old);
  } else if (toBool(b.removePortrait)) {
    await destroyAsset(p.portrait?.publicId);
    p.portrait = undefined;
  }
  await p.save();
  res.json(p);
});
