# 🚀 Fotomandalin EC2 Deployment Rehberi

## 📋 Gereksinimler

- **EC2 Instance:** t3.medium (2 vCPU, 4GB RAM) - Amazon Linux 2023
- **Storage:** 20GB+ SSD
- **Ports:** 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Node.js)
- **Domain:** fotomandalin.com (opsiyonel)

## 🔧 1. EC2 Hazırlık

```bash
# EC2'ya bağlan
ssh -i your-key.pem ec2-user@your-ec2-ip

# Sistem güncelle
sudo dnf update -y

# Docker kur
sudo dnf install -y docker git nginx
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Docker Compose kur
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Logout/login yap
sudo reboot
```

## 📁 2. Proje Kurulumu

```bash
# Tekrar bağlan
ssh -i your-key.pem ec2-user@your-ec2-ip

# SSH key oluştur (GitHub için)
ssh-keygen -t ed25519 -C "your-email@domain.com"
cat ~/.ssh/id_ed25519.pub
# Bu key'i GitHub SSH keys'e ekle

# Projeyi clone et
cd /home/ec2-user
git clone git@github.com:karadenizemirr/fotomandalin.git
cd fotomandalin
```

## ⚙️ 3. Environment Ayarları

```bash
# .env.production oluştur
cp .env .env.production
nano .env.production
```

**🔧 .env.production içeriği:**

```env
NODE_ENV=production

# Database
DATABASE_URL=postgresql://fotomandalin_user:super_secure_password@postgres:5432/fotomandalin
POSTGRES_PASSWORD=super_secure_password

# NextAuth
NEXTAUTH_URL=http://YOUR_EC2_IP:3000
NEXTAUTH_SECRET=your-super-secure-secret-minimum-32-characters-long

# AWS S3
AWS_S3_BUCKET_NAME=fotomandalin
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_URL=https://fotomandalin.s3.eu-north-1.amazonaws.com

# App URLs
NEXT_PUBLIC_APP_URL=http://YOUR_EC2_IP:3000
NEXT_PUBLIC_AWS_S3_BUCKET_URL=https://fotomandalin.s3.eu-north-1.amazonaws.com
```

## 🐳 4. Docker Deployment

```bash
# Container'ları başlat
docker compose -f docker-compose.prod.yml up --build -d

# Durum kontrol
docker compose -f docker-compose.prod.yml ps

# Logları izle
docker compose -f docker-compose.prod.yml logs -f web

# Test et
curl http://localhost:3000
```

## 🌐 5. Domain ve SSL (Opsiyonel)

### DNS Ayarları

Domain sağlayıcınızda:

- **A Record:** @ → EC2_PUBLIC_IP
- **A Record:** www → EC2_PUBLIC_IP

### SSL Kurulumu

```bash
# Certbot kur
sudo dnf install -y epel-release
sudo dnf install -y certbot

# Sistem nginx'i durdur
sudo systemctl stop nginx
sudo systemctl disable nginx

# Container nginx'i durdur
docker compose -f docker-compose.prod.yml stop nginx

# SSL sertifikası al
sudo certbot certonly --standalone \
    --email your-email@domain.com \
    --agree-tos \
    -d fotomandalin.com \
    -d www.fotomandalin.com

# Container'ları başlat
docker compose -f docker-compose.prod.yml up -d

# Test et
curl -I https://fotomandalin.com
```

### .env.production SSL Güncellemesi

```bash
nano .env.production

# Bu satırları güncelle:
# NEXTAUTH_URL=https://fotomandalin.com
# NEXT_PUBLIC_APP_URL=https://fotomandalin.com

# Container'ı yeniden başlat
docker compose -f docker-compose.prod.yml restart web
```

## 🔄 6. GitHub Actions Setup

**GitHub Repository → Settings → Secrets:**

| Secret Name             | Value                    |
| ----------------------- | ------------------------ |
| `EC2_HOST`              | your-ec2-public-ip       |
| `EC2_USER`              | ec2-user                 |
| `EC2_SSH_KEY`           | private-ssh-key-content  |
| `DATABASE_URL`          | postgresql://...         |
| `NEXTAUTH_URL`          | https://fotomandalin.com |
| `NEXTAUTH_SECRET`       | your-secret              |
| `AWS_ACCESS_KEY_ID`     | your-key                 |
| `AWS_SECRET_ACCESS_KEY` | your-secret              |

## 🔍 7. Monitoring Komutları

```bash
# Container durumu
docker compose -f docker-compose.prod.yml ps

# Logları görüntüle
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs nginx

# Database bağlantı testi
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U fotomandalin_user -d fotomandalin

# Database console
docker compose -f docker-compose.prod.yml exec postgres psql -U fotomandalin_user -d fotomandalin

# Resource kullanımı
docker stats

# Backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U fotomandalin_user fotomandalin > backup_$(date +%Y%m%d).sql
```

## ⚠️ 8. Sorun Çözme

### Database Bağlantı Hatası

**Hata:** `Authentication failed against database server, the provided database credentials for 'fotomandalin_user' are not valid`

Container'lar çalışıyor ama Prisma database'e bağlanamıyor.

```bash
# 1. Environment variables kontrol et
cat .env.production | grep -E "(DATABASE_URL|POSTGRES_PASSWORD)"

# 2. PostgreSQL loglarını kontrol et
docker compose -f docker-compose.prod.yml logs postgres | tail -20

# 3. Manuel database bağlantı testi
docker compose -f docker-compose.prod.yml exec postgres psql -U fotomandalin_user -d fotomandalin

# 4. Eğer bağlantı başarısızsa, postgres kullanıcısı ile dene
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d fotomandalin

# 5. Database kullanıcılarını listele
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "\du"

# Çözüm 1: Database kullanıcısını yeniden oluştur
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "DROP USER IF EXISTS fotomandalin_user;"
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "CREATE USER fotomandalin_user WITH PASSWORD 'super_secure_password';"
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fotomandalin TO fotomandalin_user;"
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "ALTER USER fotomandalin_user CREATEDB;"

# Çözüm 2: Web container'ını yeniden başlat
docker compose -f docker-compose.prod.yml restart web

# Çözüm 3: Prisma'yı yeniden generate et
docker compose -f docker-compose.prod.yml exec web npx prisma generate
docker compose -f docker-compose.prod.yml exec web npx prisma migrate deploy

# Test: Bağlantıyı doğrula
docker compose -f docker-compose.prod.yml exec postgres psql -U fotomandalin_user -d fotomandalin -c "SELECT version();"
```

### Build Hatası

```bash
# Cache temizle
docker compose -f docker-compose.prod.yml down
docker system prune -f
docker compose -f docker-compose.prod.yml up --build -d
```

### Port Çakışması

```bash
# Portları kontrol et
sudo ss -tlnp | grep -E ':(80|443|3000)'

# Sistem web serverlarını durdur
sudo systemctl stop nginx httpd || true
```

### SSL Yenileme

```bash
# Manuel yenileme
sudo certbot renew --dry-run

# Otomatik yenileme için crontab
sudo crontab -e
# Ekle: 0 2 * * * /usr/bin/certbot renew --quiet
```

## 🚀 9. Deployment Workflow

```bash
# Local'da değişiklik yap
git add .
git commit -m "Update"
git push origin main

# GitHub Actions otomatik olarak:
# ✅ Build yapar
# 🐳 Docker image oluşturur
# 🚀 EC2'ya deploy eder
```

## 🔐 10. Güvenlik

```bash
# Firewall ayarları
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## ✅ Hızlı Test

```bash
# HTTP test
curl -I http://your-domain.com

# HTTPS test (SSL varsa)
curl -I https://your-domain.com

# API health check
curl http://your-domain.com/api/health

# Container sağlık kontrolü
docker compose -f docker-compose.prod.yml ps
```

---

**✨ Özet:** Bu rehber ile Fotomandalin projesini EC2'ya Docker ile deploy edebilir, domain bağlayabilir ve SSL sertifikası kurabilirsiniz. GitHub Actions ile otomatik deployment de aktif olur.

**🆘 Sorun olursa:** Container loglarını kontrol edin ve GitHub Issues'da paylaşın.
