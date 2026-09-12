// Small helpers so every endpoint returns the same envelope shape:
// { success, data }  or  { success: false, message }
// Keeping this in one place means the frontend's axios client can rely
// on a single, predictable response format everywhere.

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

module.exports = { ApiError, ok };
