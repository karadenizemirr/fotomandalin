import { emailService, EmailTemplates } from '@/lib/email';
import { prisma } from '@/server/prisma/client';

// Email Helper Functions
export class EmailHelper {
  // Rezervasyon onay emaili gönder
  static async sendBookingConfirmation({
    bookingId,
    customerEmail,
    customerName,
    serviceName,
    date,
    time,
    location,
    totalAmount,
  }: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
    totalAmount: number;
  }) {
    try {
      const template = EmailTemplates.bookingConfirmation({
        customerName,
        bookingId,
        serviceName,
        date,
        time,
        location,
        totalAmount,
      });

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Booking confirmation email result:', result);
      return result;
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email gönderme hatası' };
    }
  }

  // Ödeme onay emaili gönder
  static async sendPaymentConfirmation({
    bookingId,
    customerEmail,
    customerName,
    amount,
    paymentMethod,
    transactionId,
  }: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  }) {
    try {
      const template = EmailTemplates.paymentConfirmation({
        customerName,
        bookingId,
        amount,
        paymentMethod,
        transactionId,
      });

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Payment confirmation email result:', result);
      return result;
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email gönderme hatası' };
    }
  }

  // Hoş geldin emaili gönder
  static async sendWelcomeEmail({
    customerEmail,
    customerName,
    temporaryPassword,
  }: {
    customerEmail: string;
    customerName: string;
    temporaryPassword?: string;
  }) {
    try {
      const template = EmailTemplates.welcomeEmail({
        customerName,
        email: customerEmail,
        temporaryPassword,
      });

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Welcome email result:', result);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email gönderme hatası' };
    }
  }

  // Çekim hatırlatma emaili gönder
  static async sendShootingReminder({
    bookingId,
    customerEmail,
    customerName,
    serviceName,
    date,
    time,
    location,
    photographerName,
    photographerPhone,
  }: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
    photographerName?: string;
    photographerPhone?: string;
  }) {
    try {
      const template = EmailTemplates.shootingReminder({
        customerName,
        bookingId,
        serviceName,
        date,
        time,
        location,
        photographerName: photographerName || 'Fotoğrafçımız',
        photographerPhone: photographerPhone || 'Belirtilmemiş',
      });

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Shooting reminder email result:', result);
      return result;
    } catch (error) {
      console.error('Error sending shooting reminder email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email gönderme hatası' };
    }
  }

  // Rezervasyon iptal emaili gönder
  static async sendBookingCancellation({
    bookingId,
    customerEmail,
    customerName,
    serviceName,
    reason,
  }: {
    bookingId: string;
    customerEmail: string;
    customerName: string;
    serviceName: string;
    reason?: string;
  }) {
    try {
      const template = EmailTemplates.bookingCancellation({
        customerName,
        bookingId,
        serviceName,
        reason,
      });

      const result = await emailService.sendEmail({
        to: customerEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log('Booking cancellation email result:', result);
      return result;
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Email gönderme hatası' };
    }
  }

  // Yarın çekimi olan müşterilere hatırlatma emaili gönder
  static async sendTomorrowReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Yarın çekimi olan rezervasyonları getir
      const bookings = await prisma.booking.findMany({
        where: {
          startTime: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
          status: 'CONFIRMED',
        },
        include: {
          package: true,
          location: true,
          staff: true,
        },
      });

      console.log(`Found ${bookings.length} bookings for tomorrow reminder`);

      // Her rezervasyon için hatırlatma emaili gönder
      for (const booking of bookings) {
        await this.sendShootingReminder({
          bookingId: booking.id,
          customerEmail: booking.customerEmail,
          customerName: booking.customerName,
          serviceName: booking.package?.name || 'Fotoğraf Çekimi',
          date: booking.startTime.toLocaleDateString('tr-TR'),
          time: booking.startTime.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          location: booking.location?.name || 'Belirtilmemiş',
          photographerName: booking.staff?.name || 'Fotoğrafçımız',
          photographerPhone: booking.staff?.phone || 'Belirtilmemiş',
        });

        // Küçük bir bekleme ekle (rate limiting için)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return { success: true, count: bookings.length };
    } catch (error) {
      console.error('Error sending tomorrow reminders:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Hatırlatma emaili hatası' };
    }
  }

  // SMTP bağlantısını test et
  static async testConnection() {
    try {
      const result = await emailService.testConnection();
      console.log('SMTP connection test result:', result);
      return result;
    } catch (error) {
      console.error('Error testing SMTP connection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'SMTP test hatası' };
    }
  }
}
