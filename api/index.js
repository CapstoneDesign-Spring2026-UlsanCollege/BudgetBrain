const { app, connectDB } = require('../backend/server');

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      res.status(500).json({ error: 'Database connection failed' });
      return;
    }
  }
  // Vercel may strip the /api prefix — add it back for Express routes
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  app(req, res);
};
