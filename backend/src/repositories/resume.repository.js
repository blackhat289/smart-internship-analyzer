import Resume from '../models/Resume.js';

export const resumeRepository = {
  create: (data) => Resume.create(data),
  findByUserId: (userId) => Resume.findOne({ userId }).sort({ createdAt: -1 }),
  findById: (id) => Resume.findById(id),
  updateById: (id, update) => Resume.findByIdAndUpdate(id, update, { new: true }),
};
