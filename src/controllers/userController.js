const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

async function signup(req, res, next) {
  try {
    const { username, email, password } = req.validatedBody;
    const normalizedUsername = username.toLowerCase();
    const existing = await User.findOne({ $or: [{ username: normalizedUsername }, { email }] });
    if (existing) return res.status(409).json({ success: false, message: 'Username or email already exists' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username: normalizedUsername, email, password: hashed });
    logger.info('User signup succeeded');
    return res.status(201).json({ success: true, message: 'User registered', data: {
      id: user._id, username: user.username, email: user.email,
      created_at: user.created_at
    } });
  } catch (error) { next(error); }
}
async function login(req, res, next) {
  try {
    const { username, email, password } = req.validatedBody;
    const user = await User.findOne(username ? { username: username.toLowerCase() } : { email }).select('+password');
    const correct = user ? await bcrypt.compare(password, user.password) : false;
    if (!correct) {
      logger.warn('Login failed: invalid credentials');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '2h'
    });
    logger.info('Login succeeded');
    return res.status(200).json({ success: true, message: 'Login successful', token, data: {
      id: user._id, username: user.username, email: user.email
    } });
  } catch (error) { next(error); }
}
module.exports = { signup, login };
