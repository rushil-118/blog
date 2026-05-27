const dotenv = require('dotenv');

dotenv.config();

const developmentJwtSecret = 'change-me-in-development';
const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || developmentJwtSecret;

if (
  nodeEnv === 'production' &&
  (!process.env.JWT_SECRET || jwtSecret === developmentJwtSecret || jwtSecret.length < 32)
) {
  throw new Error('JWT_SECRET must be set to a strong secret of at least 32 characters in production');
}

const env = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fullstack_blog',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  nodeEnv,
};

module.exports = env;
