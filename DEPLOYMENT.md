# 🚀 Fotomandalin EC2 Deployment Guide (Amazon Linux)

Bu rehber, Fotomandalin projesi için GitHub Actions kullanarak Amazon Linux EC2 üzerine otomatik deployment yapma sürecini adım adım açıklar.

## 🎯 Deployment Özeti

- **Platform:** AWS EC2 (Amazon Linux 2023)
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
- **OS:** Amazon Linux 2023
- **Security Group:** 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (Node.js)

### Domain ve DNS (İsteğe Bağ## 📞 Destek ve Maintenance

### Container Durumu Kontrolü:

```bash
# Container'ları kontrol et
docker compose -f docker-compose.prod.yml ps

# Logları görüntüle
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs postgres

# Resource kullanımı
docker stats
```

### SSL Sertifikası Yenileme:

```bash
# Manuel yenileme test
sudo certbot renew --dry-run

# Otomatik yenileme kontrolü (crontab aktif mi?)
sudo crontab -l

# SSL sertifika durumu
sudo certbot certificates
```

### Backup İşlemleri:

```bash
# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U fotomandalin_user fotomandalin > backup_$(date +%Y%m%d).sql

# Uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/

# SSL sertifikası backup
sudo tar -czf ssl_backup_$(date +%Y%m%d).tar.gz /etc/letsencrypt/
```

### Deployment Sorunları İçin:

1. Container loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Database bağlantısını test edin
4. SSL sertifikası geçerliliğini kontrol edin
5. GitHub Issues açın ve log çıktılarını paylaşınomain adı (örn: fotomandalin.com)

- A record → EC2 Public IP

## 🚀 Adım Adım Kurulum

### 1️⃣ EC2 Instance Hazırlama

#### AWS Console'da EC2 Kurulumu:

```bash
# EC2 Instance Launch:
# - AMI: Amazon Linux 2023 (al2023-ami-xxx)
# - Instance Type: t3.medium (minimum)
# - Key Pair: Yeni oluştur veya mevcut kullan
# - Security Group: SSH (22), HTTP (80), HTTPS (443), Custom (3000)
```

#### EC2'ya Bağlantı:

```bash
# Local terminalden EC2'ya bağlan
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Sistem güncellemesi
sudo dnf update -y
```

### 2️⃣ Docker Kurulumu

```bash
# Docker kurulumu (Amazon Linux 2023 için)
sudo dnf install -y docker

# Docker servisini başlat ve otomatik başlatmayı aktifleştir
sudo systemctl start docker
sudo systemctl enable docker

# ec2-user'ı docker grubuna ekle
sudo usermod -aG docker ec2-user

# Docker Compose V2 kurulumu (plugin olarak)
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Gerekli diğer paketler
sudo dnf install -y git nginx curl

# Certbot için EPEL repo ve Certbot kurulumu
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

# Docker grubuna dahil olmak için logout/login
sudo reboot
```

### 3️⃣ GitHub SSH Key Setup (Private Repo İçin)

```bash
# EC2'ya tekrar bağlan
ssh -i your-key.pem ec2-user@your-ec2-public-ip

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
cd /home/ec2-user

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
# Docker Compose V2 komutu ile container'ları build et ve başlat
docker compose -f docker-compose.prod.yml up --build -d

# Container durumlarını kontrol et
docker compose -f docker-compose.prod.yml ps

# Logları takip et
docker compose -f docker-compose.prod.yml logs -f
```

#### ⚠️ Build Hatası Çözümü:

**Hata:** `PrismaClientConstructorValidationError: Invalid value undefined for datasource "db"`

Bu hata, build sırasında DATABASE_URL'nin tanımlı olmamasından kaynaklanır.

```bash
# 1. .env.production dosyasının var olduğunu kontrol edin
ls -la .env.production

# 2. DATABASE_URL'nin doğru tanımlandığını kontrol edin
grep DATABASE_URL .env.production

# 3. Docker build context'ine .env.production dosyasını dahil etmek için
# docker-compose.prod.yml dosyasında build args ekleyin

# 4. Build işlemini tekrar deneyin
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up --build -d

# 5. Eğer sorun devam ederse, build-time environment variable'ları set edin:
DATABASE_URL=postgresql://fotomandalin_user:fotomandalin_secure_password@postgres:5432/fotomandalin docker compose -f docker-compose.prod.yml up --build -d
```

**Alternatif Çözüm - Docker Build Args:**

```bash
# docker-compose.prod.yml dosyasını düzenleyin:
# web:
#   build:
#     context: .
#     target: production
#     args:
#       DATABASE_URL: ${DATABASE_URL}
```

### 🛠️ Sorun Çözüldü! Şimdi Tekrar Deneyin:

```bash
# EC2'de projeyi güncellemek için:

# 1. Proje dizinine gidin
cd /home/ec2-user/fotomandalin

# 2. GitHub'dan son değişiklikleri çekin
git pull origin main

# 3. Eğer değişiklik varsa, mevcut container'ları durdurun
docker compose -f docker-compose.prod.yml down

# 4. Cache'i temizleyin
docker system prune -f

# 5. .env.production dosyasında gerekli değişkenlerin olduğunu kontrol edin
cat .env.production

# 6. Docker build'i tekrar çalıştırın
docker compose -f docker-compose.prod.yml up --build -d

# 7. Build durumunu takip edin
docker compose -f docker-compose.prod.yml logs -f web

# 8. Container'ların çalışıp çalışmadığını kontrol edin
docker compose -f docker-compose.prod.yml ps
```

**Önemli:** Git pull yapmadan önce local değişiklikleriniz varsa:

```bash
# Local değişiklikleri kontrol edin
git status

# Gerekirse local değişiklikleri stash'leyin
git stash

# GitHub'dan değişiklikleri çekin
git pull origin main

# Eğer gerekirse stash'lenmiş değişiklikleri geri getirin
git stash pop
```

### 7️⃣ Test ve Doğrulama

```bash
# Container'ların sağlık durumunu kontrol et
docker compose -f docker-compose.prod.yml ps

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
EC2_USER=ec2-user
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

### 9️⃣ Domain ve SSL Sertifikası Kurulumu

#### Domain DNS Ayarları:

```bash
# Domain sağlayıcınızda (GoDaddy, Namecheap, vs.) aşağıdaki DNS kayıtlarını ekleyin:
#
# Type: A Record
# Name: @ (veya boş)
# Value: YOUR_EC2_PUBLIC_IP
# TTL: 300 (veya en düşük değer)
#
# Type: A Record
# Name: www
# Value: YOUR_EC2_PUBLIC_IP
# TTL: 300 (veya en düşük değer)
```

#### SSL Sertifikası Kurulumu (Let's Encrypt):

```bash
# EC2'ya bağlanın
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# Certbot kurulumunu kontrol edin (zaten kurulu olmalı)
sudo dnf list installed | grep certbot

# DNS propagation kontrol edin
nslookup fotomandalin.com
ping fotomandalin.com

# Nginx'i durdurun (SSL kurulumu için)
docker compose -f docker-compose.prod.yml stop nginx

# Sistem nginx servisini durdurun (port çakışması önleme)
sudo systemctl stop nginx
sudo systemctl disable nginx

# Port 80'in boş olduğunu kontrol edin
sudo ss -tlnp | grep :80

# Let's Encrypt sertifikası alın (domain'inizi değiştirin)
sudo certbot certonly --standalone \
    --preferred-challenges http \
    --email your-email@domain.com \
    --agree-tos \
    --no-eff-email \
    -d fotomandalin.com \
    -d www.fotomandalin.com

# Sertifika dosyalarını kontrol edin
sudo ls -la /etc/letsencrypt/live/fotomandalin.com/

# Container'ları güncellenmiş nginx konfigürasyonuyla başlatın
docker compose -f docker-compose.prod.yml up -d

# Nginx loglarını kontrol edin
docker compose -f docker-compose.prod.yml logs nginx

# SSL test edin
curl -I https://fotomandalin.com
```

#### SSL Auto-Renewal Kurulumu:

```bash
# Crontab'ı düzenleyin
sudo crontab -e

# Aşağıdaki satırı ekleyin (her gün 2:00'da renewal kontrol)
0 2 * * * /usr/bin/certbot renew --quiet && docker compose -f /home/ec2-user/fotomandalin/docker-compose.prod.yml restart nginx

# Renewal test edin
sudo certbot renew --dry-run
```

#### ✅ HTTPS Test ve Doğrulama:

```bash
# Container'ları başlatın
docker compose -f docker-compose.prod.yml up -d

# SSL sertifikasının container'da mount edildiğini kontrol edin
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/fotomandalin.com/

# Nginx config test
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# HTTPS erişim test
curl -I https://fotomandalin.com
curl -I https://www.fotomandalin.com

# HTTP'den HTTPS'e yönlendirme test
curl -I http://fotomandalin.com

# Nginx logları kontrol
docker compose -f docker-compose.prod.yml logs nginx
```

#### .env.production Domain Güncellemesi:

```bash
# .env.production dosyasını düzenleyin
nano .env.production

# Aşağıdaki değerleri güncelleyin:
# NEXTAUTH_URL=https://fotomandalin.com
# NEXT_PUBLIC_APP_URL=https://fotomandalin.com
```

### 🔟 Domain ve SSL Kurulum Özeti

SSL kurulumu tamamlandıktan sonra EC2'da çalıştırmanız gerekenler:

```bash
# 1. Container'ları başlatın
docker compose -f docker-compose.prod.yml up -d

# 2. .env.production dosyasını HTTPS URL'leri ile güncelleyin
nano .env.production
# NEXTAUTH_URL=https://fotomandalin.com
# NEXT_PUBLIC_APP_URL=https://fotomandalin.com

# 3. Container'ları yeniden başlatın
docker compose -f docker-compose.prod.yml restart web

# 4. HTTPS erişimini test edin
curl -I https://fotomandalin.com
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
docker compose -f docker-compose.prod.yml ps

# Logları görüntüle
docker compose -f docker-compose.prod.yml logs web
docker compose -f docker-compose.prod.yml logs postgres

# Resource kullanımı
docker stats
```

### Backup İşlemleri:

```bash
# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U fotomandalin_user fotomandalin > backup_$(date +%Y%m%d).sql

# Uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/
```

## 🐛 Troubleshooting

### Yaygın Sorunlar:

#### 1. Database Bağlantı Hatası:

```bash
# PostgreSQL durumunu kontrol et
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U fotomandalin_user -d fotomandalin

# Container'ı yeniden başlat
docker compose -f docker-compose.prod.yml restart postgres
```

#### 2. Container Build Hatası:

```bash
# Cache'i temizle ve yeniden build et
docker compose -f docker-compose.prod.yml down
docker system prune -a
docker compose -f docker-compose.prod.yml up --build -d
```

#### 3. Port Çakışması:

```bash
# Kullanılan portları kontrol et (Amazon Linux'ta netstat)
sudo ss -tlnp | grep -E ':(80|443|3000|5432)'

# Çakışan process'i sonlandır
sudo pkill -f ":3000"
```

#### 4. Log Kontrolü:

```bash
# Detaylı loglar
docker compose -f docker-compose.prod.yml logs --tail=100 web
docker compose -f docker-compose.prod.yml logs --tail=100 postgres
```

#### 5. Domain ve SSL Sorunları:

```bash
# DNS propagation kontrol
nslookup fotomandalin.com
dig fotomandalin.com

# Nginx konfigürasyonu test
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# SSL sertifika durumu kontrol
sudo certbot certificates

# SSL sertifika yenileme
sudo certbot renew --force-renewal

# Domain erişim test
curl -I http://fotomandalin.com
curl -I https://fotomandalin.com

# Nginx error logları
docker compose -f docker-compose.prod.yml logs nginx | grep error
```

#### 6. Firewall ve Port Sorunları:

```bash
# Firewall durumunu kontrol et
sudo firewall-cmd --list-all

# Port erişilebilirlik test (local'dan)
telnet your-ec2-ip 80
telnet your-ec2-ip 443

# Nginx container port mapping kontrol
docker compose -f docker-compose.prod.yml ps nginx
```

#### 7. Port 80/443 Çakışması Hatası:

**Hata:** `Could not bind TCP port 80 because it is already in use`

```bash
# Port 80 ve 443'ü kullanan processleri kontrol et
sudo ss -tlnp | grep -E ':(80|443)'
sudo netstat -tlnp | grep -E ':(80|443)'

# Sistem nginx servisini durdur (eğer çalışıyorsa)
sudo systemctl stop nginx
sudo systemctl disable nginx

# Apache servisini durdur (eğer varsa)
sudo systemctl stop httpd
sudo systemctl disable httpd

# Docker container'lar dışındaki web serverları durdur
sudo pkill -f nginx
sudo pkill -f httpd

# Port'ların boş olduğunu kontrol et
sudo ss -tlnp | grep -E ':(80|443)'

# Container'ları yeniden başlat
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Container durumunu kontrol et
docker compose -f docker-compose.prod.yml ps
```

## 🔐 Güvenlik

### Firewall Kurulumu (Amazon Linux 2023):

```bash
# Firewalld aktifleştir (Amazon Linux varsayılan)
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Gerekli portları aç
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload

# Firewall durumunu kontrol et
sudo firewall-cmd --list-all
```

### SELinux Ayarları (İsteğe Bağlı):

```bash
# SELinux durumunu kontrol et
getenforce

# Gerekirse Docker için SELinux ayarları
sudo setsebool -P container_manage_cgroup on
```

## 📦 Amazon Linux 2023 Özel Notlar

### Paket Yöneticisi:

- Amazon Linux 2023, `dnf` paket yöneticisini kullanır
- `yum` yerine `dnf` komutlarını kullanın

### Docker Compose:

- V2 versiyonu plugin olarak kurulur
- `docker-compose` yerine `docker compose` (tire olmadan) kullanın

### Sistem Servisleri:

- `systemctl` ile Docker servisini yönetebilirsiniz
- Otomatik başlatma için `enable` komutunu kullanın

### Kullanıcı:

- Varsayılan kullanıcı `ec2-user`'dır
- Home dizini `/home/ec2-user/`

## � Hızlı Domain ve SSL Kurulum Özeti

### EC2'de Çalıştırmanız Gerekenler:

```bash
# 1. Projeyi güncelleyin
cd /home/ec2-user/fotomandalin
git pull origin main

# 2. Domain'inizi nginx.conf dosyasında güncelleyin
sudo nano nginx/nginx.conf
# fotomandalin.com kısmını kendi domain'inizle değiştirin

# 3. .env.production dosyasını güncelleyin
nano .env.production
# NEXTAUTH_URL ve NEXT_PUBLIC_APP_URL'i domain'inizle güncelleyin

# 4. Container'ları durdurun
docker compose -f docker-compose.prod.yml down

# 4.5. Sistem nginx/apache servislerini durdurun (port çakışması önleme)
sudo systemctl stop nginx || true
sudo systemctl stop httpd || true
sudo systemctl disable nginx || true
sudo systemctl disable httpd || true

# 5. DNS propagation kontrol edin
nslookup your-domain.com

# 6. SSL sertifikası alın
sudo certbot certonly --standalone \
    --email your-email@domain.com \
    --agree-tos \
    -d your-domain.com \
    -d www.your-domain.com

# 7. Container'ları başlatın
docker compose -f docker-compose.prod.yml up -d

# 8. Test edin
curl -I https://your-domain.com
```

### ✅ Başarılı SSL Kurulumu Sonrası:

Artık siteniz şu şekilde erişilebilir:

- 🌐 `https://fotomandalin.com` (Ana domain)
- 🌐 `https://www.fotomandalin.com` (WWW subdomain)
- 🔒 SSL sertifikası aktif (Let's Encrypt - 89 gün geçerli)
- 🔄 HTTP'den HTTPS'e otomatik yönlendirme
- ⚡ Nginx reverse proxy ile performans optimizasyonu

### 📋 Final Kontrol Listesi:

```bash
# EC2'da final kontroller
docker compose -f docker-compose.prod.yml ps
curl -I https://fotomandalin.com
curl -I http://fotomandalin.com  # 301 redirect beklenir
sudo certbot certificates  # SSL durumu

# Browser'da test edin:
# https://fotomandalin.com
# https://www.fotomandalin.com
```

### 🔧 .env.production Final Güncellemesi:

```bash
# EC2'da .env.production dosyasını HTTPS URL'leri ile güncelleyin
nano .env.production

# Bu değerleri güncelleyin:
NEXTAUTH_URL=https://fotomandalin.com
NEXT_PUBLIC_APP_URL=https://fotomandalin.com

# Container'ları yeniden başlatın
docker compose -f docker-compose.prod.yml restart web
```

## �📞 Destek

Deployment sorunları için:

1. Container loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Database bağlantısını test edin
4. GitHub Issues açın ve log çıktılarını paylaşın

---

**Son Güncelleme:** 26 Temmuz 2025 (Amazon Linux 2023 + SSL kurulumu tamamlandı)

🎉 **Fotomandalin Production Deployment Başarıyla Tamamlandı!**

✅ **Aktif URL'ler:**

- Ana Site: https://fotomandalin.com
- WWW: https://www.fotomandalin.com
- SSL: Let's Encrypt (89 gün geçerli, otomatik yenileme aktif)

### 📝 Amazon Linux 2023 vs Ubuntu Karşılaştırması:

| Özellik              | Amazon Linux 2023 | Ubuntu 22.04 |
| -------------------- | ----------------- | ------------ |
| Paket Yöneticisi     | `dnf`             | `apt`        |
| Varsayılan Kullanıcı | `ec2-user`        | `ubuntu`     |
| Docker Compose       | V2 (plugin)       | V1/V2        |
| Firewall             | `firewalld`       | `ufw`        |
| Port Kontrolü        | `ss`              | `netstat`    |
| SELinux              | Aktif             | Yok          |
