import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({ url: String, publicId: String, caption: { type: String, default: '' } }, { _id: true });

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Campaign', 'Creative', 'SEO', 'Social Media', 'Content'], default: 'Campaign' },
    client: { type: String, trim: true, default: '' },
    platform: { type: String, trim: true, default: '' },
    summary: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    seoWork: { type: String, trim: true, default: '' },
    socialContent: { type: String, trim: true, default: '' },
    // Editable performance info. You enter only real numbers; nothing is prefilled.
    performance: [{ label: { type: String, trim: true }, value: { type: String, trim: true }, note: { type: String, trim: true, default: '' } }],
    coverImage: { type: imageSchema, default: undefined },
    creatives: [imageSchema],
    linkUrl: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('MarketingCampaign', campaignSchema);
