import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    group: { type: String, enum: ['Development', 'Marketing', 'Creative'], default: 'Development' },
    level: { type: Number, min: 0, max: 100, default: 0 },
    description: { type: String, trim: true, maxlength: 240, default: '' },
    technologies: [{ type: String, trim: true, maxlength: 40 }],
    icon: {
      type: String,
      enum: ['Code2', 'Database', 'Server', 'Megaphone', 'Palette', 'Smartphone', 'Cloud', 'Wrench', 'Globe', 'Sparkles', 'Shapes', 'Layers'],
      default: 'Sparkles',
    },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Skill', skillSchema);
