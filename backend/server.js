import 'dotenv/config';
import createApp from './app.js';
import connectDB from './config/db.js';
import { cloudinaryReady } from './config/cloudinary.js';

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variable(s): ${missing.join(', ')}. Copy backend/.env.example to backend/.env and fill it in.`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters.');
  process.exit(1);
}
if (!cloudinaryReady()) console.warn('Cloudinary is not configured: image and PDF uploads will fail until CLOUDINARY_* is set.');

const port = process.env.PORT || 5000;
try {
  await connectDB();
  createApp().listen(port, () => console.log(`API running on http://localhost:${port}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
