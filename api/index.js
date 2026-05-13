const { app, connectDB, validateConfig } = require('../backend/server');

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      validateConfig();
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server configuration or database connection failed' });
      return;
    }
  }

  // Vercel may strip the /api prefix; add it back for Express routes.
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  app(req, res);
};
