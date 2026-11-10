import slugify from './slugify.js';

export default async function uniqueSlug(Model, text, excludeId) {
  const base = slugify(text) || 'item';
  let slug = base;
  let i = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${base}-${i++}`;
  return slug;
}
