const express = require('express');
const controller = require('./stats.controller');
const { requireAdmin } = require('../../middleware/auth');

const router = express.Router();
router.get('/', requireAdmin, controller.getStats);

module.exports = router;
