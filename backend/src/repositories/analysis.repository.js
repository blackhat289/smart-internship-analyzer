import Analysis from '../models/Analysis.js';

export const analysisRepository = {
  create: (data) => Analysis.create(data),
  findByUserId: (userId) => Analysis.findOne({ userId }).sort({ createdAt: -1 }),
};
