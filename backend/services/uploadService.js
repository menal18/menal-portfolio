import cloudinary, { cloudinaryReady, configureCloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

function ensure() {
  if (!cloudinaryReady()) {
    throw new AppError('Cloudinary is not configured. Set CLOUDINARY_* values in backend/.env.', 503);
  }
  configureCloudinary();
}

export function uploadBuffer(buffer, { folder, resourceType = 'image', deliveryType = 'upload', publicId } = {}) {
  ensure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `menal-portfolio/${folder}`,
        resource_type: resourceType,
        type: deliveryType,
        access_mode: 'public',
        public_id: publicId,
        overwrite: true,
      },
      (err, result) => {
        if (err) return reject(new AppError(`Cloudinary upload failed: ${err.message}`, 502));
        if (!result?.secure_url || !result.public_id) {
          return reject(new AppError('Cloudinary upload did not return a public URL and asset ID', 502));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export async function verifyPublicDelivery(url, expectedContentType) {
  let response;
  try {
    response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new AppError(`Could not verify Cloudinary public delivery: ${err.message}`, 502);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.toLowerCase().startsWith(expectedContentType.toLowerCase())) {
    throw new AppError(
      `Cloudinary uploaded the PDF, but public delivery failed (HTTP ${response.status}). Enable PDF and ZIP files delivery in Cloudinary Settings > Security and confirm public access.`,
      502
    );
  }
}

export async function uploadImage(file, folder) {
  const r = await uploadBuffer(file.buffer, { folder });
  return { url: r.secure_url, publicId: r.public_id };
}

export async function uploadImages(files = [], folder) {
  return Promise.all(files.map((f) => uploadImage(f, folder)));
}

export async function destroyAsset(publicId, resourceType = 'image', deliveryType = 'upload', { strict = false } = {}) {
  if (!publicId) return;
  if (!cloudinaryReady()) {
    if (strict) ensure();
    return;
  }
  configureCloudinary();
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: deliveryType,
    });
    if (!['ok', 'not found'].includes(result?.result)) {
      throw new Error(`Unexpected Cloudinary deletion result: ${result?.result || 'empty response'}`);
    }
  } catch (err) {
    if (strict) throw new AppError(`Cloudinary asset deletion failed: ${err.message}`, 502);
    console.error(`Cloudinary asset cleanup failed for ${publicId}: ${err.message}`);
  }
}
