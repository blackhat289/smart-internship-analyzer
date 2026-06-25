import mongoose from 'mongoose';

const personalInfoSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' },
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

const skillCategoriesSchema = new mongoose.Schema(
  {
    programmingLanguages: { type: [String], default: [] },
    frontend: { type: [String], default: [] },
    backend: { type: [String], default: [] },
    database: { type: [String], default: [] },
    cloud: { type: [String], default: [] },
    aiMl: { type: [String], default: [] },
    tools: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    cgpa: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    specialization: { type: String, default: '' },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    complexity: { type: String, default: '' },
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
    skills: { type: skillCategoriesSchema, default: () => ({}) },
    education: { type: [educationSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [String], default: [] },
    parseQuality: {
      source: { type: String, default: 'raw' },
      status: { type: String, default: 'fallback' },
      notes: { type: [String], default: [] },
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Resume', resumeSchema);
