import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { v4 as uuidv4 } from 'uuid';

// AWS S3 Client Configuration - Direct bucket access (no Access Point)
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const BUCKET_URL = process.env.AWS_S3_BUCKET_URL!;

export interface S3UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  key?: string;
  error?: string;
}

export class S3UploadService {
  /**
   * Upload file to S3 (Without ACL - using bucket policy)
   */
  static async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    folder: string = 'uploads'
  ): Promise<S3UploadResult> {
    try {
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      console.log(`Uploading to S3 bucket: ${BUCKET_NAME}/${key}`);

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        // ACL removed - bucket policy handles permissions
        ServerSideEncryption: 'AES256', // Güvenlik için şifreleme
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);

      // Generate public URL using S3 bucket URL - Always use full URL
      const url = BUCKET_URL.endsWith('/')
        ? `${BUCKET_URL}${key}`
        : `${BUCKET_URL}/${key}`;

      let thumbnailUrl: string | undefined;

      // Generate thumbnail for images
      if (contentType.startsWith('image/')) {
        thumbnailUrl = await this.generateThumbnail(file, fileName, folder);
      }

      return {
        success: true,
        url,
        thumbnailUrl,
        key,
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Generate and upload thumbnail (Without ACL)
   */
  static async generateThumbnail(
    originalFile: Buffer,
    fileName: string,
    folder: string
  ): Promise<string | undefined> {
    try {
      // Generate thumbnail using Sharp
      const thumbnailBuffer = await sharp(originalFile)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      const uniqueFileName = `${uuidv4()}_thumb.jpg`;
      const thumbnailKey = `${folder}/thumbnails/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        // ACL removed - bucket policy handles permissions
        ServerSideEncryption: 'AES256', // Güvenlik için şifreleme
        Metadata: {
          originalName: `${fileName}_thumbnail`,
          uploadedAt: new Date().toISOString(),
          type: 'thumbnail',
        },
      });

      await s3Client.send(command);

      // Generate full thumbnail URL
      const thumbnailUrl = BUCKET_URL.endsWith('/')
        ? `${BUCKET_URL}${thumbnailKey}`
        : `${BUCKET_URL}/${thumbnailKey}`;

      return thumbnailUrl;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return undefined;
    }
  }

  /**
   * Delete file from S3 (Direct bucket access)
   */
  static async deleteFile(key: string): Promise<boolean> {
    try {
      console.log(`Deleting from S3 bucket: ${BUCKET_NAME}/${key}`);

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('S3 Delete Error:', error);
      return false;
    }
  }

  /**
   * Get signed URL for private files
   */
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('Get signed URL error:', error);
      return null;
    }
  }

  /**
   * Extract S3 key from URL - GalleryContainer için utility
   */
  static extractKeyFromUrl(url: string): string | null {
    try {
      if (!url) return null;

      // Remove bucket URL prefix to get key
      if (url.includes(BUCKET_URL)) {
        const bucketUrlClean = BUCKET_URL.endsWith('/') ? BUCKET_URL.slice(0, -1) : BUCKET_URL;
        return url.replace(bucketUrlClean + '/', '');
      }

      // If it's already a key (no http/https)
      if (!url.startsWith('http')) {
        return url;
      }

      return null;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Validate URL format - GalleryContainer için utility
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize URL - Always return full URL
   */
  static normalizeUrl(url: string): string {
    if (!url) return '';

    // Already a full URL
    if (url.startsWith('http')) {
      return url;
    }

    // Relative path - add bucket URL
    const cleanBucketUrl = BUCKET_URL.endsWith('/') ? BUCKET_URL.slice(0, -1) : BUCKET_URL;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;

    return `${cleanBucketUrl}/${cleanUrl}`;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: Buffer, fileName: string, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file size
    if (file.length > maxSize) {
      return {
        valid: false,
        error: `Dosya boyutu ${Math.round(maxSize / 1024 / 1024)}MB'den büyük olamaz`,
      };
    }

    // Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'mp4', 'mov'];
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Desteklenen formatlar: ${allowedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get file info from S3
   */
  static async getFileInfo(key: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }
}

export default S3UploadService;
