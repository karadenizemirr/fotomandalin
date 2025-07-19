import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const { url, width = 300, height = 300 } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL gerekli' },
        { status: 400 }
      );
    }

    // Convert URL to file path
    const filePath = path.join(process.cwd(), 'public', url);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Generate thumbnail filename
    const originalDir = path.dirname(filePath);
    const originalName = path.basename(filePath, path.extname(filePath));
    const originalExt = path.extname(filePath);
    const thumbnailName = `${originalName}_thumb_${width}x${height}${originalExt}`;
    const thumbnailPath = path.join(originalDir, thumbnailName);
    const thumbnailUrl = url.replace(path.basename(url), thumbnailName);

    // Check if thumbnail already exists
    if (existsSync(thumbnailPath)) {
      return NextResponse.json({
        success: true,
        thumbnailUrl,
      });
    }

    // Generate thumbnail
    await sharp(filePath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return NextResponse.json({
      success: true,
      thumbnailUrl,
    });

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Thumbnail generation failed' 
      },
      { status: 500 }
    );
  }
}
