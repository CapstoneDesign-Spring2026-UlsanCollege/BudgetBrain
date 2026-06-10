const { app, connectDB, validateConfig } = require('../backend/server');

module.exports = async function handler(req, res) {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  try {
    validateConfig();
    const publicWithoutDatabase = req.url.startsWith('/api/health')
      || req.url.startsWith('/api/exchange')
      || req.url.startsWith('/api/ocr');
    if (!publicWithoutDatabase) {
      await connectDB();
    }
  } catch (err) {
    console.error(err.message);
    res.status(503).json({ msg: 'Database connection failed. Please try again shortly.' });
    return;
  }

  app(req, res);
};
