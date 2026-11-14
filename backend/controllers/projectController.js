import Project from '../models/Project.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import pick from '../utils/pick.js';
import uniqueSlug from '../utils/uniqueSlug.js';
import { toBool, toList, toJSON } from '../utils/parse.js';
import { required, urls } from '../utils/validate.js';
import { uploadImage, uploadImages, destroyAsset } from '../services/uploadService.js';

const FIELDS = ['title', 'summary', 'description', 'category', 'liveUrl', 'githubUrl', 'videoUrl', 'status', 'order'];
const populate = { path: 'category', select: 'name slug' };

// ---------- public
export const listPublished = asyncHandler(async (req, res) => {
  const filter = { status: 'published' };
  if (req.query.category) {
    const cat = await Category.findOne({ slug: String(req.query.category) });
    filter.category = cat?._id;
  }
  if (req.query.featured === 'true') filter.featured = true;
  res.json(await Project.find(filter).populate(populate).sort({ featured: -1, order: 1, createdAt: -1 }).select('-gallery.publicId -coverImage.publicId'));
});

export const getPublished = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published' })
    .populate(populate)
    .select('-gallery.publicId -coverImage.publicId');
  if (!project) throw new AppError('Project not found', 404);
  const related = await Project.find({ status: 'published', category: project.category._id, _id: { $ne: project._id } })
    .limit(3).populate(populate).select('title slug summary coverImage.url category technologies');
  res.json({ project, related });
});

// ---------- admin
export const listAll = asyncHandler(async (_req, res) =>
  res.json(await Project.find().populate(populate).sort({ order: 1, createdAt: -1 })));

export const getOne = asyncHandler(async (req, res) => {
  const p = await Project.findById(req.params.id).populate(populate);
  if (!p) throw new AppError('Project not found', 404);
  res.json(p);
});

function validate(body, { partial = false } = {}) {
  if (!partial) required(body, ['title', 'category']);
  urls(body, ['liveUrl', 'githubUrl', 'videoUrl']);
  if (body.status && !['draft', 'published'].includes(body.status)) throw new AppError('Status must be draft or published', 400);
}

export const create = asyncHandler(async (req, res) => {
  validate(req.body);
  if (!(await Category.exists({ _id: req.body.category }))) throw new AppError('Category does not exist', 400);
  const data = pick(req.body, FIELDS);
  data.technologies = toList(req.body.technologies);
  data.featured = toBool(req.body.featured);
  data.slug = await uniqueSlug(Project, data.title);
  const files = req.files || {};
  if (files.coverImage?.[0]) data.coverImage = await uploadImage(files.coverImage[0], 'projects');
  if (files.gallery?.length) data.gallery = await uploadImages(files.gallery, 'projects/gallery');
  res.status(201).json(await Project.create(data));
});

export const update = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new AppError('Project not found', 404);
  validate(req.body, { partial: true });
  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) throw new AppError('Category does not exist', 400);

  const data = pick(req.body, FIELDS);
  if (req.body.technologies !== undefined) data.technologies = toList(req.body.technologies);
  if (req.body.featured !== undefined) data.featured = toBool(req.body.featured);
  if (data.title && data.title !== project.title) data.slug = await uniqueSlug(Project, data.title, project._id);

  const files = req.files || {};
  if (files.coverImage?.[0]) {
    const old = project.coverImage?.publicId;
    data.coverImage = await uploadImage(files.coverImage[0], 'projects');
    await destroyAsset(old);
  } else if (toBool(req.body.removeCover)) {
    await destroyAsset(project.coverImage?.publicId);
    data.coverImage = undefined;
  }

  const removeIds = toList(req.body.removeGallery);
  if (removeIds.length) {
    const doomed = project.gallery.filter((g) => removeIds.includes(String(g._id)));
    await Promise.all(doomed.map((g) => destroyAsset(g.publicId)));
    project.gallery = project.gallery.filter((g) => !removeIds.includes(String(g._id)));
  }
  if (files.gallery?.length) project.gallery.push(...(await uploadImages(files.gallery, 'projects/gallery')));

  project.set(data);
  await project.save();
  res.json(await project.populate(populate));
});

export const setStatus = asyncHandler(async (req, res) => {
  const { status, featured } = req.body;
  const p = await Project.findById(req.params.id);
  if (!p) throw new AppError('Project not found', 404);
  if (status !== undefined) {
    if (!['draft', 'published'].includes(status)) throw new AppError('Status must be draft or published', 400);
    p.status = status;
  }
  if (featured !== undefined) p.featured = toBool(featured);
  await p.save();
  res.json(p);
});

export const remove = asyncHandler(async (req, res) => {
  const p = await Project.findById(req.params.id);
  if (!p) throw new AppError('Project not found', 404);
  await Promise.all([p.coverImage?.publicId, ...p.gallery.map((g) => g.publicId)].filter(Boolean).map((id) => destroyAsset(id)));
  await p.deleteOne();
  res.json({ message: 'Project deleted' });
});
