import { NextRequest, NextResponse } from 'next/server';
import { S3UploadService } from '@/lib/s3-upload';
import { ModernWebPService } from '@/lib/image/modern-webp-service';

interface UploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  uploadPath?: string;
  generateThumbnail?: boolean;
  convertToWebP?: boolean;
  webpQuality?: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const configStr = formData.get('config') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    const config: UploadConfig = configStr ? JSON.parse(configStr) : {};
    
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let finalFileName = file.name;
    let finalMimeType = file.type;
    let finalSize = file.size;
    let webpMetadata: { width?: number; height?: number } = {};

    const shouldConvertToWebP = (config.convertToWebP !== false) && 
                                file.type.startsWith('image/') && 
                                !file.type.includes('svg') && 
                                !file.type.includes('gif');

    if (shouldConvertToWebP) {
      try {
        console.log(`🔄 Modern WebP dönüşümü başlatılıyor: ${file.name}`);
        
        const webpResult = await ModernWebPService.convertToWebP(buffer, {
          quality: config.webpQuality || 80,
          effort: 4,
          lossless: false
        });

        console.log(`✅ Modern WebP dönüşümü tamamlandı:`, {
          originalSize: `${(webpResult.originalSize / 1024).toFixed(2)}KB`,
          webpSize: `${(webpResult.webpSize / 1024).toFixed(2)}KB`,
          compression: `${webpResult.compressionRatio}%`,
          metadata: webpResult.metadata
        });
        
        buffer = Buffer.from(webpResult.webpBuffer);
        finalSize = buffer.length;
        
        webpMetadata = {
          width: webpResult.metadata?.width,
          height: webpResult.metadata?.height
        };
        
        const nameWithoutExt = finalFileName.substring(0, finalFileName.lastIndexOf('.'));
        finalFileName = `${nameWithoutExt}.webp`;
        finalMimeType = 'image/webp';

        console.log(`🚀 Modern WebP optimizasyon sonuçları:`);
        console.log(`   📁 Dosya: ${file.name} → ${finalFileName}`);
        console.log(`   💾 Boyut: ${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(finalSize / (1024 * 1024)).toFixed(2)}MB`);
        console.log(`   📈 Kazanç: ${webpResult.compressionRatio}%`);
        console.log(`   🖼️  Çözünürlük: ${webpMetadata.width}x${webpMetadata.height}`);
      } catch (webpError) {
        console.error(`❌ Modern WebP dönüşümü hatası: ${webpError}`);
        console.error(`   📄 Dosya: ${file.name}`);
        console.error(`   📝 Hata detayı:`, webpError);
      }
    }

    const validation = S3UploadService.validateFile(
      buffer,
      finalFileName,
      config.maxSize || 10 * 1024 * 1024
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const uploadResult = await S3UploadService.uploadFile(
      buffer,
      finalFileName,
      finalMimeType,
      config.uploadPath || 'uploads'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.key || `${Date.now()}_${Math.random()}`,
        name: file.name,
        originalName: file.name,
        finalName: finalFileName,
        size: finalSize,
        originalSize: file.size,
        type: file.type,
        finalType: finalMimeType,
        url: uploadResult.url!,
        thumbnailUrl: uploadResult.thumbnailUrl || null,
        uploadedAt: new Date().toISOString(),
        status: 'success',
        metadata: {
          ...webpMetadata,
          convertedToWebP: shouldConvertToWebP,
          compressionRatio: shouldConvertToWebP 
            ? Math.round((1 - (finalSize / file.size)) * 100)
            : 0
        }
      },
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL gerekli' },
        { status: 400 }
      );
    }

    let key: string;

    if (url.includes(process.env.AWS_S3_BUCKET_URL || '')) {
      const bucketUrl = process.env.AWS_S3_BUCKET_URL || '';
      key = url.replace(bucketUrl + '/', '');
    } else if (url.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    } else {
      key = url;
    }

    console.log('Deleting S3 object with key:', key);

    const deleteResult = await S3UploadService.deleteFile(key);

    if (key.includes('/') && !key.includes('/thumbnails/')) {
      const pathParts = key.split('/');
      const folder = pathParts.slice(0, -1).join('/');
      const filename = pathParts[pathParts.length - 1];
      const nameWithoutExt = filename.split('.')[0];
      const thumbnailKey = `${folder}/thumbnails/${nameWithoutExt}_thumb.jpg`;

      try {
        await S3UploadService.deleteFile(thumbnailKey);
      } catch (error) {
        console.log('Thumbnail silme hatası (normal olabilir):', error);
      }
    }

    return NextResponse.json({
      success: deleteResult,
      message: deleteResult ? 'Dosya başarıyla silindi' : 'Dosya silinemedi'
    });

  } catch (error) {
    console.error('Delete API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Silme işlemi başarısız'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}