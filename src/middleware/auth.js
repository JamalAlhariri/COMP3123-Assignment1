const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ') || !header.slice(7).trim()) {
      logger.warn('Authentication failed: no bearer token');
      return res.status(401).json({ success: false, message: 'Bearer token required' });
    }
    const token = header.slice(7).trim();
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
      logger.warn('Authentication failed: ' + message);
      return res.status(401).json({ success: false, message });
    }
    if (!payload.id) return res.status(401).json({ success: false, message: 'Invalid token' });
    const user = await User.findById(payload.id).select('_id');
    if (!user) return res.status(401).json({ success: false, message: 'User no longer exists' });
    req.userId = user._id;
    next();
  } catch (error) { next(error); }
}
module.exports = authenticate;
