import { ApiError } from '../utils/ApiError.js';

export function notFoundMiddleware(_req, _res, next) {
  next(new ApiError(404, 'Route not found'));
}

export function errorMiddleware(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    details: err.details || null,
  });
}
