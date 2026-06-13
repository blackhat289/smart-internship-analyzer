import mongoose from 'mongoose';

const personalInfoSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const resumeItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    organization: { type: String, default: '' },
    description: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalFileName: { type: String, required: true },
    storedFilePath: { type: String, required: true },
    resumeText: { type: String, default: '' },
    personalInfo: { type: personalInfoSchema, default: () => ({}) },
    education: { type: [resumeItemSchema], default: [] },
    skills: { type: [String], default: [] },
    projects: { type: [resumeItemSchema], default: [] },
    experience: { type: [resumeItemSchema], default: [] },
    certifications: { type: [String], default: [] },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
