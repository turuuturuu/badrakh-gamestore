const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../../utils/asyncHandler');
const { ApiError, ok } = require('../../utils/ApiResponse');
const adminModel = require('./admin.model');

// POST /api/admin/login  { username, password } -> { token, admin }
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, 'username and password are required');
  }

  const admin = await adminModel.findByUsername(username);
  if (!admin) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  ok(res, { token, admin: { id: admin.id, username: admin.username } });
});

// GET /api/admin/me — lets the frontend verify a stored token on app load
const me = asyncHandler(async (req, res) => {
  ok(res, req.admin);
});

module.exports = { login, me };
