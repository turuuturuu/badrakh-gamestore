// Streams uploaded product images straight to Cloudinary via
// multer-storage-cloudinary — no image bytes ever touch our disk or DB,
// only the resulting secure_url + public_id get persisted.
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'badrakh-gamestore/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 100 }, // 8MB/file, up to 100 images per product
});

module.exports = upload;
