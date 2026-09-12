// Two routers exported from one file because both sit on the exact same
// resource (`products`) — keeping them side by side makes it obvious
// which admin endpoint mirrors which public one.
const express = require('express');
const controller = require('./product.controller');
const { requireAdmin } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// ---- Public router — mounted at /api/products, no auth ----------------
const publicRouter = express.Router();
publicRouter.get('/', controller.listProducts);
publicRouter.get('/:id', controller.getProduct);

// ---- Admin router — mounted at /api/admin/products, JWT required ------
const adminRouter = express.Router();
adminRouter.use(requireAdmin);

adminRouter.get('/', controller.listProducts); // same handler; admin can also pass status=hidden etc.
adminRouter.get('/:id', controller.getProduct);
adminRouter.post('/', upload.array('images', 100), controller.createProduct);
adminRouter.put('/:id', upload.array('images', 100), controller.updateProduct);
adminRouter.patch('/:id/status', controller.updateStatus);
adminRouter.delete('/:id/images/:imageId', controller.deleteImage);
adminRouter.delete('/:id', controller.deleteProduct);

module.exports = { publicRouter, adminRouter };
