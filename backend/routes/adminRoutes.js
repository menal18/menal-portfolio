import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { imageUpload, pdfUpload, verifyPdf } from '../middleware/upload.js';
import * as projects from '../controllers/projectController.js';
import * as campaigns from '../controllers/campaignController.js';
import * as resume from '../controllers/resumeController.js';
import * as contact from '../controllers/contactController.js';
import * as profile from '../controllers/profileController.js';
import categories from '../controllers/categoryController.js';
import skills from '../controllers/skillController.js';
import experience from '../controllers/experienceController.js';
import * as appearance from '../controllers/appearanceController.js';
import { stats } from '../controllers/publicController.js';

const router = Router();
router.use(protect, adminOnly);

const projectFiles = imageUpload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'gallery', maxCount: 15 }]);
const campaignFiles = imageUpload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'creatives', maxCount: 20 }]);

router.get('/stats', stats);
router.get('/appearance', appearance.getAdminAppearance);
router.put('/appearance', appearance.updateDraftAppearance);
router.post('/appearance/publish', appearance.publishDraftAppearance);
router.post('/appearance/reset', appearance.resetDraftAppearance);

router.route('/projects').get(projects.listAll).post(projectFiles, projects.create);
router.route('/projects/:id').get(projects.getOne).put(projectFiles, projects.update).delete(projects.remove);
router.patch('/projects/:id/status', projects.setStatus);

router.route('/campaigns').get(campaigns.listAll).post(campaignFiles, campaigns.create);
router.route('/campaigns/:id').get(campaigns.getOne).put(campaignFiles, campaigns.update).delete(campaigns.remove);
router.patch('/campaigns/:id/status', campaigns.setStatus);

for (const [path, c] of [['categories', categories], ['skills', skills], ['experience', experience]]) {
  router.route(`/${path}`).get(c.list).post(c.create);
  router.route(`/${path}/:id`).put(c.update).delete(c.remove);
}

router.route('/profile').get(profile.getProfile).put(imageUpload.single('portrait'), profile.updateProfile);

router.route('/resume').get(resume.meta).post(pdfUpload.single('resume'), verifyPdf, resume.upload).delete(resume.remove);

router.get('/messages', contact.list);
router.patch('/messages/:id', contact.markRead);
router.delete('/messages/:id', contact.remove);

export default router;
