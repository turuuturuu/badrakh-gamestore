// Guards every /api/admin/* write route. Buyers never authenticate —
// only the admin panel needs a token, issued by POST /api/admin/login.
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiResponse');

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Missing authorization token'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { requireAdmin };
