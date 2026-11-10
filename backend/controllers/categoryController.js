import Category from '../models/Category.js';
import Project from '../models/Project.js';
import crudFactory from './crudFactory.js';
import uniqueSlug from '../utils/uniqueSlug.js';
import AppError from '../utils/AppError.js';

export default crudFactory(Category, {
  fields: ['name', 'order'],
  requiredFields: ['name'],
  prepare: async (d, existing) => ({ ...d, slug: await uniqueSlug(Category, d.name || existing?.name, existing?._id) }),
  beforeDelete: async (doc) => {
    const used = await Project.countDocuments({ category: doc._id });
    if (used) throw new AppError(`Cannot delete: ${used} project(s) use this category. Move them first.`, 409);
  },
});
