import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    readinessScore: Number,
    strengths: [String],
    skillGaps: [String],
    summary: String,
  },
  { timestamps: true }
);

export default mongoose.model('Analysis', analysisSchema);
