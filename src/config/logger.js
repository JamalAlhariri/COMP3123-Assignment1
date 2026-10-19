const winston = require('winston');
const path = require('path');
const fs = require('fs');

const transports = [new winston.transports.Console()];
// Files are for LOCAL development. Vercel function storage is ephemeral.
if (!process.env.VERCEL) {
  const logDir = path.join(__dirname, '../../logs');
  fs.mkdirSync(logDir, { recursive: true });
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'application.log') }));
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'errors.log'), level: 'error' }));
}

module.exports = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports
});
