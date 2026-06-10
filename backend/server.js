const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('bufferCommands', false);

const securityHeaders = require('./middleware/security');
const createRateLimiter = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budgets');
const expenseRoutes = require('./routes/expenses');
const goalRoutes = require('./routes/goals');
const exchangeRoutes = require('./routes/exchange');
const ocrRoutes = require('./routes/ocr');

const app = express();
let connectionPromise = null;
let lastConnectionCheck = 0;
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

function buildAllowedOrigins() {
  const configured = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) return configured;

  return isProduction
    ? [
        'https://budgetbrain.vercel.app',
        'https://budget-brain-rho.vercel.app',
        'https://budget-brain-biidhus-projects.vercel.app',
      ]
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
}

function isOriginAllowed(origin, allowedOrigins = buildAllowedOrigins()) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return Boolean(
    isProduction
      && /^https:\/\/budget-?brain-[a-z0-9-]+-biidhus-projects\.vercel\.app$/i.test(origin)
  );
}

const allowedOrigins = buildAllowedOrigins();

app.use(securityHeaders);
app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin, allowedOrigins)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use('/api/ocr', express.json({ limit: '6mb' }), ocrRoutes);
app.use(express.json({ limit: '100kb' }));

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many authentication attempts. Please try again later.',
});

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Health check database connection failed: ${err.message}`);
  }

  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'degraded',
    database: databaseReady ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/exchange', exchangeRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.type === 'entity.too.large' ? 413 : 500;
  const message = err.message === 'Origin is not allowed by CORS'
    ? 'Origin is not allowed by CORS.'
    : status === 413
      ? 'Request body is too large.'
      : 'Server Error';
  res.status(status).json({ msg: message });
});

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`${name} is required. Set it in your local .env file or Vercel environment variables.`);
  }
}

function validateConfig() {
  requireEnv('JWT_SECRET');
  if (isProduction) {
    requireEnv('MONGO_URI');
  }
}

async function connectDB() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    if (Date.now() - lastConnectionCheck < 60000) return;
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
      lastConnectionCheck = Date.now();
      return;
    } catch (err) {
      console.warn(`MongoDB ping failed, reconnecting: ${err.message}`);
      connectionPromise = null;
      await mongoose.disconnect();
    }
  }
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    await connectionPromise;
    return;
  }
  if (!process.env.MONGO_URI) {
    console.warn('No MONGO_URI set. Database-backed API requests will fail until it is configured.');
    return;
  }
  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    await connectionPromise;
    lastConnectionCheck = Date.now();
    console.log('MongoDB connected successfully.');
  } catch (err) {
    connectionPromise = null;
    console.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }
}

if (require.main === module) {
  validateConfig();
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

app.get('/', (req, res) => res.send('BudgetBrain API is running'));

module.exports = { app, buildAllowedOrigins, connectDB, isOriginAllowed, validateConfig };
