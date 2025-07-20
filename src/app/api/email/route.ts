import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

// Email gönderme API endpoint'i
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text, attachments } = body;

    // Basit validation
    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik: to, subject, html/text' },
        { status: 400 }
      );
    }

    // Email gönder
    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text,
      attachments,
    });

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Email başarıyla gönderildi',
          messageId: result.messageId 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu' 
      },
      { status: 500 }
    );
  }
}

// SMTP bağlantı testi endpoint'i
export async function GET() {
  try {
    const result = await emailService.testConnection();
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SMTP test hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMTP test hatası' 
      },
      { status: 500 }
    );
  }
}
