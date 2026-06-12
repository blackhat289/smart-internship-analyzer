import { verifyToken } from '../config/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function authMiddleware(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authorization token missing'));

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}
