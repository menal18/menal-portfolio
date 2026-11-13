import cloudinary, { cloudinaryReady, configureCloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

function ensure() {
  if (!cloudinaryReady()) {
    throw new AppError('Cloudinary is not configured. Set CLOUDINARY_* values in backend/.env.', 503);
  }
  configureCloudinary();
}

function logCloudinaryError(operation, error, context) {
  console.error(`[Cloudinary] ${operation} failed`, {
    ...context,
    httpCode: error?.http_code,
    message: error?.message || String(error),
  });
}

async function getDeliveryErrorDetails(url) {
  try {
    const response = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok || !contentType.toLowerCase().includes('application/json')) {
      await response.body?.cancel();
      return null;
    }

    const body = await response.text();
    try {
      const error = JSON.parse(body).error;
      return {
        code: error?.code,
        message: error?.message,
        requestId: error?.requestId,
      };
    } catch {
      return { message: body.slice(0, 500) };
    }
  } catch (error) {
    return { diagnosticFetchError: error?.message || String(error) };
  }
}

export function uploadBuffer(buffer, { folder, resourceType = 'image', deliveryType = 'upload', publicId } = {}) {
  ensure();
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error, source) => {
      if (settled) return;
      settled = true;
      logCloudinaryError('Upload', error, {
        folder,
        resourceType,
        deliveryType,
        publicId,
        source,
      });
      reject(new AppError(`Cloudinary upload failed: ${error?.message || 'Unknown Cloudinary error'}`, 502));
    };

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
        if (err) return fail(err, 'upload callback');
        if (!result?.secure_url || !result.public_id) {
          return fail(new Error('Cloudinary upload did not return a public URL and asset ID'), 'upload response');
        }
        settled = true;
        resolve(result);
      }
    );
    stream.on('error', (err) => fail(err, 'upload stream'));
    try {
      stream.end(buffer);
    } catch (err) {
      fail(err, 'upload stream');
    }
  });
}

export async function verifyPublicDelivery(url, expectedContentType) {
  let deliveryHost;
  try {
    deliveryHost = new URL(url).host;
  } catch (err) {
    throw new AppError(`Could not verify Cloudinary public delivery: ${err.message}`, 502);
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    logCloudinaryError('Public delivery verification', err, {
      host: deliveryHost,
      expectedContentType,
    });
    throw new AppError(`Could not verify Cloudinary public delivery: ${err.message}`, 502);
  }
  const contentType = response.headers.get('content-type') || '';
  const mediaType = contentType.split(';', 1)[0].trim().toLowerCase();
  const expectedMediaType = expectedContentType.split(';', 1)[0].trim().toLowerCase();
  if (!response.ok || mediaType !== expectedMediaType) {
    const cloudinaryError = !response.ok && mediaType === 'application/json'
      ? await getDeliveryErrorDetails(url)
      : null;
    console.error('[Cloudinary] Public delivery verification failed', {
      host: deliveryHost,
      status: response.status,
      contentType: contentType || '(missing)',
      expectedContentType: expectedMediaType,
      cloudinaryError,
    });
    throw new AppError(
      `Cloudinary uploaded the file, but public delivery verification returned HTTP ${response.status} with Content-Type "${contentType || 'missing'}"${cloudinaryError?.message ? ` (${cloudinaryError.message})` : ''} (expected ${expectedMediaType}). Verify Cloudinary PDF delivery and account access controls; only allow public delivery if this resume is intended to be public.`,
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
