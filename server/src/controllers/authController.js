const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/error');
const { signToken } = require('../utils/token');
const { normalizeString } = require('../utils/request');

const sendAuthResponse = (res, user, statusCode = 200) => {
  res.status(statusCode).json({ token: signToken(user), user: user.toJSON() });
};

const register = asyncHandler(async (req, res) => {
  const name = normalizeString(req.body.name);
  const username = normalizeString(req.body.username).toLowerCase();
  const email = normalizeString(req.body.email).toLowerCase();
  const avatar = normalizeString(req.body.avatar);
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !email || !password) {
    throw new AppError('Username, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    throw new AppError('Username or email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, username, email, ...(avatar ? { avatar } : {}), passwordHash });

  sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const usernameOrEmail = normalizeString(req.body.username).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!usernameOrEmail || !password) {
    throw new AppError('Username and password are required', 400);
  }

  const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
  const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  sendAuthResponse(res, user);
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

module.exports = { register, login, me };
