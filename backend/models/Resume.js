import mongoose from 'mongoose';

// Only one document is "active"; older uploads are removed when replaced.
const resumeSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, default: 'Menal-Resume.pdf' },
    size: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
