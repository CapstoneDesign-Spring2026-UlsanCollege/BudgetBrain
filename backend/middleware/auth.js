const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/http');

function getToken(req) {
  const headerToken = req.header('x-auth-token');
  const authHeader = req.header('authorization');

  if (headerToken) return headerToken;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

module.exports = function(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return sendError(res, 401, 'Authentication is required.');
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Your session has expired. Please log in again.');
    }
    if (err.message === 'JWT_SECRET is required') {
      return sendError(res, 500, 'Authentication is not configured.');
    }
    return sendError(res, 401, 'Token is not valid.');
  }
};
