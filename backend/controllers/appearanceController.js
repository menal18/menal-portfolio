import SiteAppearance from '../models/SiteAppearance.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const TEMPLATES = ['creative'];
const DEFAULT_APPEARANCE = {
  singleton: 'main',
  published: { season: 'spring', template: 'creative' },
  draft: { season: 'spring', template: 'creative' },
};

async function getAppearanceDoc() {
  const existing = await SiteAppearance.findOne({ singleton: 'main' });
  if (existing) return existing;
  try {
    return await SiteAppearance.create(DEFAULT_APPEARANCE);
  } catch (error) {
    if (error.code !== 11000) throw error;
    return SiteAppearance.findOne({ singleton: 'main' });
  }
}

function validateAppearanceValue(value, allowed, field) {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new AppError(`Invalid ${field}.`, 400);
  }
}

export const getAdminAppearance = asyncHandler(async (_req, res) => {
  const appearance = await getAppearanceDoc();
  res.json({
    published: appearance.published,
    draft: appearance.draft,
    updatedAt: appearance.updatedAt,
  });
});

export const updateDraftAppearance = asyncHandler(async (req, res) => {
  const appearance = await getAppearanceDoc();
  const { season, template } = req.body || {};
  if (season !== undefined) validateAppearanceValue(season, SEASONS, 'season');
  if (template !== undefined) validateAppearanceValue(template, TEMPLATES, 'template');
  if (season === undefined && template === undefined) {
    throw new AppError('Provide a season or template to update the draft.', 400);
  }
  if (season !== undefined) appearance.draft.season = season;
  if (template !== undefined) appearance.draft.template = template;
  await appearance.save({ timestamps: false });
  res.json({
    published: appearance.published,
    draft: appearance.draft,
    updatedAt: appearance.updatedAt,
  });
});

export const publishDraftAppearance = asyncHandler(async (_req, res) => {
  const appearance = await getAppearanceDoc();
  appearance.published = appearance.draft;
  appearance.updatedAt = new Date();
  await appearance.save({ timestamps: false });
  res.json({
    published: appearance.published,
    draft: appearance.draft,
    updatedAt: appearance.updatedAt,
  });
});

export const resetDraftAppearance = asyncHandler(async (_req, res) => {
  const appearance = await getAppearanceDoc();
  appearance.draft = appearance.published;
  await appearance.save({ timestamps: false });
  res.json({
    published: appearance.published,
    draft: appearance.draft,
    updatedAt: appearance.updatedAt,
  });
});

export const getPublishedAppearance = asyncHandler(async (_req, res) => {
  const appearance = await getAppearanceDoc();
  res.json({
    published: appearance.published,
    updatedAt: appearance.updatedAt,
  });
});
