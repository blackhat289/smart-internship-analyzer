import User from '../models/User.js';

export const userRepository = {
  create: (data) => User.create(data),
  findByEmail: (email) => User.findOne({ email }),
  findByResetToken: (resetPasswordToken) => User.findOne({ resetPasswordToken }),
  findById: (id) => User.findById(id),
  updateById: (id, update) => User.findByIdAndUpdate(id, update, { new: true }),
};
