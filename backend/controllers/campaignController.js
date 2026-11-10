import MarketingCampaign from '../models/MarketingCampaign.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import pick from '../utils/pick.js';
import uniqueSlug from '../utils/uniqueSlug.js';
import { toBool, toJSON } from '../utils/parse.js';
import { required, urls } from '../utils/validate.js';
import { uploadImage, uploadImages, destroyAsset } from '../services/uploadService.js';

const TYPES = ['Campaign', 'Creative', 'SEO', 'Social Media', 'Content'];
const FIELDS = ['title', 'type', 'client', 'platform', 'summary', 'description', 'seoWork', 'socialContent', 'linkUrl', 'status', 'order'];
const cleanPerformance = (v) =>
  (toJSON(v, []) || []).filter((r) => r && (r.label || r.value)).map((r) => ({ label: String(r.label || '').trim(), value: String(r.value || '').trim(), note: String(r.note || '').trim() }));

export const listPublished = asyncHandler(async (_req, res) =>
  res.json(await MarketingCampaign.find({ status: 'published' }).sort({ featured: -1, order: 1, createdAt: -1 }).select('-creatives.publicId -coverImage.publicId')));

export const getPublished = asyncHandler(async (req, res) => {
  const c = await MarketingCampaign.findOne({ slug: req.params.slug, status: 'published' });
  if (!c) throw new AppError('Campaign not found', 404);
  res.json(c);
});

export const listAll = asyncHandler(async (_req, res) => res.json(await MarketingCampaign.find().sort({ order: 1, createdAt: -1 })));

export const getOne = asyncHandler(async (req, res) => {
  const c = await MarketingCampaign.findById(req.params.id);
  if (!c) throw new AppError('Campaign not found', 404);
  res.json(c);
});

const check = (b, partial) => {
  if (!partial) required(b, ['title']);
  urls(b, ['linkUrl']);
  if (b.type && !TYPES.includes(b.type)) throw new AppError(`Type must be one of: ${TYPES.join(', ')}`, 400);
  if (b.status && !['draft', 'published'].includes(b.status)) throw new AppError('Status must be draft or published', 400);
};

export const create = asyncHandler(async (req, res) => {
  check(req.body, false);
  const data = pick(req.body, FIELDS);
  data.featured = toBool(req.body.featured);
  data.performance = cleanPerformance(req.body.performance);
  data.slug = await uniqueSlug(MarketingCampaign, data.title);
  const files = req.files || {};
  if (files.coverImage?.[0]) data.coverImage = await uploadImage(files.coverImage[0], 'marketing');
  if (files.creatives?.length) data.creatives = await uploadImages(files.creatives, 'marketing/creatives');
  res.status(201).json(await MarketingCampaign.create(data));
});

export const update = asyncHandler(async (req, res) => {
  const c = await MarketingCampaign.findById(req.params.id);
  if (!c) throw new AppError('Campaign not found', 404);
  check(req.body, true);
  const data = pick(req.body, FIELDS);
  if (req.body.featured !== undefined) data.featured = toBool(req.body.featured);
  if (req.body.performance !== undefined) data.performance = cleanPerformance(req.body.performance);
  if (data.title && data.title !== c.title) data.slug = await uniqueSlug(MarketingCampaign, data.title, c._id);
  const files = req.files || {};
  if (files.coverImage?.[0]) {
    const old = c.coverImage?.publicId;
    data.coverImage = await uploadImage(files.coverImage[0], 'marketing');
    await destroyAsset(old);
  } else if (toBool(req.body.removeCover)) {
    await destroyAsset(c.coverImage?.publicId);
    data.coverImage = undefined;
  }
  const removeIds = toJSON(req.body.removeCreatives, []);
  if (removeIds.length) {
    await Promise.all(c.creatives.filter((g) => removeIds.includes(String(g._id))).map((g) => destroyAsset(g.publicId)));
    c.creatives = c.creatives.filter((g) => !removeIds.includes(String(g._id)));
  }
  if (files.creatives?.length) c.creatives.push(...(await uploadImages(files.creatives, 'marketing/creatives')));
  c.set(data);
  await c.save();
  res.json(c);
});

export const setStatus = asyncHandler(async (req, res) => {
  const c = await MarketingCampaign.findById(req.params.id);
  if (!c) throw new AppError('Campaign not found', 404);
  if (req.body.status !== undefined) {
    if (!['draft', 'published'].includes(req.body.status)) throw new AppError('Status must be draft or published', 400);
    c.status = req.body.status;
  }
  if (req.body.featured !== undefined) c.featured = toBool(req.body.featured);
  await c.save();
  res.json(c);
});

export const remove = asyncHandler(async (req, res) => {
  const c = await MarketingCampaign.findById(req.params.id);
  if (!c) throw new AppError('Campaign not found', 404);
  await Promise.all([c.coverImage?.publicId, ...c.creatives.map((g) => g.publicId)].filter(Boolean).map((id) => destroyAsset(id)));
  await c.deleteOne();
  res.json({ message: 'Campaign deleted' });
});
