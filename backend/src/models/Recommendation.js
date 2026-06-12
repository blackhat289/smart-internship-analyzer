import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
    internships: [{ title: String, company: String, location: String, url: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Recommendation', recommendationSchema);
