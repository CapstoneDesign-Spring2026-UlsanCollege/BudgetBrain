import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { app, connectDB, validateConfig } = require('../backend/server');

export default async function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  try {
    validateConfig();
    const publicWithoutDatabase = req.url.startsWith('/api/health') || req.url.startsWith('/api/exchange');
    if (!publicWithoutDatabase) {
      await connectDB();
    }
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ msg: 'Database connection failed. Please try again shortly.' });
    return;
  }

  app(req, res);
}
