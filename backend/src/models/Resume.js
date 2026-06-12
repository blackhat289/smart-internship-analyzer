import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: String,
    filePath: String,
    mimeType: String,
    parsedText: String,
    extractedData: { type: Object, default: {} },
    status: { type: String, default: 'uploaded' },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
