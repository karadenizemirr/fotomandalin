# 🚀 Fotomandalin EC2 Deployment Guide

Bu rehber, Fotomandalin projesi için GitHub Actions kullanarak EC2 üzerine otomatik deployment yapma sürecini adım adım açıklar.

## 🎯 Deployment Özeti

- **Platform:** AWS EC2
- **Container:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **Database:** PostgreSQL
- **CI/CD:** GitHub Actions
- **SSL:** Let's Encrypt (Certbot)

## 📋 Gereksinimler

### EC2 Instance Özellikleri

- **Minimum:** t3.medium (2 vCPU, 4GB RAM)
- **Önerilen:** t3.large (2 vCPU, 8GB RAM)
- **Storage:** 20GB+ SSD
- **OS:** Ubuntu 22.04 LTS
- **Security Group:** 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Node.js)

### Domain ve DNS (İsteğe Bağlı)

- Domain adı (örn: fotomandalin.com)
- A record → EC2 Public IP

## 🚀 Adım Adım Kurulum

### 1️⃣ EC2 Instance Hazırlama

#### AWS Console'da EC2 Kurulumu:

```bash
# EC2 Instance Launch:
# - AMI: Ubuntu 22.04 LTS
# - Instance Type: t3.medium (minimum)
# - Key Pair: Yeni oluştur veya mevcut kullan
# - Security Group: SSH (22), HTTP (80), HTTPS (443), Custom (3000)
```

#### EC2'ya Bağlantı:

```bash
# Local terminalden EC2'ya bağlan
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Docker Kurulumu

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Gerekli diğer paketler
sudo apt install -y git nginx-full certbot python3-certbot-nginx curl

# Docker grubuna dahil olmak için logout/login
sudo reboot
```

### 3️⃣ GitHub SSH Key Setup (Private Repo İçin)

```bash
# EC2'ya tekrar bağlan
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# SSH key oluştur
ssh-keygen -t ed25519 -C "your-email@domain.com"
# Enter'a basarak default ayarları kabul edin

# Public key'i görüntüle
cat ~/.ssh/id_ed25519.pub

# Bu çıktıyı kopyala ve GitHub → Settings → SSH Keys'e ekle
```

#### GitHub SSH Test:

```bash
# SSH bağlantısını test et
ssh -T git@github.com
# "yes" yazıp Enter'a basın
# "Hi username! You've successfully authenticated..." mesajını görmelisiniz
```

### 4️⃣ Projeyi Clone Etme

```bash
# Home dizinine git
cd /home/ubuntu

# SSH ile clone (önerilen)
git clone git@github.com:karadenizemirr/fotomandalin.git

# VEYA HTTPS ile clone (SSH sorunları varsa)
# git clone https://github.com/karadenizemirr/fotomandalin.git

# Proje dizinine gir
cd fotomandalin
ls -la  # Dosyaları kontrol et
```

### 5️⃣ Environment Dosyası Oluşturma

```bash
# .env.production dosyası oluştur
cp .env .env.production

# Dosyayı düzenle
nano .env.production
```

#### .env.production İçeriği:

```bash
# Production Environment
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://fotomandalin_user:fotomandalin_secure_password@postgres:5432/fotomandalin
POSTGRES_PASSWORD=fotomandalin_secure_password

# NextAuth Configuration
NEXTAUTH_URL=http://YOUR_EC2_PUBLIC_IP:3000
NEXTAUTH_SECRET=your-super-secure-secret-minimum-32-characters-long

# AWS S3 Configuration
AWS_S3_BUCKET_NAME=fotomandalin
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_URL=https://fotomandalin.s3.eu-north-1.amazonaws.com

# Application URLs
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_PUBLIC_IP:3000
NEXT_PUBLIC_AWS_S3_BUCKET_URL=https://fotomandalin.s3.eu-north-1.amazonaws.com

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_MAX_FILES=image/jpeg,image/png,image/webp,image/gif,video/mp4
```

**💡 Önemli:** `YOUR_EC2_PUBLIC_IP` kısmını gerçek EC2 public IP'niz ile değiştirin!

### 6️⃣ Docker Compose Production Setup

#### docker-compose.prod.yml'yi Kontrol Et:

```bash
# Dosyanın doğru configure edildiğini kontrol et
cat docker-compose.prod.yml
```

#### İlk Production Build:

```bash
# Container'ları build et ve başlat
docker-compose -f docker-compose.prod.yml up --build -d

# Container durumlarını kontrol et
docker-compose -f docker-compose.prod.yml ps

# Logları takip et
docker-compose -f docker-compose.prod.yml logs -f
```

### 7️⃣ Test ve Doğrulama

```bash
# Container'ların sağlık durumunu kontrol et
docker-compose -f docker-compose.prod.yml ps

# Web uygulamasını test et
curl http://localhost:3000/api/health

# Veya browser'dan
# http://YOUR_EC2_PUBLIC_IP:3000
```

## 🔧 GitHub Actions Otomatik Deployment

### 8️⃣ GitHub Secrets Konfigürasyonu

GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

#### Gerekli Secrets:

```bash
# EC2 Bağlantı Bilgileri
EC2_HOST=your-ec2-public-ip
EC2_USER=ubuntu
EC2_SSH_KEY=your-private-ssh-key-content

# Database
DATABASE_URL=postgresql://fotomandalin_user:fotomandalin_secure_password@postgres:5432/fotomandalin

# NextAuth
NEXTAUTH_URL=http://your-ec2-public-ip:3000
NEXTAUTH_SECRET=your-super-secure-secret-minimum-32-characters

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=fotomandalin

# Application
NODE_ENV=production
```

### 9️⃣ SSL Sertifikası (Domain Varsa)

```bash
# Domain'iniz varsa SSL kurulumu
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run

# Auto-renewal için crontab
sudo crontab -e
# Bu satırı ekleyin:
# 0 2 * * * /usr/bin/certbot renew --quiet
```

## 🔄 Otomatik Deployment

### Local'dan Değişiklik Push Etme:

```bash
# Local'da değişiklik yaptıktan sonra
git add .
git commit -m "Production deployment setup"
git push origin main

# GitHub Actions otomatik olarak:
# ✅ Tests çalıştırır
# 🐳 Docker image build eder
# 📦 GitHub Container Registry'ye push eder
# 🚀 EC2'ya deploy eder
```

## 📊 Monitoring ve Maintenance

### Container Durumu Kontrolü:

```bash
# Container'ları kontrol et
docker-compose -f docker-compose.prod.yml ps

# Logları görüntüle
docker-compose -f docker-compose.prod.yml logs web
docker-compose -f docker-compose.prod.yml logs postgres

# Resource kullanımı
docker stats
```

### Backup İşlemleri:

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U fotomandalin_user fotomandalin > backup_$(date +%Y%m%d).sql

# Uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

## 🐛 Troubleshooting

### Yaygın Sorunlar:

#### 1. Database Bağlantı Hatası:

```bash
# PostgreSQL durumunu kontrol et
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U fotomandalin_user -d fotomandalin

# Container'ı yeniden başlat
docker-compose -f docker-compose.prod.yml restart postgres
```

#### 2. Container Build Hatası:

```bash
# Cache'i temizle ve yeniden build et
docker-compose -f docker-compose.prod.yml down
docker system prune -a
docker-compose -f docker-compose.prod.yml up --build -d
```

#### 3. Port Çakışması:

```bash
# Kullanılan portları kontrol et
sudo netstat -tlnp | grep -E ':(80|443|3000|5432)'

# Çakışan process'i sonlandır
sudo pkill -f ":3000"
```

#### 4. Log Kontrolü:

```bash
# Detaylı loglar
docker-compose -f docker-compose.prod.yml logs --tail=100 web
docker-compose -f docker-compose.prod.yml logs --tail=100 postgres
```

## 🔐 Güvenlik

### Firewall Kurulumu:

```bash
# UFW firewall aktifleştir
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw status
```

## 📞 Destek

Deployment sorunları için:

1. Container loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Database bağlantısını test edin
4. GitHub Issues açın ve log çıktılarını paylaşın

---

**Son Güncelleme:** 25 Temmuz 2025

Bu rehberi takip ederek Fotomandalin projenizi EC2'de başarıyla deploy edebilirsiniz! 🎉
