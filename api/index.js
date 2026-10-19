require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/database');
const logger = require('../src/config/logger');

// Vercel serverless entry point; reuse connection across warm function calls.
module.exports = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET not configured');
    }
    await connectDB();
    return app(req, res);
  } catch (error) {
    logger.error('Unable to initialize API');
    return res.status(503).json({ success: false, message: 'Service temporarily unavailable' });
  }
};
