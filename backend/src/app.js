// Express application: middleware + route mounting only. No `listen()`
// here so the app can also be imported by tests without opening a port.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { publicRouter: publicProductRoutes, adminRouter: adminProductRoutes } = require('./modules/products/product.routes');
const { publicRouter: publicSettingsRoutes, adminRouter: adminSettingsRoutes } = require('./modules/settings/settings.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const statsRoutes = require('./modules/stats/stats.routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow Cloudinary images to be embedded cross-origin
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

// Public storefront
app.use('/api/products', publicProductRoutes);
app.use('/api/settings', publicSettingsRoutes); // -> /api/settings/admin-profiles

// Admin (each sub-router applies its own `requireAdmin` guard where needed)
app.use('/api/admin', adminRoutes);              // -> /api/admin/login, /api/admin/me
app.use('/api/admin/products', adminProductRoutes); // -> /api/admin/products/*
app.use('/api/admin/settings', adminSettingsRoutes); // -> /api/admin/settings/admin-profiles/*
app.use('/api/admin/stats', statsRoutes);           // -> /api/admin/stats

app.use(notFound);
app.use(errorHandler);

module.exports = app;
