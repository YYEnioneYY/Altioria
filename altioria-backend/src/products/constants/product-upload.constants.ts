export const MAX_PRODUCT_IMAGES = 15;
export const MAX_PRODUCT_FILES = 10;

export const MAX_PRODUCT_IMAGE_SIZE =
  20 * 1024 * 1024;

export const MAX_PRODUCT_FILE_SIZE =
  50 * 1024 * 1024;

export const MAX_PRODUCT_UPLOAD_FILES =
  MAX_PRODUCT_IMAGES + MAX_PRODUCT_FILES;

export const PRODUCT_IMAGE_MIME_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);