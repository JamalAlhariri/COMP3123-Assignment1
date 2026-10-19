const rateLimit = require('express-rate-limit');
function limitNumber(envName, fallback) {
  const n = Number(process.env[envName]);
  return Number.isSafeInteger(n) && n > 0 ? n : fallback;
}
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: limitNumber('AUTH_RATE_LIMIT_MAX', 30),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication requests. Try again later.' }
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: limitNumber('API_RATE_LIMIT_MAX', 150),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many API requests. Try again later.' }
});
module.exports = { authLimiter, apiLimiter };
