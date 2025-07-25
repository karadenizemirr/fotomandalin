import { stat, access } from 'fs/promises';
import { constants } from 'fs';

/**
 * Belirtilen dosya yolunun var olup olmadığını kontrol eder
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Dosya boyutunu kilobayt cinsinden döndürür
 */
export async function getFileSizeInKB(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

/**
 * URL'den dosya adını çıkarır
 */
export function getFileNameFromUrl(url: string): string {
  if (!url) return '';
  return url.split('/').pop() || '';
}

/**
 * Megabyte'ı byte'a çevirir
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Byte'ı megabyte'a çevirir
 */
export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

/**
 * Byte'ı insan tarafından okunabilir formata çevirir
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Dosya türünü MIME tipinden kontrol eder
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Dosya uzantısından MIME tipini tahmin eder
 */
export function getMimeTypeFromExtension(extension: string): string | null {
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff'
  };

  const ext = extension.toLowerCase().replace('.', '');
  return mimeTypes[ext] || null;
}
