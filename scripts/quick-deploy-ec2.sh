#!/bin/bash

# 🚀 Fotomandalin EC2 Quick Deploy
# Bu script'i EC2'de çalıştırarak hızlıca deployment yapabilirsiniz

set -e

echo "🚀 Fotomandalin EC2 Quick Deploy başlıyor..."

# Renklendirme
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Sistem kontrolleri
print_step "Sistem kontrolleri yapılıyor..."

if ! command -v docker &> /dev/null; then
    print_error "Docker kurulu değil! Lütfen önce setup-ec2-docker.sh script'ini çalıştırın."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose kurulu değil!"
    exit 1
fi

print_success "Docker ve Docker Compose hazır"

# Repository kontrolü ve güncelleme
print_step "Repository kontrol ediliyor..."

if [ ! -d "~/fotomandalin" ]; then
    print_step "Repository clone ediliyor..."
    git clone https://github.com/karadenizemirr/fotomandalin.git ~/fotomandalin
    print_success "Repository clone edildi"
else
    print_step "Repository güncelleniyor..."
    cd ~/fotomandalin
    git fetch origin
    git reset --hard origin/main
    print_success "Repository güncellendi"
fi

cd ~/fotomandalin

# Environment dosyası kontrolü
print_step "Environment dosyası kontrol ediliyor..."

if [ ! -f ".env.production" ]; then
    print_warning "Environment dosyası bulunamadı, şablon oluşturuluyor..."
    
    # EC2 IP'sini otomatik tespit et
    EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo "YOUR_EC2_IP")
    
    cat > .env.production << EOF
# Database
DATABASE_URL=postgresql://fotomandalin_user:FotoMandalin2024!@db:5432/fotomandalin
DIRECT_URL=postgresql://fotomandalin_user:FotoMandalin2024!@db:5432/fotomandalin
DB_PASSWORD=FotoMandalin2024!

# Application
NODE_ENV=production
NEXTAUTH_URL=http://${EC2_IP}
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Payment (Test Environment)
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-1
AWS_S3_BUCKET_NAME=fotomandalin-uploads

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
    
    print_warning "Environment dosyası oluşturuldu. Lütfen .env.production dosyasını gerçek değerlerle güncelleyin!"
    print_warning "Düzenlemek için: nano .env.production"
else
    print_success "Environment dosyası mevcut"
fi

# Port kontrolü
print_step "Port kontrolleri yapılıyor..."
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 80 kullanımda, nginx durdurulabilir"
    sudo systemctl stop nginx || true
fi

# Docker deployment
print_step "Mevcut container'lar durduruluyor..."
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true

print_step "Docker network ve volume temizliği..."
docker network prune -f 2>/dev/null || true

print_step "Docker images build ediliyor..."
docker-compose -f docker-compose.simple.yml build --no-cache

print_step "Servisler başlatılıyor..."
docker-compose -f docker-compose.simple.yml up -d

print_step "Servisler başlatılıyor... (30 saniye bekleniyor)"
sleep 30

# Health check
print_step "Servis durumları kontrol ediliyor..."
if docker-compose -f docker-compose.simple.yml ps | grep -q "Up"; then
    print_success "Container'lar çalışıyor"
else
    print_error "Container'lar başlatılamadı"
    docker-compose -f docker-compose.simple.yml logs --tail=10
    exit 1
fi

# Database migration
print_step "Database migrations çalıştırılıyor..."
sleep 10
if docker-compose -f docker-compose.simple.yml exec -T app npx prisma migrate deploy 2>/dev/null; then
    print_success "Database migrations başarılı"
elif docker-compose -f docker-compose.simple.yml exec -T app npx prisma db push 2>/dev/null; then
    print_success "Database push başarılı"
else
    print_warning "Database migration başarısız - manuel kontrol gerekebilir"
fi

# Application health check
print_step "Application health check..."
sleep 5

if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    print_success "Application başarıyla çalışıyor!"
else
    print_warning "Health check başarısız, ancak deployment tamamlandı"
fi

# Final durum
print_step "Final durum raporu:"
echo ""
echo "📊 Container Durumları:"
docker-compose -f docker-compose.simple.yml ps

echo ""
echo "💻 Sistem Kaynakları:"
echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2}')"

echo ""
echo "🌐 Access URLs:"
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")
echo "Application: http://${EC2_IP}"
echo "Health Check: http://${EC2_IP}/api/health"

echo ""
echo "🛠️  Kullanışlı Komutlar:"
echo "📊 Logs: docker-compose -f docker-compose.simple.yml logs -f app"
echo "🔄 Restart: docker-compose -f docker-compose.simple.yml restart"
echo "🛑 Stop: docker-compose -f docker-compose.simple.yml down"
echo "📝 Edit ENV: nano .env.production"

echo ""
print_success "🎉 Deployment tamamlandı!"
print_warning "📝 Unutmayın: .env.production dosyasını production değerleriyle güncelleyin"
