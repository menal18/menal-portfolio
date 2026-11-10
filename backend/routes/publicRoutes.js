import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as projects from '../controllers/projectController.js';
import * as campaigns from '../controllers/campaignController.js';
import * as resume from '../controllers/resumeController.js';
import * as contact from '../controllers/contactController.js';
import { home } from '../controllers/publicController.js';
import { getPublishedAppearance } from '../controllers/appearanceController.js';

const router = Router();
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages from this connection. Try again in an hour.' },
});

router.get('/public/home', home);
router.get('/public/appearance', getPublishedAppearance);
router.get('/projects', projects.listPublished);
router.get('/projects/:slug', projects.getPublished);
router.get('/campaigns', campaigns.listPublished);
router.get('/campaigns/:slug', campaigns.getPublished);
router.get('/resume', resume.meta);
router.get('/resume/download', resume.download);
router.post('/contact', contactLimiter, contact.submit);

export default router;
