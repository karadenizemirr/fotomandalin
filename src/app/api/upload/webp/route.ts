import { NextRequest, NextResponse } from 'next/server';
import { WebPService } from '@/lib/image/webp-service';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Yüklenen dosyaları WebP formatına dönüştüren API endpoint'i
 */
export async function POST(request: NextRequest) {
  try {
    // Formdata'yı işle
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı.' },
        { status: 400 }
      );
    }

    // Parametreleri al
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined;
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string) : 85;
    const generateThumbnail = formData.get('generateThumbnail') === 'true';

    // Yükleme dizinini oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Her dosyayı işle
    const results = await Promise.all(
      files.map(async (file) => {
        // Dosyayı temp olarak kaydet
        const buffer = Buffer.from(await file.arrayBuffer());
        const tempFileName = `${uuidv4()}_temp`;
        const tempFilePath = join(uploadDir, tempFileName);

        await writeFile(tempFilePath, buffer);

        // WebP'ye dönüştür
        const result = await WebPService.convertToWebP(tempFilePath, {
          quality,
          width,
          height,
          generateThumbnail,
          outputDir: uploadDir,
        });

        // Temp dosyasını sil
        await import('fs').then(fs => fs.promises.unlink(tempFilePath));

        return result;
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Dosya yükleme hatası:', error);

    return NextResponse.json(
      { error: `Dosya yükleme hatası: ${error.message}` },
      { status: 500 }
    );
  }
}
