import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { app, connectDB, validateConfig } = require('../backend/server');

export default async function handler(req, res) {
  try {
    validateConfig();
    await connectDB();
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ msg: 'Database connection failed. Please try again shortly.' });
    return;
  }

  // Vercel may strip the /api prefix; add it back for Express routes.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  app(req, res);
}
