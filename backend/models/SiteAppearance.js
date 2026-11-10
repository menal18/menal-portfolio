import mongoose from 'mongoose';

const appearanceSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    published: {
      season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'], default: 'spring' },
      template: { type: String, enum: ['creative'], default: 'creative' },
    },
    draft: {
      season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter'], default: 'spring' },
      template: { type: String, enum: ['creative'], default: 'creative' },
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default mongoose.model('SiteAppearance', appearanceSchema);
