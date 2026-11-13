import mongoose from 'mongoose';
 
// Only one document is "active"; uploading a new PDF replaces it.
// The PDF itself is stored in MongoDB (max 10 MB, well under Mongo's 16 MB limit),
// so it does not depend on Cloudinary's PDF delivery restrictions.
const resumeSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    data: { type: Buffer, select: false }, // PDF bytes, only loaded when explicitly requested
    contentType: { type: String, default: 'application/pdf' },
    fileName: { type: String, default: 'Menal-Resume.pdf' },
    size: Number,
    // Legacy Cloudinary fields (kept so old records still load)
    url: String,
    publicId: String,
    resourceType: { type: String, enum: ['image', 'raw'] },
  },
  { timestamps: true }
);
 
export default mongoose.model('Resume', resumeSchema);