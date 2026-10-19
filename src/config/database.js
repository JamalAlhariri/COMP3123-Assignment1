const mongoose = require('mongoose');
const logger = require('./logger');

let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Check your .env file.');

  connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      logger.info('MongoDB connected');
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      logger.error('MongoDB connection failed (check credentials, IP access, and connection URI)');
      throw error;
    });
  return connectionPromise;
}

module.exports = connectDB;
