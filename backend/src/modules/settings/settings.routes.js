// Same two-router split as products.routes.js: the GET is public
// (the storefront's hero marquee reads it with no admin session), the
// write endpoints require a JWT.
const express = require('express');
const controller = require('./settings.controller');
const { requireAdmin } = require('../../middleware/auth');
const uploadSiteImage = require('../../middleware/uploadSiteImage');

// ---- Public router — mounted at /api/settings, no auth ----------------
const publicRouter = express.Router();
publicRouter.get('/admin-profiles', controller.listAdminProfiles);
publicRouter.get('/site', controller.getSiteSettings);
publicRouter.get('/faqs', controller.listFaqs);

// ---- Admin router — mounted at /api/admin/settings, JWT required ------
const adminRouter = express.Router();
adminRouter.use(requireAdmin);
adminRouter.post('/admin-profiles', controller.createAdminProfile);
adminRouter.delete('/admin-profiles/:id', controller.deleteAdminProfile);
adminRouter.post('/site/background-image', uploadSiteImage.single('image'), controller.updateBackgroundImage);
adminRouter.delete('/site/background-image', controller.removeBackgroundImage);
adminRouter.post('/site/hero-image', uploadSiteImage.single('image'), controller.updateHeroImage);
adminRouter.delete('/site/hero-image', controller.removeHeroImage);
adminRouter.post('/faqs', controller.createFaq);
adminRouter.put('/faqs/:id', controller.updateFaq);
adminRouter.delete('/faqs/:id', controller.deleteFaq);

module.exports = { publicRouter, adminRouter };
