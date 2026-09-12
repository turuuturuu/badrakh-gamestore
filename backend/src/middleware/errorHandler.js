const { ApiError } = require('../utils/ApiResponse');

// 404 fallback — must be mounted after all real routes.
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Centralized error handler — must be the LAST app.use() in app.js.
// Any `next(err)` call (including asyncHandler rejections) ends up here.
function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof ApiError ? err.statusCode : (err.statusCode || 500);
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
