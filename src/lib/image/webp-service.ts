import { mkdir } from 'fs/promises';
import { join, parse } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface WebPConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: keyof sharp.FitEnum;
  position?: string | number;
  background?: sharp.Color;
  withoutEnlargement?: boolean;
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  outputDir?: string;
}

interface ConversionResult {
  webpPath: string;        // WebP formatındaki dosyanın yolu
  thumbnailPath?: string;  // Küçük boyut (thumbnail) yolu (eğer istenirse)
  width: number;           // Genişlik
  height: number;          // Yükseklik
  originalSize: number;    // Orijinal dosya boyutu (bytes)
  webpSize: number;        // WebP dosya boyutu (bytes)
  compressionRatio: number; // Sıkıştırma oranı (%)
}

/**
 * WebP dönüşüm servisi
 * Yüklenen veya mevcut görselleri WebP formatına dönüştürür
 */
export class WebPService {

  /**
   * Verilen bir görsel dosyasını WebP formatına dönüştürür
   */
  static async convertToWebP(
    inputPath: string,
    options: WebPConversionOptions = {}
  ): Promise<ConversionResult> {
    const {
      quality = 85,
      width,
      height,
      fit = 'cover',
      position = 'center',
      background = { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement = true,
      generateThumbnail = false,
      thumbnailWidth = 300,
      outputDir = './public/uploads'
    } = options;

    // Çıktı dizininin varlığından emin ol
    await mkdir(outputDir, { recursive: true });

    // Benzersiz dosya ismi oluştur
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.webp`;
    const outputPath = join(outputDir, fileName);

    // Orijinal görsel meta verilerini al
    const metadata = await sharp(inputPath).metadata();
    const originalSize = metadata.size || 0;

    // Dönüşüm işlemi için Sharp nesnesi oluştur
    let sharpInstance = sharp(inputPath);

    // Eğer boyut değiştirme isteniyorsa
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit,
        position,
        background,
        withoutEnlargement
      });
    }

    // WebP formatına dönüştür - Optimize edilmiş ayarlar
    const outputBuffer = await sharpInstance
      .webp({ 
        quality,
        effort: 6, // En yüksek sıkıştırma çabası (0-6 arası)
        lossless: false, // Lossy sıkıştırma kullan
        nearLossless: false, // Near-lossless devre dışı
        smartSubsample: true, // Akıllı alt örnekleme
        preset: 'photo' // Fotoğraf için optimize et
      })
      .toBuffer({ resolveWithObject: true });

    // Dosyayı kaydet
    await sharp(outputBuffer.data).toFile(outputPath);

    // WebP dosya boyutu
    const webpSize = outputBuffer.info.size;

    let thumbnailPath: string | undefined;

    // Eğer küçük görsel (thumbnail) isteniyorsa
    if (generateThumbnail) {
      const thumbFileName = `${uniqueId}_thumb.webp`;
      thumbnailPath = join(outputDir, thumbFileName);

      await sharp(inputPath)
        .resize({
          width: thumbnailWidth,
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ 
          quality: Math.max(quality - 10, 60), // Thumbnail için biraz daha düşük kalite
          effort: 6,
          lossless: false,
          smartSubsample: true,
          preset: 'photo'
        })
        .toFile(thumbnailPath);
    }

    // Sonuçları döndür
    return {
      webpPath: outputPath.replace('./public', ''),
      thumbnailPath: thumbnailPath ? thumbnailPath.replace('./public', '') : undefined,
      width: outputBuffer.info.width,
      height: outputBuffer.info.height,
      originalSize,
      webpSize,
      compressionRatio: Math.round((1 - (webpSize / originalSize)) * 100)
    };
  }

  /**
   * Buffer'dan WebP formatına dönüştürür
   */
  static async convertBufferToWebP(
    buffer: Buffer,
    options: WebPConversionOptions = {}
  ): Promise<ConversionResult> {
    const {
      quality = 85,
      width,
      height,
      fit = 'cover',
      position = 'center',
      background = { r: 255, g: 255, b: 255, alpha: 0 },
      withoutEnlargement = true,
      generateThumbnail = false,
      thumbnailWidth = 300,
      outputDir = './public/uploads'
    } = options;

    // Çıktı dizininin varlığından emin ol
    await mkdir(outputDir, { recursive: true });

    // Benzersiz dosya ismi oluştur
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.webp`;
    const outputPath = join(outputDir, fileName);

    // Orijinal buffer meta verilerini al
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;

    // Dönüşüm işlemi için Sharp nesnesi oluştur
    let sharpInstance = sharp(buffer);

    // Eğer boyut değiştirme isteniyorsa
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width,
        height,
        fit,
        position,
        background,
        withoutEnlargement
      });
    }

    // WebP formatına dönüştür - Optimize edilmiş ayarlar
    const outputBuffer = await sharpInstance
      .webp({ 
        quality,
        effort: 6, // En yüksek sıkıştırma çabası (0-6 arası)
        lossless: false, // Lossy sıkıştırma kullan
        nearLossless: false, // Near-lossless devre dışı
        smartSubsample: true, // Akıllı alt örnekleme
        preset: 'photo' // Fotoğraf için optimize et
      })
      .toBuffer({ resolveWithObject: true });

    // Dosyayı kaydet
    await sharp(outputBuffer.data).toFile(outputPath);

    // WebP dosya boyutu
    const webpSize = outputBuffer.info.size;

    let thumbnailPath: string | undefined;

    // Eğer küçük görsel (thumbnail) isteniyorsa
    if (generateThumbnail) {
      const thumbFileName = `${uniqueId}_thumb.webp`;
      thumbnailPath = join(outputDir, thumbFileName);

      await sharp(buffer)
        .resize({
          width: thumbnailWidth,
          fit: 'cover',
          withoutEnlargement: true
        })
        .webp({ 
          quality: Math.max(quality - 10, 60), // Thumbnail için biraz daha düşük kalite
          effort: 6,
          lossless: false,
          smartSubsample: true,
          preset: 'photo'
        })
        .toFile(thumbnailPath);
    }

    // Sonuçları döndür
    return {
      webpPath: outputPath.replace('./public', ''),
      thumbnailPath: thumbnailPath ? thumbnailPath.replace('./public', '') : undefined,
      width: outputBuffer.info.width,
      height: outputBuffer.info.height,
      originalSize,
      webpSize,
      compressionRatio: Math.round((1 - (webpSize / originalSize)) * 100)
    };
  }

  /**
   * Mevcut bir görsel URL'sini WebP formatına dönüştürür (harici URL'ler için)
   */
  static async convertUrlToWebP(
    url: string,
    options: WebPConversionOptions = {}
  ): Promise<ConversionResult> {
    // Fetch API ile dosyayı indir
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Buffer'ı WebP'ye dönüştür
    return this.convertBufferToWebP(buffer, options);
  }

  /**
   * Tarayıcıdan yüklenen dosyayı WebP formatına dönüştürür
   */
  static async convertFormFileToWebP(
    file: File,
    options: WebPConversionOptions = {}
  ): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return this.convertBufferToWebP(buffer, options);
  }
}

export default WebPService;
