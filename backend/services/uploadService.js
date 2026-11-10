import cloudinary, { cloudinaryReady, configureCloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

function ensure() {
  if (!cloudinaryReady()) {
    throw new AppError('Cloudinary is not configured. Set CLOUDINARY_* values in backend/.env.', 503);
  }
  configureCloudinary();
}

export function uploadBuffer(buffer, { folder, resourceType = 'image', publicId } = {}) {
  ensure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `menal-portfolio/${folder}`, resource_type: resourceType, public_id: publicId, overwrite: true },
      (err, result) => (err ? reject(new AppError(`Upload failed: ${err.message}`, 502)) : resolve(result))
    );
    stream.end(buffer);
  });
}

export async function uploadImage(file, folder) {
  const r = await uploadBuffer(file.buffer, { folder });
  return { url: r.secure_url, publicId: r.public_id };
}

export async function uploadImages(files = [], folder) {
  return Promise.all(files.map((f) => uploadImage(f, folder)));
}

export async function destroyAsset(publicId, resourceType = 'image') {
  if (!publicId || !cloudinaryReady()) return;
  try { configureCloudinary(); await cloudinary.uploader.destroy(publicId, { resource_type: resourceType }); } catch { /* best effort */ }
}
