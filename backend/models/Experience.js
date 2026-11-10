import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    organization: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    startDate: { type: String, required: true, trim: true }, // free text, e.g. "Jun 2024"
    endDate: { type: String, trim: true, default: '' }, // empty + current=true => "Present"
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, default: '' },
    kind: { type: String, enum: ['work', 'education', 'other'], default: 'work' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Experience', experienceSchema);
