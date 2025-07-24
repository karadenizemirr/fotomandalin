# GitHub Secrets Konfigürasyonu - EC2 Deployment

## Repository Settings > Secrets and Variables > Actions bölümüne eklenecek secrets:

### 🖥️ EC2 Connection Secrets

EC2_HOST=your-ec2-public-ip # EC2 public IP adresi
EC2_USER=ubuntu # EC2 kullanıcı adı
EC2_SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[EC2 private key içeriğini buraya yapıştırın]
-----END OPENSSH PRIVATE KEY-----

### 🗄️ Database Secrets

DB_PASSWORD=your-strong-database-password # Güçlü bir database şifresi

### 🔐 Authentication Secrets

NEXTAUTH_URL=https://your-domain.com # Domain adresiniz
NEXTAUTH_SECRET=your-32-char-secret-key # 32+ karakter secret

### 💳 Payment Integration (iyzico)

IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com # Test için

### ☁️ AWS S3 Secrets

AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1 # Mevcut region'ınız
AWS_S3_BUCKET_NAME=fotomandalin # Bucket adınız

### 📧 Email Configuration

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password # Gmail App Password

### 🔒 SSL (Opsiyonel)

SSL_EMAIL=your-email@domain.com # Let's Encrypt için
DOMAIN=your-domain.com # Domain adınız

## 📝 Not:

- EC2_SSH_PRIVATE_KEY: EC2 key pair'ınızın .pem dosyasının tam içeriği
- NEXTAUTH_SECRET: openssl rand -base64 32 komutu ile oluşturabilirsiniz
- Domain yoksa NEXTAUTH_URL ve DOMAIN için EC2 IP adresi kullanın
