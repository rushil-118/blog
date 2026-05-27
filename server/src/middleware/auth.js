const User = require('../models/User');
const { AppError, asyncHandler } = require('./error');
const { verifyToken } = require('../utils/token');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required', 401);
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.id);

  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
