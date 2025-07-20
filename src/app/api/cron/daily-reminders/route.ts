import { NextRequest, NextResponse } from 'next/server';
import { EmailHelper } from '@/lib/emailHelper';

// Cron job endpoint'i - günlük hatırlatma emailleri gönder
export async function POST(request: NextRequest) {
  try {
    // Basit güvenlik kontrolü (production'da daha güçlü authentication kullanın)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily email reminders cron job...');

    // Yarın çekimi olan müşterilere hatırlatma emaili gönder
    const result = await EmailHelper.sendTomorrowReminders();

    if (result.success) {
      console.log(`Cron job completed successfully. Sent reminders to ${result.count} customers.`);
      return NextResponse.json(
        { 
          success: true, 
          message: `Hatırlatma emailleri gönderildi`,
          count: result.count 
        },
        { status: 200 }
      );
    } else {
      console.error('Cron job failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cron job hatası' 
      },
      { status: 500 }
    );
  }
}

// SMTP bağlantı testi için GET endpoint'i
export async function GET() {
  try {
    console.log('Testing SMTP connection...');
    const result = await EmailHelper.testConnection();
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'SMTP bağlantısı başarılı' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SMTP test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMTP test hatası' 
      },
      { status: 500 }
    );
  }
}
