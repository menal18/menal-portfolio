import Project from '../models/Project.js';
import Category from '../models/Category.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import MarketingCampaign from '../models/MarketingCampaign.js';
import Resume from '../models/Resume.js';
import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getProfileDoc } from './profileController.js';

// One request that feeds the whole public home page
export const home = asyncHandler(async (_req, res) => {
  const [profile, skills, experience, categories, projects, campaigns, resume] = await Promise.all([
    getProfileDoc(),
    Skill.find({ active: { $ne: false } }).sort({ group: 1, order: 1, name: 1 }),
    Experience.find().sort({ order: 1, createdAt: -1 }),
    Category.find().sort({ order: 1, name: 1 }),
    Project.find({ status: 'published' }).populate('category', 'name slug').sort({ featured: -1, order: 1, createdAt: -1 }).select('-gallery -coverImage.publicId'),
    MarketingCampaign.find({ status: 'published' }).sort({ featured: -1, order: 1, createdAt: -1 }).select('-creatives.publicId -coverImage.publicId'),
    Resume.findOne({ singleton: 'main' }),
  ]);
  res.json({
    profile, skills, experience, categories, projects, campaigns,
    resume: resume ? { available: true, fileName: resume.fileName, updatedAt: resume.updatedAt } : { available: false },
  });
});

export const stats = asyncHandler(async (_req, res) => {
  const [projects, published, featured, campaigns, publishedCampaigns, skills, experience, unread, total, resume] = await Promise.all([
    Project.countDocuments(), Project.countDocuments({ status: 'published' }), Project.countDocuments({ featured: true }),
    MarketingCampaign.countDocuments(), MarketingCampaign.countDocuments({ status: 'published' }),
    Skill.countDocuments(), Experience.countDocuments(),
    ContactMessage.countDocuments({ read: false }), ContactMessage.countDocuments(), Resume.findOne({ singleton: 'main' }),
  ]);
  const recent = await ContactMessage.find().sort({ createdAt: -1 }).limit(5);
  res.json({ projects, published, drafts: projects - published, featured, campaigns, publishedCampaigns, skills, experience, unread, totalMessages: total, resume: resume ? { fileName: resume.fileName, updatedAt: resume.updatedAt } : null, recent });
});
