const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // Check if errmsg is defined and is a string
  if (err.errmsg && typeof err.errmsg === 'string') {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/) || [];
    console.log(value[0]);

    const message = `Duplicate field value: ${
      value[0] || 'unknown'
    }. Please use another value!`;
    return new AppError(message, 400);
  } else {
    // If errmsg is not in the expected format, handle it accordingly
    console.error('Unexpected format of errmsg:', err.errmsg);
    return new AppError('Your email address already exists', 400);
  }
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥');

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'password does not match',
    });
  }
};

const handleJwtError = (err) =>
  new AppError('Inviled token! please try again!!', 401);

const handleJwtExpiredError = (err) =>
  new AppError('Your token has been expired!, please login again', 401);

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    console.log(error.code);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJwtError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJwtExpiredError(error);

    sendErrorProd(error, res);
  }
};
