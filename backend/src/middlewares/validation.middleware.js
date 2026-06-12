import { ApiError } from '../utils/ApiError.js';

export function validationMiddleware(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return next(new ApiError(400, 'Validation failed', error.details.map((d) => d.message)));
    req.body = value;
    next();
  };
}
