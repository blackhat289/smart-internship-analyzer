import Joi from 'joi';

export const analyzeResumeSchema = Joi.object({
  targetRole: Joi.string().required(),
});
