// Interface for image data stored in database
export interface DatabaseImage {
  data: string; // base64 encoded image data
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

// Convert file buffer to base64
export function bufferToBase64(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

// Extract base64 data from data URL
export function extractBase64Data(dataUrl: string): { data: string; mimeType: string } {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid data URL format');
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

// Validate image size and type
export function validateImageFile(buffer: Buffer, mimeType: string, maxSize: number = 2 * 1024 * 1024): void {
  // Check file size
  if (buffer.length > maxSize) {
    throw new Error(`Image size cannot exceed ${maxSize / 1024 / 1024}MB`);
  }

  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`Invalid image type. Allowed: ${allowedMimeTypes.join(', ')}`);
  }
}

// Store image in database (as base64 in user document)
export async function storeImageInDatabase(buffer: Buffer, mimeType: string): Promise<string> {
  validateImageFile(buffer, mimeType);
  return bufferToBase64(buffer, mimeType);
}

// Get image info from base64 data URL
export function getImageInfo(dataUrl: string): { size: number; mimeType: string } {
  const { data, mimeType } = extractBase64Data(dataUrl);
  const size = Buffer.from(data, 'base64').length;
  return { size, mimeType };
}
