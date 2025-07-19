import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailTemplates } from '@/lib/email';

// Rezervasyon onay emaili gönderme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      customerName,
      bookingId,
      serviceName,
      date,
      time,
      location,
      totalAmount,
    } = body;

    // Validation
    if (!to || !customerName || !bookingId || !serviceName || !date || !time || !location || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Email şablonunu hazırla
    const template = EmailTemplates.bookingConfirmation({
      customerName,
      bookingId,
      serviceName,
      date,
      time,
      location,
      totalAmount,
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
          message: 'Rezervasyon onay emaili gönderildi',
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
    console.error('Rezervasyon email hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email gönderme hatası' 
      },
      { status: 500 }
    );
  }
}
