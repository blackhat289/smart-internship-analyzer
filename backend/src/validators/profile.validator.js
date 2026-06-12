import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  headline: Joi.string().allow('').optional(),
  targetRole: Joi.string().allow('').optional(),
});
