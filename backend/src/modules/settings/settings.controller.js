const asyncHandler = require('../../utils/asyncHandler');
const { ApiError, ok } = require('../../utils/ApiResponse');
const settingsModel = require('./settings.model');
const cloudinary = require('../../config/cloudinary');

// GET /api/settings/admin-profiles — public, feeds the hero marquee.
const listAdminProfiles = asyncHandler(async (req, res) => {
  const profiles = await settingsModel.listAdminProfiles();
  ok(res, profiles);
});

// POST /api/admin/settings/admin-profiles  { name, profile_url }
const createAdminProfile = asyncHandler(async (req, res) => {
  const { name, profile_url: profileUrl } = req.body;
  if (!name?.trim() || !profileUrl?.trim()) {
    throw new ApiError(400, 'name and profile_url are required');
  }

  const profile = await settingsModel.createAdminProfile({ name: name.trim(), profileUrl: profileUrl.trim() });
  ok(res, profile, 201);
});

// DELETE /api/admin/settings/admin-profiles/:id
const deleteAdminProfile = asyncHandler(async (req, res) => {
  const removed = await settingsModel.removeAdminProfile(req.params.id);
  if (!removed) throw new ApiError(404, 'Admin profile not found');
  ok(res, { id: Number(req.params.id) });
});

// GET /api/settings/faqs — public, feeds the storefront's FAQ accordion.
const listFaqs = asyncHandler(async (req, res) => {
  const faqs = await settingsModel.listFaqs();
  ok(res, faqs);
});

// POST /api/admin/settings/faqs  { question, answer }
const createFaq = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  if (!question?.trim() || !answer?.trim()) {
    throw new ApiError(400, 'question and answer are required');
  }
  const faq = await settingsModel.createFaq({ question: question.trim(), answer: answer.trim() });
  ok(res, faq, 201);
});

// PUT /api/admin/settings/faqs/:id  { question, answer }
const updateFaq = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  if (!question?.trim() || !answer?.trim()) {
    throw new ApiError(400, 'question and answer are required');
  }
  const faq = await settingsModel.updateFaq(req.params.id, { question: question.trim(), answer: answer.trim() });
  if (!faq) throw new ApiError(404, 'FAQ not found');
  ok(res, faq);
});

// DELETE /api/admin/settings/faqs/:id
const deleteFaq = asyncHandler(async (req, res) => {
  const removed = await settingsModel.removeFaq(req.params.id);
  if (!removed) throw new ApiError(404, 'FAQ not found');
  ok(res, { id: Number(req.params.id) });
});

// GET /api/settings/site — public. { background_image_url, hero_image_url },
// either possibly null (no image set -> frontend falls back to its own
// built-in ambient glow / glassmorphism styling).
const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await settingsModel.getSiteSettings();
  ok(res, settings);
});

// Shared by the four image endpoints below: swap in the newly-uploaded
// Cloudinary asset, then best-effort delete whatever asset it replaced
// (mirrors product.controller.js's image cleanup — never blocks the
// response on Cloudinary's delete call succeeding).
async function replaceSiteImage({ previousPublicId, setter }) {
  const updated = await setter();
  if (previousPublicId) {
    await cloudinary.uploader.destroy(previousPublicId).catch(() => null);
  }
  return updated;
}

// POST /api/admin/settings/site/background-image  (multipart, field "image")
const updateBackgroundImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'image file is required');
  const { background_image_public_id: previousPublicId } = await settingsModel.getSiteImagePublicIds();
  const updated = await replaceSiteImage({
    previousPublicId,
    setter: () => settingsModel.setBackgroundImage({ url: req.file.path, publicId: req.file.filename }),
  });
  ok(res, updated);
});

// DELETE /api/admin/settings/site/background-image
const removeBackgroundImage = asyncHandler(async (req, res) => {
  const { background_image_public_id: previousPublicId } = await settingsModel.getSiteImagePublicIds();
  const updated = await replaceSiteImage({ previousPublicId, setter: () => settingsModel.clearBackgroundImage() });
  ok(res, updated);
});

// POST /api/admin/settings/site/hero-image  (multipart, field "image")
const updateHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'image file is required');
  const { hero_image_public_id: previousPublicId } = await settingsModel.getSiteImagePublicIds();
  const updated = await replaceSiteImage({
    previousPublicId,
    setter: () => settingsModel.setHeroImage({ url: req.file.path, publicId: req.file.filename }),
  });
  ok(res, updated);
});

// DELETE /api/admin/settings/site/hero-image
const removeHeroImage = asyncHandler(async (req, res) => {
  const { hero_image_public_id: previousPublicId } = await settingsModel.getSiteImagePublicIds();
  const updated = await replaceSiteImage({ previousPublicId, setter: () => settingsModel.clearHeroImage() });
  ok(res, updated);
});

module.exports = {
  listAdminProfiles,
  createAdminProfile,
  deleteAdminProfile,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getSiteSettings,
  updateBackgroundImage,
  removeBackgroundImage,
  updateHeroImage,
  removeHeroImage,
};
