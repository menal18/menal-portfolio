import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

const { ADMIN_USERNAME = 'menal', ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 10) {
  console.error('ADMIN_PASSWORD must be at least 10 characters.');
  process.exit(1);
}

await connectDB();
const existing = await Admin.findOne();
if (existing) {
  // Single administrator: update credentials instead of creating a second account
  existing.username = ADMIN_USERNAME;
  existing.email = ADMIN_EMAIL;
  existing.password = ADMIN_PASSWORD;
  await existing.save();
  console.log(`Admin "${existing.username}" updated.`);
} else {
  await Admin.create({ username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  console.log(`Admin "${ADMIN_USERNAME}" created.`);
}
console.log('Remove ADMIN_PASSWORD from .env now. Sign in at /admin/login.');
await mongoose.disconnect();
