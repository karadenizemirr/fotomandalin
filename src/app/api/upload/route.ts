import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

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
    
    // Validate file
    validateFile(file, config);

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', config.uploadPath || 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/${config.uploadPath || 'uploads'}/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate thumbnail for images if requested
    let thumbnailUrl = null;
    if (config.generateThumbnail && file.type.startsWith('image/')) {
      try {
        thumbnailUrl = await generateThumbnail(buffer, fileName, uploadDir);
      } catch (error) {
        console.warn('Thumbnail generation failed:', error);
      }
    }

    // Create response file object
    const uploadedFile = {
      id: randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      thumbnailUrl,
      uploadedAt: new Date(),
      status: 'success' as const,
    };

    return NextResponse.json({
      success: true,
      file: uploadedFile,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
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

    // Convert URL to file path
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Check if file exists and delete
    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);

      // Also delete thumbnail if exists
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL gerekli' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', url);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    const { stat } = await import('fs/promises');
    const stats = await stat(filePath);

    return NextResponse.json({
      success: true,
      info: {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url,
      },
    });

  } catch (error) {
    console.error('Get file info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get file info' },
      { status: 500 }
    );
  }
}

function validateFile(file: File, config: UploadConfig) {
  // Check file size
  const maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(`Dosya boyutu ${formatFileSize(maxSize)} limitini aşıyor`);
  }

  // Check file type
  if (config.allowedTypes && config.allowedTypes.length > 0) {
    const isAllowed = config.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error(`Desteklenmeyen dosya türü: ${file.type}`);
    }
  }
}

async function generateThumbnail(
  buffer: Buffer, 
  originalFileName: string, 
  uploadDir: string
): Promise<string> {
  const thumbnailFileName = originalFileName.replace(/(\.[^.]+)$/, '_thumb$1');
  const thumbnailPath = path.join(uploadDir, thumbnailFileName);
  const thumbnailUrl = `/uploads/${thumbnailFileName}`;

  await sharp(buffer)
    .resize(300, 300, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return thumbnailUrl;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
