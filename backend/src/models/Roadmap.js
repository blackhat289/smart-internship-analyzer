import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
    steps: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Roadmap', roadmapSchema);
