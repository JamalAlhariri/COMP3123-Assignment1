const logger = require('../config/logger');
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    // Avoid query strings, body and Authorization values in logs.
    const msg = `${req.method} ${req.path} -> ${res.statusCode} (${Date.now() - start}ms)`;
    if (res.statusCode >= 400) logger.warn(msg);
    else logger.info(msg);
  });
  next();
}
module.exports = requestLogger;
