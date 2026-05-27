const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
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
