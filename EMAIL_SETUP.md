# 📧 Email Sistem Kurulumu ve Kullanımı

Bu proje için SMTP tabanlı email gönderimi sistemi kurulmuştur. Aşağıda kurulum ve kullanım detayları bulunmaktadır.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [SMTP Yapılandırması](#smtp-yapılandırması)
- [Email Şablonları](#email-şablonları)
- [API Endpoints](#api-endpoints)
- [Kullanım Örnekleri](#kullanım-örnekleri)
- [Cron Jobs](#cron-jobs)
- [Sorun Giderme](#sorun-giderme)

## ✨ Özellikler

- **Rezervasyon onay emaili**: Müşterilere rezervasyon detayları gönderilir
- **Ödeme onay emaili**: Ödeme başarılı olduğunda fatura emaili gönderilir
- **Hoş geldin emaili**: Yeni kullanıcı kaydında otomatik email
- **Çekim hatırlatma emaili**: Çekim gününden bir gün önce hatırlatma
- **Rezervasyon iptal emaili**: İptal durumunda bilgilendirme
- **Responsive email şablonları**: Mobil uyumlu modern tasarım
- **Otomatik cron job sistemi**: Günlük hatırlatma emailleri
- **SMTP test sistemi**: Bağlantı durumu kontrolü

## 🚀 Kurulum

### 1. Gerekli Paketler Yüklendi

```bash
npm install nodemailer @types/nodemailer
```

### 2. Environment Variables (.env dosyası)

`.env.example` dosyasını `.env.local` olarak kopyalayın ve SMTP bilgilerinizi ekleyin:

```env
# Email/SMTP Yapılandırması
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Gönderen Bilgileri
SMTP_FROM_NAME=Fotomandalin
SMTP_FROM_EMAIL=noreply@fotomandalin.com

# Cron Job Güvenliği
CRON_SECRET=your-secret-key-for-cron-jobs
```

## 📧 SMTP Yapılandırması

### Gmail Kullanımı (Önerilen)

1. Gmail hesabınızda 2FA'yı etkinleştirin
2. Uygulama şifresi oluşturun:
   - Google Hesap → Güvenlik → 2 Adımlı Doğrulama → Uygulama şifreleri
3. Environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Diğer Email Sağlayıcıları

**Outlook/Hotmail:**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Yahoo:**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

**Özel Domain/Hosting:**

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
```

## 📋 Email Şablonları

### 1. Rezervasyon Onay Emaili

```typescript
EmailTemplates.bookingConfirmation({
  customerName: "Ahmet Yılmaz",
  bookingId: "BK-2025-123456",
  serviceName: "Düğün Fotoğrafçılığı",
  date: "20 Şubat 2025",
  time: "14:00",
  location: "İstanbul - Emirgan",
  totalAmount: 2500,
});
```

### 2. Ödeme Onay Emaili

```typescript
EmailTemplates.paymentConfirmation({
  customerName: "Ahmet Yılmaz",
  bookingId: "BK-2025-123456",
  amount: 2500,
  paymentMethod: "Kredi Kartı",
  transactionId: "TXN123456789",
});
```

### 3. Hoş Geldin Emaili

```typescript
EmailTemplates.welcomeEmail({
  customerName: "Ahmet Yılmaz",
  email: "ahmet@example.com",
  temporaryPassword: "temp123", // İsteğe bağlı
});
```

## 🔌 API Endpoints

### Email Gönderimi

```
POST /api/email
```

Genel email gönderimi

### Rezervasyon Onay Emaili

```
POST /api/email/booking-confirmation
```

### Ödeme Onay Emaili

```
POST /api/email/payment-confirmation
```

### Hoş Geldin Emaili

```
POST /api/email/welcome
```

### Çekim Hatırlatma Emaili

```
POST /api/email/shooting-reminder
```

### SMTP Test

```
GET /api/email
```

SMTP bağlantısını test eder

## 💡 Kullanım Örnekleri

### 1. Rezervasyon Sonrası Email Gönderimi

```typescript
// pages/api/payment/iyzico.ts içinde otomatik çalışır
const emailResult = await fetch("/api/email/booking-confirmation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: "customer@example.com",
    customerName: "Ahmet Yılmaz",
    bookingId: "BK-2025-123456",
    serviceName: "Düğün Fotoğrafçılığı",
    date: "20 Şubat 2025",
    time: "14:00",
    location: "İstanbul - Emirgan",
    totalAmount: 2500,
  }),
});
```

### 2. Manuel Email Gönderimi

```typescript
import { EmailHelper } from "@/lib/emailHelper";

// Hoş geldin emaili gönder
await EmailHelper.sendWelcomeEmail({
  customerEmail: "yeni@kullanici.com",
  customerName: "Yeni Kullanıcı",
  temporaryPassword: "temp123",
});

// Çekim hatırlatması gönder
await EmailHelper.sendShootingReminder({
  bookingId: "BK-2025-123456",
  customerEmail: "customer@example.com",
  customerName: "Ahmet Yılmaz",
  serviceName: "Düğün Fotoğrafçılığı",
  date: "20 Şubat 2025",
  time: "14:00",
  location: "İstanbul - Emirgan",
  photographerName: "Mehmet Öz",
  photographerPhone: "0555 123 4567",
});
```

## ⏰ Cron Jobs

### Günlük Hatırlatma Sistemi

Her gün yarın çekimi olan müşterilere hatırlatma emaili gönderir.

```
POST /api/cron/daily-reminders
Authorization: Bearer your-cron-secret
```

### Vercel Cron Job Kurulumu

`vercel.json` dosyasına ekleyin:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Manuel Cron Job Test

```bash
curl -X POST https://yourdomain.com/api/cron/daily-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

## 🔧 Sorun Giderme

### 1. SMTP Bağlantı Hatası

**Problem:** "SMTP connection failed"
**Çözüm:**

- Environment variables'ları kontrol edin
- Gmail için uygulama şifresi kullandığınızdan emin olun
- Firewall/güvenlik duvarı ayarlarını kontrol edin

### 2. Email Gönderilmiyor

**Test Endpoint:**

```bash
curl http://localhost:3000/api/email
```

**Kontrol Listesi:**

- [ ] SMTP bilgileri doğru mu?
- [ ] Email provider'ınızda SMTP etkin mi?
- [ ] Uygulama şifresi kullanılıyor mu? (Gmail için)
- [ ] Server'da port 587 açık mı?

### 3. Email Şablonu Hatalı

**Problem:** Email içeriği bozuk görünüyor
**Çözüm:**

- Email client'ınızda HTML desteği var mı?
- Şablon data'sı tam gönderildi mi?
- Console'da error mesajları var mı?

### 4. Cron Job Çalışmıyor

**Kontrol Listesi:**

- [ ] CRON_SECRET doğru ayarlandı mı?
- [ ] Vercel cron job ayarları doğru mu?
- [ ] Authorization header gönderiliyor mu?

## 📊 Email Durumları

### Başarılı Email Log'ları

```
✅ Booking confirmation email sent successfully
✅ Payment confirmation email sent successfully
✅ Welcome email sent successfully
```

### Hata Log'ları

```
❌ Failed to send booking confirmation email: SMTP Error
❌ Error sending payment confirmation email: Invalid credentials
```

## 🎯 Performans İpuçları

1. **Rate Limiting**: Email provider'ınızın günlük/saatlik limitlerini kontrol edin
2. **Batch Processing**: Çok sayıda email için batch işleme kullanın
3. **Error Handling**: Email hataları rezervasyon işlemini durdurmamalı
4. **Retry Logic**: Başarısız emailler için yeniden deneme mekanizması
5. **Monitoring**: Email gönderim başarı oranlarını takip edin

## 📞 Destek

Email sistemi ile ilgili problemlerde:

1. Önce SMTP test endpoint'ini çalıştırın: `GET /api/email`
2. Console log'larını kontrol edin
3. Environment variables'ları doğrulayın
4. Email provider'ınızın dokümantasyonunu inceleyin

---

**Son Güncelleme:** 18 Temmuz 2025
**Versiyon:** 1.0.0
