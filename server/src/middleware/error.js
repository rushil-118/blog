class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const mapError = (err) => {
  if (err.name === 'ValidationError') {
    return { statusCode: 400, message: Object.values(err.errors).map((error) => error.message).join(', ') };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    return { statusCode: 409, message: `${field} already exists` };
  }

  if (err.name === 'CastError') {
    return { statusCode: 404, message: 'Resource not found' };
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Invalid or expired token' };
  }

  return { statusCode: err.statusCode || 500, message: err.message || 'Server error' };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = mapError(err);

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : message,
  });
};

module.exports = { AppError, asyncHandler, errorHandler };
