import sharp from 'sharp'

export const resizeImage = async ({
  buffer,
  maxSize = 1024 * 1024, // 1mb
  maxWidth = 1600,
  quality = 80,
}) => {
  if (buffer.length <= maxSize) return buffer;

  return sharp(buffer).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality }).toBuffer();
};
