// Same Cloudinary-direct-streaming approach as upload.js, but for the two
// admin-managed site images (page background + hero banner) — its own
// folder/transformation since these are single, larger photos rather
// than a product's gallery.
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'badrakh-gamestore/site',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 1920, crop: 'limit', quality: 'auto' }],
  },
});

const uploadSiteImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB, single file
});

module.exports = uploadSiteImage;
