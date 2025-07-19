import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailTemplates } from '@/lib/email';

// Hoş geldin emaili gönderme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      customerName,
      email,
      temporaryPassword,
    } = body;

    // Validation
    if (!to || !customerName || !email) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik: to, customerName, email' },
        { status: 400 }
      );
    }

    // Email şablonunu hazırla
    const template = EmailTemplates.welcomeEmail({
      customerName,
      email,
      temporaryPassword,
    });

    // Email gönder
    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Hoş geldin emaili gönderildi',
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
    console.error('Hoş geldin email hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email gönderme hatası' 
      },
      { status: 500 }
    );
  }
}
