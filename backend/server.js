const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.set('bufferCommands', false);

const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budgets');
const expenseRoutes = require('./routes/expenses');
const goalRoutes = require('./routes/goals');

const app = express();
let connectionPromise = null;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

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
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
      return;
    } catch (err) {
      console.warn('MongoDB ping failed, reconnecting:', err.message);
      connectionPromise = null;
      await mongoose.disconnect();
    }
  }
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    await connectionPromise;
    return;
  }
  if (!process.env.MONGO_URI) {
    console.warn('No MONGO_URI set - running without database. API requests requiring the database will fail.');
    return;
  }
  try {
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    await connectionPromise;
    console.log('MongoDB connected successfully.');
  } catch (err) {
    connectionPromise = null;
    console.error('MongoDB connection failed:', err.message);
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

module.exports = { app, connectDB, validateConfig };
