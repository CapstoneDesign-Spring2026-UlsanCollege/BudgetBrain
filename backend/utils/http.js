const mongoose = require('mongoose');

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const HSL_TOKEN_PATTERN = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function parsePositiveNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return { error: `${fieldName} must be a positive number.` };
  }
  return { value: number };
}

function parseNonNegativeNumber(value, fieldName) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return { error: `${fieldName} must be zero or greater.` };
  }
  return { value: number };
}

function parseOptionalDate(value, fieldName) {
  if (!value) return { value: null };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: `${fieldName} must be a valid date.` };
  }
  return { value: date };
}

function isValidColor(value) {
  return typeof value === 'string' && (HEX_COLOR_PATTERN.test(value.trim()) || HSL_TOKEN_PATTERN.test(value.trim()));
}

function sendError(res, status, message, details) {
  const body = { msg: message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

function handleServerError(res, err, fallback = 'Server Error') {
  const isDatabaseError = err.name?.includes('Mongoose') || err.name?.includes('Mongo') || /buffering timed out|database|mongo/i.test(err.message);
  console.error(err.message);
  return sendError(
    res,
    isDatabaseError ? 503 : 500,
    isDatabaseError ? 'Database connection failed. Please try again shortly.' : fallback
  );
}

module.exports = {
  cleanString,
  handleServerError,
  isValidColor,
  isValidObjectId,
  normalizeEmail,
  parseNonNegativeNumber,
  parseOptionalDate,
  parsePositiveNumber,
  sendError,
};
