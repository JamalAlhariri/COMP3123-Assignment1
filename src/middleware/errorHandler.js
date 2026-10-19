const logger = require('../config/logger');
function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}
function errorHandler(err, req, res, next) {
  // Log error type, not request bodies or connection strings.
  logger.error(`Error ${err.name || 'Error'} on ${req.method} ${req.path}`);
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'Username or email already exists' });
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ success: false, message: 'Malformed JSON body' });
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
}
module.exports = { notFound, errorHandler };
