const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/limits');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Important behind hosting proxy for rate limiting.
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(requestLogger);
app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/emp', employeeRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
