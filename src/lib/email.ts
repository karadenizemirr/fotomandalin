import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Email service yapılandırması
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private emailSettings: any = null;

  // Initialize email settings from database
  private async initializeSettings() {
    if (this.emailSettings) return this.emailSettings;

    try {
      const emailIntegration = await prisma.emailIntegration.findFirst({
        where: {
          isActive: true,
        },
      });

      if (!emailIntegration) {
        throw new Error('Aktif email entegrasyonu bulunamadı');
      }

      this.emailSettings = emailIntegration;
      return emailIntegration;
    } catch (error) {
      console.error('Email settings initialization error:', error);
      throw error;
    }
  }

  // Initialize transporter with database settings
  private async initializeTransporter() {
    if (this.transporter) return this.transporter;

    const settings = await this.initializeSettings();

    this.transporter = nodemailer.createTransport({
      host: settings.smtpHost || 'smtp.gmail.com',
      port: parseInt(settings.smtpPort || '587'),
      secure: settings.smtpSecure || false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    });

    return this.transporter;
  }

  // Email gönderme ana metodu
  async sendEmail({
    to,
    subject,
    html,
    text,
    attachments,
  }: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
  }) {
    try {
      const transporter = await this.initializeTransporter();
      const settings = await this.initializeSettings();

      const mailOptions = {
        from: `${settings.fromName || 'Fotomandalin'} <${settings.fromEmail || settings.smtpUser}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text,
        attachments,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email gönderildi:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email gönderme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu' 
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  // SMTP bağlantısını test etme
  async testConnection() {
    try {
      const transporter = await this.initializeTransporter();
      await transporter.verify();
      console.log('SMTP bağlantısı başarılı');
      return { success: true, message: 'SMTP bağlantısı başarılı' };
    } catch (error) {
      console.error('SMTP bağlantı hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMTP bağlantı hatası' 
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  // Get site settings for email templates
  private async getSiteSettings() {
    try {
      const siteSettings = await prisma.siteSettings.findFirst();
      return siteSettings;
    } catch (error) {
      console.error('Site settings fetch error:', error);
      return null;
    }
  }
}

// Email şablonları
export const EmailTemplates = {
  // Rezervasyon onay emaili
  bookingConfirmation: ({
    customerName,
    bookingId,
    serviceName,
    date,
    time,
    location,
    totalAmount,
    siteName = 'Fotomandalin',
    siteUrl = process.env.NEXTAUTH_URL,
  }: {
    customerName: string;
    bookingId: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
    totalAmount: number;
    siteName?: string;
    siteUrl?: string;
  }) => ({
    subject: `Rezervasyon Onayı - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rezervasyon Onayı</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .booking-details { 
              background: #f9fafb; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px; 
              padding-bottom: 10px; 
              border-bottom: 1px solid #e5e7eb; 
            }
            .detail-row:last-child { 
              border-bottom: none; 
              margin-bottom: 0; 
              padding-bottom: 0; 
              font-weight: bold; 
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: #ff6b35; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            @media (max-width: 600px) {
              body { padding: 10px; }
              .header, .content, .footer { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rezervasyon Onaylandı! ✨</h1>
            <p>Merhaba ${customerName}, rezervasyonunuz başarıyla oluşturuldu.</p>
          </div>
          
          <div class="content">
            <p>Rezervasyon detaylarınız aşağıdaki gibidir:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span>Rezervasyon No:</span>
                <span><strong>${bookingId}</strong></span>
              </div>
              <div class="detail-row">
                <span>Hizmet:</span>
                <span>${serviceName}</span>
              </div>
              <div class="detail-row">
                <span>Tarih:</span>
                <span>${date}</span>
              </div>
              <div class="detail-row">
                <span>Saat:</span>
                <span>${time}</span>
              </div>
              <div class="detail-row">
                <span>Lokasyon:</span>
                <span>${location}</span>
              </div>
              <div class="detail-row">
                <span>Toplam Tutar:</span>
                <span>${totalAmount.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
            
            <p>Çekim gününden önce size detaylı bilgi vereceğiz. Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
            
            <div style="text-align: center;">
              <a href="${siteUrl}/booking/${bookingId}" class="button">
                Rezervasyonu Görüntüle
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>${siteName}</strong></p>
            <p>Profesyonel fotoğraf çekimi hizmetleri</p>
            <p>Bu email otomatik olarak gönderilmiştir.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Rezervasyon Onayı - ${bookingId}
      
      Merhaba ${customerName},
      
      Rezervasyonunuz başarıyla oluşturuldu.
      
      Rezervasyon Detayları:
      - Rezervasyon No: ${bookingId}
      - Hizmet: ${serviceName}
      - Tarih: ${date}
      - Saat: ${time}
      - Lokasyon: ${location}
      - Toplam Tutar: ${totalAmount.toLocaleString('tr-TR')} ₺
      
      Çekim gününden önce size detaylı bilgi vereceğiz.
      
      ${siteName}
      Profesyonel fotoğraf çekimi hizmetleri
    `,
  }),

  // Rezervasyon iptal emaili
  bookingCancellation: ({
    customerName,
    bookingId,
    serviceName,
    reason,
  }: {
    customerName: string;
    bookingId: string;
    serviceName: string;
    reason?: string;
  }) => ({
    subject: `Rezervasyon İptali - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rezervasyon İptali</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #ef4444; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rezervasyon İptal Edildi</h1>
          </div>
          
          <div class="content">
            <p>Merhaba ${customerName},</p>
            <p><strong>${bookingId}</strong> numaralı rezervasyonunuz iptal edilmiştir.</p>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>İptal Edilen Hizmet:</strong> ${serviceName}</p>
              ${reason ? `<p><strong>İptal Sebebi:</strong> ${reason}</p>` : ''}
            </div>
            
            <p>Ödeme yaptıysanız, iade işlemi 3-5 iş günü içinde hesabınıza yapılacaktır.</p>
            <p>Yeni bir rezervasyon oluşturmak için websitemizi ziyaret edebilirsiniz.</p>
          </div>
          
          <div class="footer">
            <p><strong>Fotomandalin</strong></p>
            <p>Profesyonel fotoğraf çekimi hizmetleri</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Rezervasyon İptali - ${bookingId}
      
      Merhaba ${customerName},
      
      ${bookingId} numaralı rezervasyonunuz iptal edilmiştir.
      
      İptal Edilen Hizmet: ${serviceName}
      ${reason ? `İptal Sebebi: ${reason}` : ''}
      
      Ödeme yaptıysanız, iade işlemi 3-5 iş günü içinde hesabınıza yapılacaktır.
      
      Fotomandalin
      Profesyonel fotoğraf çekimi hizmetleri
    `,
  }),

  // Ödeme onayı emaili
  paymentConfirmation: ({
    customerName,
    bookingId,
    amount,
    paymentMethod,
    transactionId,
  }: {
    customerName: string;
    bookingId: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  }) => ({
    subject: `Ödeme Onayı - ${bookingId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ödeme Onayı</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #10b981; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .payment-details { 
              background: #f0fdf4; 
              border: 1px solid #bbf7d0; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ödeme Başarılı! ✅</h1>
            <p>Ödemeniz başarıyla alınmıştır.</p>
          </div>
          
          <div class="content">
            <p>Merhaba ${customerName},</p>
            <p><strong>${bookingId}</strong> numaralı rezervasyonunuz için ödemeniz başarıyla tamamlanmıştır.</p>
            
            <div class="payment-details">
              <h3>Ödeme Detayları</h3>
              <p><strong>Tutar:</strong> ${amount.toLocaleString('tr-TR')} ₺</p>
              <p><strong>Ödeme Yöntemi:</strong> ${paymentMethod}</p>
              <p><strong>İşlem No:</strong> ${transactionId}</p>
              <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            
            <p>Bu belgeyi fatura yerine geçer. Fişinizi saklamanızı öneririz.</p>
          </div>
          
          <div class="footer">
            <p><strong>Fotomandalin</strong></p>
            <p>Profesyonel fotoğraf çekimi hizmetleri</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Ödeme Onayı - ${bookingId}
      
      Merhaba ${customerName},
      
      ${bookingId} numaralı rezervasyonunuz için ödemeniz başarıyla tamamlanmıştır.
      
      Ödeme Detayları:
      - Tutar: ${amount.toLocaleString('tr-TR')} ₺
      - Ödeme Yöntemi: ${paymentMethod}
      - İşlem No: ${transactionId}
      - Tarih: ${new Date().toLocaleDateString('tr-TR')}
      
      Bu belgeyi fatura yerine geçer.
      
      Fotomandalin
      Profesyonel fotoğraf çekimi hizmetleri
    `,
  }),

  // Çekim hatırlatma emaili
  shootingReminder: ({
    customerName,
    bookingId,
    serviceName,
    date,
    time,
    location,
    photographerName,
    photographerPhone,
  }: {
    customerName: string;
    bookingId: string;
    serviceName: string;
    date: string;
    time: string;
    location: string;
    photographerName: string;
    photographerPhone: string;
  }) => ({
    subject: `Çekim Hatırlatması - Yarın ${time}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Çekim Hatırlatması</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #3b82f6; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .reminder-box { 
              background: #eff6ff; 
              border: 1px solid #bfdbfe; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .photographer-info { 
              background: #f8fafc; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Çekim Hatırlatması 📸</h1>
            <p>Yarın çekiminiz var!</p>
          </div>
          
          <div class="content">
            <p>Merhaba ${customerName},</p>
            <p>Yarın <strong>${time}</strong> saatinde çekiminiz bulunmaktadır. Hazırlıklarınızı tamamlamayı unutmayın!</p>
            
            <div class="reminder-box">
              <h3>Çekim Detayları</h3>
              <p><strong>Rezervasyon No:</strong> ${bookingId}</p>
              <p><strong>Hizmet:</strong> ${serviceName}</p>
              <p><strong>Tarih:</strong> ${date}</p>
              <p><strong>Saat:</strong> ${time}</p>
              <p><strong>Lokasyon:</strong> ${location}</p>
            </div>
            
            <div class="photographer-info">
              <h3>Fotoğrafçınız</h3>
              <p><strong>İsim:</strong> ${photographerName}</p>
              <p><strong>Telefon:</strong> ${photographerPhone}</p>
              <p>Çekim gününde fotoğrafçınızla direkt iletişime geçebilirsiniz.</p>
            </div>
            
            <h3>Çekim İçin Öneriler:</h3>
            <ul>
              <li>Çekim saatinden 15 dakika önce lokasyonda bulunun</li>
              <li>Yedek kıyafetlerinizi getirmeyi unutmayın</li>
              <li>Doğal görünüm için fazla makyaj yapmayın</li>
              <li>Rahat ve hareketli kıyafetler tercih edin</li>
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>Fotomandalin</strong></p>
            <p>Profesyonel fotoğraf çekimi hizmetleri</p>
            <p>Size harika fotoğraflar çekmeyi sabırsızlıkla bekliyoruz! 📸</p>
          </div>
        </body>
      </html>
    `,
    text: `
      Çekim Hatırlatması - Yarın ${time}
      
      Merhaba ${customerName},
      
      Yarın ${time} saatinde çekiminiz bulunmaktadır.
      
      Çekim Detayları:
      - Rezervasyon No: ${bookingId}
      - Hizmet: ${serviceName}
      - Tarih: ${date}
      - Saat: ${time}
      - Lokasyon: ${location}
      
      Fotoğrafçınız: ${photographerName}
      Telefon: ${photographerPhone}
      
      Çekim İçin Öneriler:
      - Çekim saatinden 15 dakika önce lokasyonda bulunun
      - Yedek kıyafetlerinizi getirmeyi unutmayın
      - Doğal görünüm için fazla makyaj yapmayın
      - Rahat ve hareketli kıyafetler tercih edin
      
      Fotomandalin
      Profesyonel fotoğraf çekimi hizmetleri
    `,
  }),

  // Hoş geldin emaili (yeni kullanıcı kaydı)
  welcomeEmail: ({
    customerName,
    email,
    temporaryPassword,
    siteName = 'Fotomandalin',
    siteUrl = process.env.NEXTAUTH_URL,
  }: {
    customerName: string;
    email: string;
    temporaryPassword?: string;
    siteName?: string;
    siteUrl?: string;
  }) => ({
    subject: `${siteName}'e Hoş Geldiniz! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hoş Geldiniz</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .login-info { 
              background: #fef3c7; 
              border: 1px solid #f59e0b; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f9fafb; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 8px 8px; 
              border: 1px solid #e5e7eb; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: #ff6b35; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Hoş Geldiniz! 🎉</h1>
            <p>${siteName} ailesine katıldığınız için teşekkürler!</p>
          </div>
          
          <div class="content">
            <p>Merhaba ${customerName},</p>
            <p>${siteName}'e hoş geldiniz! Hesabınız başarıyla oluşturuldu ve artık tüm özelliklerimizden faydalanabilirsiniz.</p>
            
            ${temporaryPassword ? `
            <div class="login-info">
              <h3>Giriş Bilgileriniz</h3>
              <p><strong>E-posta:</strong> ${email}</p>
              <p><strong>Geçici Şifre:</strong> ${temporaryPassword}</p>
              <p><em>Güvenliğiniz için ilk girişte şifrenizi değiştirmenizi öneririz.</em></p>
            </div>
            ` : ''}
            
            <h3>Neler Yapabilirsiniz?</h3>
            <ul>
              <li>Kolay rezervasyon yapabilirsiniz</li>
              <li>Geçmiş çekimlerinizi görüntüleyebilirsiniz</li>
              <li>Fotoğraf galerinize erişebilirsiniz</li>
              <li>Profilinizi düzenleyebilirsiniz</li>
              <li>Özel tekliflerden haberdar olabilirsiniz</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${siteUrl}/login" class="button">
                Hesabıma Giriş Yap
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>${siteName}</strong></p>
            <p>Profesyonel fotoğraf çekimi hizmetleri</p>
            <p>En güzel anılarınızı ölümsüzleştirmeye hazırız! 📸</p>
          </div>
        </body>
      </html>
    `,
    text: `
      ${siteName}'e Hoş Geldiniz!
      
      Merhaba ${customerName},
      
      ${siteName}'e hoş geldiniz! Hesabınız başarıyla oluşturuldu.
      
      ${temporaryPassword ? `
      Giriş Bilgileriniz:
      E-posta: ${email}
      Geçici Şifre: ${temporaryPassword}
      
      Güvenliğiniz için ilk girişte şifrenizi değiştirmenizi öneririz.
      ` : ''}
      
      Artık aşağıdaki özellikleri kullanabilirsiniz:
      - Kolay rezervasyon yapabilirsiniz
      - Geçmiş çekimlerinizi görüntüleyebilirsiniz
      - Fotoğraf galerinize erişebilirsiniz
      - Profilinizi düzenleyebilirsiniz
      - Özel tekliflerden haberdar olabilirsiniz
      
      ${siteName}
      Profesyonel fotoğraf çekimi hizmetleri
    `,
  }),
};

// Global email service instance
export const emailService = new EmailService();

// Helper function to get site settings for email templates
export const getSiteSettingsForEmail = async () => {
  try {
    const siteSettings = await prisma.siteSettings.findFirst();
    return {
      siteName: siteSettings?.siteName || 'Fotomandalin',
      siteUrl: siteSettings?.siteUrl || process.env.NEXTAUTH_URL || '',
    };
  } catch (error) {
    console.error('Site settings fetch error:', error);
    return {
      siteName: 'Fotomandalin',
      siteUrl: process.env.NEXTAUTH_URL || '',
    };
  } finally {
    await prisma.$disconnect();
  }
};
