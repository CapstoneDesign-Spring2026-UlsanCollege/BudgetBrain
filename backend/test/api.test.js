const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

process.env.MONGOMS_DOWNLOAD_DIR = process.env.MONGOMS_DOWNLOAD_DIR || 'C:\\Budget-Planner\\.cache\\mongodb-binaries';

const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');

const integrationEnabled = process.env.RUN_INTEGRATION_TESTS === '1';
let mongo;
let server;
let baseUrl;

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { 'x-auth-token': options.token } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function json(res) {
  return res.json();
}

test.before(async () => {
  if (!integrationEnabled) return;
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (!integrationEnabled) return;
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (server) await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(async () => {
  if (!integrationEnabled) return;
  await mongoose.connection.db.dropDatabase();
});

async function registerUser(email = 'user@example.com') {
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Test User', email, password: 'secret123' },
  });
  assert.equal(res.status, 200);
  return json(res);
}

test('register, login, and get current user', { skip: !integrationEnabled && 'Set RUN_INTEGRATION_TESTS=1 to run MongoDB integration tests.' }, async () => {
  const registered = await registerUser();
  assert.ok(registered.token);
  assert.equal(registered.user.email, 'user@example.com');

  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'USER@example.com', password: 'secret123' },
  });
  assert.equal(loginRes.status, 200);
  const loggedIn = await json(loginRes);
  assert.ok(loggedIn.token);

  const meRes = await request('/api/auth/me', { token: loggedIn.token });
  assert.equal(meRes.status, 200);
  const me = await json(meRes);
  assert.equal(me.email, 'user@example.com');
});

test('rejects invalid credentials and unauthenticated private requests', { skip: !integrationEnabled && 'Set RUN_INTEGRATION_TESTS=1 to run MongoDB integration tests.' }, async () => {
  await registerUser();

  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'user@example.com', password: 'wrong-password' },
  });
  assert.equal(badLogin.status, 400);

  const noToken = await request('/api/budgets');
  assert.equal(noToken.status, 401);
});

test('creates, updates, and deletes a budget', { skip: !integrationEnabled && 'Set RUN_INTEGRATION_TESTS=1 to run MongoDB integration tests.' }, async () => {
  const { token } = await registerUser();

  const createRes = await request('/api/budgets', {
    method: 'POST',
    token,
    body: { name: 'Food', amount: 500, color: '210 65% 50%' },
  });
  assert.equal(createRes.status, 201);
  const budget = await json(createRes);

  const updateRes = await request(`/api/budgets/${budget._id}`, {
    method: 'PUT',
    token,
    body: { amount: 650 },
  });
  assert.equal(updateRes.status, 200);
  assert.equal((await json(updateRes)).amount, 650);

  const deleteRes = await request(`/api/budgets/${budget._id}`, { method: 'DELETE', token });
  assert.equal(deleteRes.status, 200);
});

test('validates expense budget ownership', { skip: !integrationEnabled && 'Set RUN_INTEGRATION_TESTS=1 to run MongoDB integration tests.' }, async () => {
  const first = await registerUser('first@example.com');
  const second = await registerUser('second@example.com');

  const budgetRes = await request('/api/budgets', {
    method: 'POST',
    token: first.token,
    body: { name: 'Travel', amount: 1000, color: '160 65% 50%' },
  });
  const budget = await json(budgetRes);

  const foreignExpense = await request('/api/expenses', {
    method: 'POST',
    token: second.token,
    body: { name: 'Flight', amount: 300, budgetId: budget._id, category: 'travel' },
  });
  assert.equal(foreignExpense.status, 404);

  const ownExpense = await request('/api/expenses', {
    method: 'POST',
    token: first.token,
    body: { name: 'Flight', amount: 300, budgetId: budget._id, category: 'travel' },
  });
  assert.equal(ownExpense.status, 201);
});

test('creates, updates, and deletes a goal', { skip: !integrationEnabled && 'Set RUN_INTEGRATION_TESTS=1 to run MongoDB integration tests.' }, async () => {
  const { token } = await registerUser();

  const createRes = await request('/api/goals', {
    method: 'POST',
    token,
    body: { name: 'Emergency Fund', targetAmount: 2000 },
  });
  assert.equal(createRes.status, 201);
  const goal = await json(createRes);

  const updateRes = await request(`/api/goals/${goal._id}`, {
    method: 'PUT',
    token,
    body: { savedAmount: 250 },
  });
  assert.equal(updateRes.status, 200);
  assert.equal((await json(updateRes)).savedAmount, 250);

  const deleteRes = await request(`/api/goals/${goal._id}`, { method: 'DELETE', token });
  assert.equal(deleteRes.status, 200);
});
