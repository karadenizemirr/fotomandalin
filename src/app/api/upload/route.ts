import { NextRequest, NextResponse } from 'next/server';
import { S3UploadService } from '@/lib/s3-upload';

interface UploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  uploadPath?: string;
  generateThumbnail?: boolean;
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
    
    // Convert file to buffer for S3 upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file using S3 service
    const validation = S3UploadService.validateFile(
      buffer,
      file.name,
      config.maxSize || 10 * 1024 * 1024 // 10MB default
    );

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Upload to S3
    const uploadResult = await S3UploadService.uploadFile(
      buffer,
      file.name,
      file.type,
      config.uploadPath || 'uploads'
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    // Return success response with S3 URLs - Upload component'ine uygun format
    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.key || `${Date.now()}_${Math.random()}`, // S3 key'i id olarak kullan
        name: file.name,
        size: file.size,
        type: file.type,
        url: uploadResult.url!,
        thumbnailUrl: uploadResult.thumbnailUrl || null,
        uploadedAt: new Date().toISOString(),
        status: 'success',
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

// DELETE metodu - Upload component'inin deleteFile fonksiyonu için
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL gerekli' },
        { status: 400 }
      );
    }

    // URL'den S3 key'ini çıkar
    let key: string;

    if (url.includes(process.env.AWS_S3_BUCKET_URL || '')) {
      // S3 URL'inden key'i çıkar
      const bucketUrl = process.env.AWS_S3_BUCKET_URL || '';
      key = url.replace(bucketUrl + '/', '');
    } else if (url.startsWith('http')) {
      // Başka bir URL formatı ise hata döndür
      return NextResponse.json(
        { success: false, error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    } else {
      // Zaten key formatında
      key = url;
    }

    console.log('Deleting S3 object with key:', key);

    // S3'ten dosyayı sil
    const deleteResult = await S3UploadService.deleteFile(key);

    // Thumbnail varsa onu da sil
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

// Handle preflight OPTIONS requests for CORS
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
