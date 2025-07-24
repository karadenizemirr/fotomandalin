# Fotomandalin EC2 Deployment Guide

Bu rehber, Fotomandalin projesi için GitHub Actions kullanarak EC2 üzerine otomatik deployment yapma sürecini açıklar.

## 🎯 Deployment Özeti

- **Platform:** AWS EC2
- **Container:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **Database:** PostgreSQL
- **CI/CD:** GitHub Actions
- **SSL:** Let's Encrypt (Certbot)

## 📋 Gereksinimler

### EC2 Instance

- **Minimum:** t3.medium (2 vCPU, 4GB RAM)
- **Önerilen:** t3.large (2 vCPU, 8GB RAM)
- **Storage:** 20GB+ SSD
- **OS:** Ubuntu 22.04 LTS
- **Security Group:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Domain ve DNS

- Domain adı (örn: fotomandalin.com)
- A record → EC2 Public IP

## 🚀 Kurulum Adımları

### 1. EC2 Instance Hazırlama

**Yöntem 1: SSH Key ile Otomatik Setup (Önerilen)**

```bash
# EC2'ya SSH bağlantısı
ssh -i your-key.pem ubuntu@your-ec2-ip

# GitHub SSH key setup (private repo için gerekli)
ssh-keygen -t ed25519 -C "your-email@domain.com"
cat ~/.ssh/id_ed25519.pub  # Bu key'i GitHub → Settings → SSH Keys'e ekleyin

# SSH bağlantısını test et
ssh -T git@github.com

# Setup scriptini manuel çalıştır (repository'den kopyala)
# ec2-setup.sh dosyasını EC2'ya kopyala ve çalıştır
```

**Yöntem 2: Manuel Setup**

```bash
# EC2'ya SSH bağlantısı
ssh -i your-key.pem ubuntu@your-ec2-ip

# Temel paketleri kur
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo apt install -y git nginx-full certbot python3-certbot-nginx

# Proje dizini oluştur
mkdir -p /home/$USER/fotomandalin
cd /home/$USER/fotomandalin

# Repository dosyalarını SCP ile kopyala (local'dan)
# scp -i your-key.pem -r . ubuntu@your-ec2-ip:/home/ubuntu/fotomandalin/

# Reboot (Docker için)
sudo reboot
```

### 2. GitHub Secrets Konfigürasyonu

GitHub repository → Settings → Secrets and variables → Actions

```bash
# EC2 Bağlantı Bilgileri
EC2_HOST=your-ec2-public-ip
EC2_USER=ubuntu
EC2_SSH_KEY=your-private-ssh-key-content

# Database
DATABASE_URL=postgresql://fotomandalin_user:secure_password@postgres:5432/fotomandalin

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-secure-secret-here

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-1
AWS_S3_BUCKET_NAME=your-s3-bucket

# Payment (Iyzico)
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. SSL Sertifikası (Let's Encrypt)

```bash
# EC2'da çalıştır
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

### 4. İlk Deployment

```bash
# Local'dan push yap
git push origin main

# GitHub Actions otomatik olarak:
# ✅ Tests çalıştırır
# ✅ Docker image build eder
# ✅ ECR'a push eder
# ✅ EC2'ya deploy eder
```

## 🔧 Deployment Süreci

### GitHub Actions Workflow

1. **Test Stage**

   - Dependencies install
   - Type checking
   - Linting

2. **Build Stage**

   - Docker image build
   - Multi-stage production build
   - GitHub Container Registry push

3. **Deploy Stage**
   - EC2'ya SSH bağlantısı
   - Environment variables setup
   - Docker container güncelleme
   - Health check
   - Database migration

### Deployment Triggers

- `main` branch push → Production deployment
- `production` branch push → Production deployment
- Manual trigger → Workflow dispatch

## 📊 Monitoring ve Maintenance

### Health Check

```bash
# EC2'da
./monitor.sh

# Web'den
curl https://your-domain.com/api/health
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f web

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
./logs/monitor.log
./logs/backup.log
```

### Backup

```bash
# Manuel backup
./backup.sh

# Otomatik backup (cron): Her gece 02:00
# - Database dump
# - Uploads tar.gz
# - 7 gün saklanır
```

## 🔄 Rollback Süreci

```bash
# EC2'da önceki image'a dön
docker images
docker tag OLD_IMAGE_ID ghcr.io/karadenizemirr/fotomandalin:latest
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Container Başlamıyor

```bash
docker-compose -f docker-compose.prod.yml logs web
docker-compose -f docker-compose.prod.yml restart web
```

### Database Bağlantı Hatası

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
docker-compose -f docker-compose.prod.yml restart postgres
```

### SSL Sertifika Problemi

```bash
sudo certbot renew
sudo nginx -t
sudo systemctl reload nginx
```

### Disk Dolmuş

```bash
# Docker cleanup
docker system prune -a
docker volume prune

# Log cleanup
sudo journalctl --vacuum-time=7d
```

## 📈 Performance Optimization

### Nginx Caching

- Static files: 1 year cache
- API responses: No cache
- Uploads: 30 days cache

### Docker Optimizations

- Multi-stage build
- Alpine Linux base
- .dockerignore file
- Health checks

### Database

- Connection pooling
- Index optimization
- Regular backups

## 🔐 Security

### Network Security

- UFW firewall
- Security groups
- Rate limiting (Nginx)

### Application Security

- Environment variables
- SSL/TLS encryption
- Security headers
- Input validation

### Monitoring

- Health checks
- Log monitoring
- Resource monitoring
- Backup verification

## 📞 Support

Deployment sorunları için:

1. GitHub Issues açın
2. Logs ve error messages ekleyin
3. Environment details belirtin

## 🔄 Updates

Bu deployment guide düzenli olarak güncellenir. Son güncelleme: 2025-01-24
