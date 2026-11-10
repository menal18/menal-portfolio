// Optional starter content. Creates categories, your profile name/titles,
// and the five named projects as DRAFTS with no invented descriptions, results or stats.
// Safe to re-run: existing items are left alone.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Project from '../models/Project.js';
import Profile from '../models/Profile.js';
import slugify from '../utils/slugify.js';

await connectDB();

const categories = ['Full Stack Development', 'Frontend Development', 'Mobile Applications', 'Digital Marketing', 'Creative Projects'];
const cats = {};
for (const [i, name] of categories.entries()) {
  cats[name] = (await Category.findOne({ name })) || (await Category.create({ name, slug: slugify(name), order: i }));
}

const projects = [
  ['School ERP Management System', 'Full Stack Development'],
  ['Craftie DIY E-commerce Website', 'Full Stack Development'],
  ['Cake N Take Mobile Application', 'Mobile Applications'],
  ['Jayamangala Agro Foods Website', 'Frontend Development'],
  ['Tripadvisor Clone', 'Full Stack Development'],
];
for (const [i, [title, cat]] of projects.entries()) {
  if (!(await Project.exists({ slug: slugify(title) }))) {
    await Project.create({ title, slug: slugify(title), category: cats[cat]._id, order: i, status: 'draft' });
  }
}

if (!(await Profile.exists({ singleton: 'main' }))) await Profile.create({ singleton: 'main' });

console.log('Starter content created. Open /admin to add descriptions and images, then publish.');
await mongoose.disconnect();
