import sharp from 'sharp';

export class ModernWebPService {
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Buffer'dan WebP formatına dönüşüm yapar
   * @param buffer - Dönüştürülecek görsel buffer'ı
   * @param options - Dönüşüm seçenekleri
   * @returns WebP formatında buffer ve istatistikler
   */
  static async convertToWebP(
    buffer: Buffer,
    options: {
      quality?: number;
      effort?: number;
      lossless?: boolean;
      width?: number;
      height?: number;
    } = {}
  ): Promise<{
    webpBuffer: Buffer;
    originalSize: number;
    webpSize: number;
    compressionRatio: number;
    metadata?: {
      format: string;
      width: number;
      height: number;
      channels: number;
    };
  }> {
    try {
      const {
        quality = this.DEFAULT_QUALITY,
        effort = 4,
        lossless = false,
        width,
        height
      } = options;

      console.log(`[ModernWebPService] Buffer dönüşümü başlatılıyor...`);
      console.log(`[ModernWebPService] Orijinal boyut: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

      // Görsel metadata'sını al
      const metadata = await sharp(buffer).metadata();
      console.log(`[ModernWebPService] Görsel formatı: ${metadata.format}, Boyutlar: ${metadata.width}x${metadata.height}`);

      // Orijinal boyutu kaydet
      const originalSize = buffer.length;

      // Sharp pipeline oluştur
      let sharpInstance = sharp(buffer);

      // Resize işlemi varsa uygula
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // WebP dönüşümü
      const webpBuffer = await sharpInstance
        .webp({
          quality: lossless ? undefined : quality,
          lossless,
          effort,
          smartSubsample: true,
          preset: 'default'
        })
        .toBuffer();

      const webpSize = webpBuffer.length;
      const compressionRatio = Math.round(((originalSize - webpSize) / originalSize) * 100);

      console.log(`[ModernWebPService] WebP boyutu: ${(webpSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`[ModernWebPService] Sıkıştırma oranı: %${compressionRatio}`);

      return {
        webpBuffer,
        originalSize,
        webpSize,
        compressionRatio,
        metadata: {
          format: metadata.format || 'unknown',
          width: metadata.width || 0,
          height: metadata.height || 0,
          channels: metadata.channels || 0
        }
      };
    } catch (error) {
      console.error('[ModernWebPService] WebP dönüşüm hatası:', error);
      throw new Error(`WebP dönüşümü başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  /**
   * Dosya boyutunu kontrol eder
   */
  static validateFileSize(buffer: Buffer): boolean {
    return buffer.length <= this.DEFAULT_MAX_SIZE;
  }

  /**
   * Supported image formatlarını kontrol eder
   */
  static async isValidImageFormat(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'bmp'];
      return supportedFormats.includes(metadata.format || '');
    } catch {
      return false;
    }
  }

  /**
   * Görsel optimizasyonu için önerileri hesaplar
   */
  static calculateOptimizationSuggestions(originalSize: number, webpSize: number): {
    compressionRatio: number;
    sizeReduction: string;
    recommendation: string;
  } {
    const compressionRatio = Math.round(((originalSize - webpSize) / originalSize) * 100);
    const sizeReduction = `${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(webpSize / 1024 / 1024).toFixed(2)} MB`;
    
    let recommendation = 'İyi optimizasyon!';
    if (compressionRatio < 20) {
      recommendation = 'Düşük sıkıştırma - kaliteyi düşürmeyi düşünün';
    } else if (compressionRatio > 70) {
      recommendation = 'Yüksek sıkıştırma - kalite kontrolü yapın';
    }

    return {
      compressionRatio,
      sizeReduction,
      recommendation
    };
  }

  /**
   * Thumbnail oluşturur
   */
  static async createThumbnail(
    buffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        width = 300,
        height = 300,
        quality = 70
      } = options;

      const thumbnailBuffer = await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality,
          effort: 4
        })
        .toBuffer();

      return thumbnailBuffer;
    } catch (error) {
      console.error('[ModernWebPService] Thumbnail oluşturma hatası:', error);
      throw new Error(`Thumbnail oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }
}