import multer from 'multer';

export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (images max 8 MB, PDF max 10 MB)' : err.message;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join('. ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 409;
    message = `Already exists: ${Object.keys(err.keyValue || {}).join(', ')}`;
  }

  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 && process.env.NODE_ENV === 'production' && err.expose !== true
      ? 'Server error'
      : message,
  });
};
