const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const createRateLimiter = require('../middleware/rateLimit');
const { isOriginAllowed } = require('../server');
const {
  cleanString,
  isValidColor,
  normalizeEmail,
  parseNonNegativeNumber,
  parseOptionalDate,
  parsePositiveNumber,
} = require('../utils/http');
const exchange = require('../routes/exchange');
const authRoutes = require('../routes/auth');

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers = { ...(this.headers || {}), [name]: value };
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('normalizes and validates common request values', () => {
  assert.equal(cleanString('  Budget  '), 'Budget');
  assert.equal(normalizeEmail(' USER@Example.COM '), 'user@example.com');
  assert.equal(parsePositiveNumber('12.5', 'Amount').value, 12.5);
  assert.equal(parsePositiveNumber('-1', 'Amount').error, 'Amount must be a positive number.');
  assert.equal(parseNonNegativeNumber('0', 'Saved').value, 0);
  assert.equal(parseOptionalDate('2026-01-01', 'Deadline').value instanceof Date, true);
  assert.equal(parseOptionalDate('not-a-date', 'Deadline').error, 'Deadline must be a valid date.');
  assert.equal(isValidColor('210 65% 50%'), true);
  assert.equal(isValidColor('#8b5cf6'), true);
  assert.equal(isValidColor('purple'), false);
});

test('validates supported exchange currencies', () => {
  const { normalizeCurrency, isSupportedCurrency, SUPPORTED_CURRENCIES } = exchange._internals;

  assert.equal(normalizeCurrency(' usd '), 'USD');
  assert.equal(isSupportedCurrency('NPR'), true);
  assert.equal(isSupportedCurrency('USD'), true);
  assert.equal(isSupportedCurrency('DOGE'), false);
  assert.equal(SUPPORTED_CURRENCIES.includes('KRW'), true);
});

test('validates stronger passwords and reset code shape', () => {
  const { validatePassword, createResetCode } = authRoutes._internals;

  assert.equal(validatePassword('short1'), 'Password must be at least 8 characters.');
  assert.equal(validatePassword('password'), 'Password must include at least one letter and one number.');
  assert.equal(validatePassword('password1'), null);

  const reset = createResetCode();
  assert.match(reset.code, /^\d{6}$/);
  assert.equal(reset.codeHash.length, 64);
  assert.equal(reset.expiresAt > new Date(), true);
});

test('auth middleware accepts Authorization bearer tokens', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ user: { id: 'abc123' } }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const req = {
    header(name) {
      return name.toLowerCase() === 'authorization' ? `Bearer ${token}` : null;
    },
  };
  const res = mockResponse();
  let nextCalled = false;

  auth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: 'abc123' });
});

test('auth middleware rejects missing and expired tokens consistently', () => {
  process.env.JWT_SECRET = 'test-secret';

  const missingReq = { header: () => null };
  const missingRes = mockResponse();
  auth(missingReq, missingRes, () => {});
  assert.equal(missingRes.statusCode, 401);
  assert.equal(missingRes.body.msg, 'Authentication is required.');

  const expiredToken = jwt.sign({ user: { id: 'abc123' } }, process.env.JWT_SECRET, { expiresIn: '-1s' });
  const expiredReq = {
    header(name) {
      return name.toLowerCase() === 'x-auth-token' ? expiredToken : null;
    },
  };
  const expiredRes = mockResponse();
  auth(expiredReq, expiredRes, () => {});
  assert.equal(expiredRes.statusCode, 401);
  assert.equal(expiredRes.body.msg, 'Your session has expired. Please log in again.');
});

test('production CORS allows only trusted BudgetBrain origins by default', () => {
  assert.equal(isOriginAllowed(undefined, ['https://budgetbrain.vercel.app']), true);
  assert.equal(isOriginAllowed('https://budgetbrain.vercel.app', ['https://budgetbrain.vercel.app']), true);
  assert.equal(isOriginAllowed('https://evil.example.com', ['https://budgetbrain.vercel.app']), false);
});

test('rate limiter keys requests by forwarded client IP', () => {
  const limiter = createRateLimiter({ windowMs: 1000, max: 1, message: 'Too many requests.' });
  const firstReq = { headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }, ip: '10.0.0.5' };
  const secondReq = { headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }, ip: '10.0.0.6' };
  const firstRes = mockResponse();
  const secondRes = mockResponse();
  let nextCount = 0;

  limiter(firstReq, firstRes, () => { nextCount += 1; });
  limiter(secondReq, secondRes, () => { nextCount += 1; });

  assert.equal(nextCount, 1);
  assert.equal(secondRes.statusCode, 429);
  assert.equal(secondRes.body.msg, 'Too many requests.');
});
