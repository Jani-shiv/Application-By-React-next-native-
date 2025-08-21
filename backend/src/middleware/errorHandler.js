const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.message = message;
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    error.message = 'Duplicate entry - resource already exists';
    return res.status(409).json(error);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    error.message = 'Referenced resource not found';
    return res.status(400).json(error);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size too large';
    return res.status(413).json(error);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field';
    return res.status(400).json(error);
  }

  // Default 500 error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};

module.exports = { errorHandler };
