import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailTemplates } from '@/lib/email';

// Ödeme onay emaili gönderme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      customerName,
      bookingId,
      amount,
      paymentMethod,
      transactionId,
    } = body;

    // Validation
    if (!to || !customerName || !bookingId || !amount || !paymentMethod || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }

    // Email şablonunu hazırla
    const template = EmailTemplates.paymentConfirmation({
      customerName,
      bookingId,
      amount,
      paymentMethod,
      transactionId,
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
          message: 'Ödeme onay emaili gönderildi',
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
    console.error('Ödeme email hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email gönderme hatası' 
      },
      { status: 500 }
    );
  }
}
