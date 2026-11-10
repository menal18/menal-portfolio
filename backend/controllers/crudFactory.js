import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import pick from '../utils/pick.js';
import { required } from '../utils/validate.js';

export default function crudFactory(Model, { fields, requiredFields = [], sort = { order: 1, createdAt: 1 }, prepare, beforeDelete }) {
  const clean = async (body, existing) => {
    const data = pick(body, fields);
    return prepare ? prepare(data, existing) : data;
  };
  return {
    list: asyncHandler(async (_req, res) => res.json(await Model.find().sort(sort))),
    create: asyncHandler(async (req, res) => {
      required(req.body, requiredFields);
      res.status(201).json(await Model.create(await clean(req.body)));
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw new AppError('Not found', 404);
      doc.set(await clean(req.body, doc));
      await doc.save();
      res.json(doc);
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw new AppError('Not found', 404);
      if (beforeDelete) await beforeDelete(doc);
      await doc.deleteOne();
      res.json({ message: 'Deleted' });
    }),
  };
}
