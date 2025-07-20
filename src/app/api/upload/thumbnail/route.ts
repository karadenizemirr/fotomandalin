import { NextRequest, NextResponse } from 'next/server';
import { S3UploadService } from '@/lib/s3-upload';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { url, width = 300, height = 300, quality = 80 } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL gerekli' },
        { status: 400 }
      );
    }

    // Extract S3 key from URL
    let s3Key: string;
    if (url.includes('amazonaws.com')) {
      // S3 URL format: https://bucket.s3.region.amazonaws.com/key
      const urlParts = new URL(url);
      s3Key = urlParts.pathname.substring(1); // Remove leading slash
    } else if (url.startsWith('/uploads/')) {
      // Local URL format: /uploads/filename.jpg
      s3Key = url.substring(1); // Remove leading slash
    } else {
      return NextResponse.json(
        { success: false, error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    }

    console.log(`Generating thumbnail for S3 key: ${s3Key}`);

    // Generate thumbnail key
    const pathParts = s3Key.split('/');
    const fileName = pathParts.pop()!;
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const fileExt = fileName.substring(fileName.lastIndexOf('.'));
    const thumbnailFileName = `${fileNameWithoutExt}_thumb_${width}x${height}${fileExt}`;
    const thumbnailKey = [...pathParts, 'thumbnails', thumbnailFileName].join('/');

    // Check if thumbnail already exists on S3
    try {
      const existingThumbnailUrl = `${process.env.AWS_S3_BUCKET_URL}/${thumbnailKey}`;

      // Try to fetch existing thumbnail (simple HEAD request check)
      const headResponse = await fetch(existingThumbnailUrl, { method: 'HEAD' });
      if (headResponse.ok) {
        return NextResponse.json({
          success: true,
          thumbnailUrl: existingThumbnailUrl,
          fromCache: true,
        });
      }
    } catch (error) {
      // Thumbnail doesn't exist, continue to generate
      console.log('Thumbnail not found in cache, generating new one...');
    }

    // Download original file from S3
    const originalUrl = url.startsWith('http') ? url : `${process.env.AWS_S3_BUCKET_URL}/${s3Key}`;

    let originalImageResponse: Response;
    try {
      originalImageResponse = await fetch(originalUrl);
      if (!originalImageResponse.ok) {
        throw new Error(`HTTP ${originalImageResponse.status}`);
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Orijinal dosya indirilemedi' },
        { status: 404 }
      );
    }

    const originalImageBuffer = Buffer.from(await originalImageResponse.arrayBuffer());

    // Generate thumbnail using Sharp
    let thumbnailBuffer: Buffer;
    try {
      thumbnailBuffer = await sharp(originalImageBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Thumbnail oluşturulamadı' },
        { status: 500 }
      );
    }

    // Upload thumbnail to S3
    const uploadResult = await S3UploadService.uploadFile(
      thumbnailBuffer,
      thumbnailFileName,
      'image/jpeg',
      pathParts.join('/') + '/thumbnails'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Thumbnail S3\'e yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      thumbnailUrl: uploadResult.url,
      thumbnailKey: uploadResult.key,
      dimensions: { width, height },
      size: thumbnailBuffer.length,
      fromCache: false,
    });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Thumbnail oluşturulurken hata oluştu'
      },
      { status: 500 }
    );
  }
}
