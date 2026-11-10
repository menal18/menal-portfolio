import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    name: { type: String, default: 'Menal' },
    titles: { type: [String], default: ['DEVELOPER', 'DIGITAL MARKETER', 'CREATIVE THINKER'] },
    tagline: { type: String, default: '' },
    aboutHeading: { type: String, default: '' },
    aboutBody: { type: String, default: '' },
    portrait: { url: String, publicId: String },
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      availability: { type: String, default: '' },
    },
    social: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
