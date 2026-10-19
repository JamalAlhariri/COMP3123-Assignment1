require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');

async function main() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Please set JWT_SECRET to at least 32 random characters in .env');
  }
  await connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info(`Server started on port ${port}`));
}
main().catch(() => {
  logger.error('Startup failed: check MongoDB URI and environment settings');
  process.exit(1);
});
