import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    selectedRole: {
      type: String,
      required: true,
      trim: true,
    },
    readinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    strengths: {
      type: [String],
      default: [],
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    technologiesToLearn: {
      type: [String],
      default: [],
    },
    recommendedCourses: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    suggestedProjects: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    internshipRecommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    ats_analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    career_insights: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recruiter_summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    projectInsights: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    projectInsightsBySource: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    certificationInsights: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    roadmap: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    resume_improvement_suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Analysis', analysisSchema);
