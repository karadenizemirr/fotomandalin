#!/bin/bash

# 🚀 Manual EC2 Deployment Script
# EC2'de projeyi manuel olarak deploy etmek için

set -e  # Hata durumunda dur

echo "🚀 Fotomandalin Manual Deployment başlıyor..."

# Repository dizinini kontrol et
if [ ! -d "~/fotomandalin" ]; then
    echo "📂 Repository cloning..."
    git clone https://github.com/karadenizemirr/fotomandalin.git ~/fotomandalin
else
    echo "📥 Repository updating..."
    cd ~/fotomandalin
    git pull origin main
fi

cd ~/fotomandalin

# Environment dosyasını oluştur
echo "🔧 Environment file oluşturuluyor..."
cat > .env.production << 'EOF'
# Database
DATABASE_URL=postgresql://fotomandalin_user:StrongPassword123!@db:5432/fotomandalin
DIRECT_URL=postgresql://fotomandalin_user:StrongPassword123!@db:5432/fotomandalin
DB_PASSWORD=StrongPassword123!

# Application
NODE_ENV=production
NEXTAUTH_URL=http://YOUR_EC2_IP
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-long

# Payment (Test Environment)
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-west-1
AWS_S3_BUCKET_NAME=your-bucket-name

# Email (Optional - for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

echo "⚠️  UYARI: .env.production dosyasını gerçek değerlerle güncelleyin!"
echo "📝 Düzenlemek için: nano .env.production"

# Mevcut container'ları durdur
echo "🛑 Mevcut container'lar durduruluyor..."
docker-compose -f docker-compose.simple.yml down || true

# Docker network ve volume temizliği
echo "🧹 Docker temizlik..."
docker network prune -f || true
docker volume prune -f || true

# Yeni image'ları build et
echo "🏗️  Docker images build ediliyor..."
docker-compose -f docker-compose.simple.yml build --no-cache

# Servisleri başlat
echo "🚀 Servisler başlatılıyor..."
docker-compose -f docker-compose.simple.yml up -d

# Servislerin başlamasını bekle
echo "⏳ Servisler başlatılıyor... (30 saniye)"
sleep 30

# Database migrations
echo "🗄️  Database migrations çalıştırılıyor..."
docker-compose -f docker-compose.simple.yml exec -T app npx prisma migrate deploy || \
docker-compose -f docker-compose.simple.yml exec -T app npx prisma db push || \
echo "⚠️  Database migration başarısız - manuel kontrol gerekli"

# Container durumlarını kontrol et
echo "📊 Container durumları:"
docker-compose -f docker-compose.simple.yml ps

# Uygulama health check
echo "🔍 Application health check..."
sleep 10

if curl -f http://localhost:3000/api/health 2>/dev/null; then
    echo "✅ Application başarıyla çalışıyor!"
else
    echo "❌ Application health check başarısız"
    echo "📋 Container logs:"
    docker-compose -f docker-compose.simple.yml logs --tail=20 app
fi

# Kullanışlı komutlar
echo ""
echo "🎯 Kullanışlı Komutlar:"
echo "📊 Logs: docker-compose -f docker-compose.simple.yml logs -f app"
echo "🔄 Restart: docker-compose -f docker-compose.simple.yml restart app"
echo "🛑 Stop: docker-compose -f docker-compose.simple.yml down"
echo "🗄️  Database: docker-compose -f docker-compose.simple.yml exec db psql -U fotomandalin_user -d fotomandalin"
echo "📱 Health: curl http://localhost:3000/api/health"

# Sistem kaynak kullanımı
echo ""
echo "💻 Sistem Kaynakları:"
docker stats --no-stream || true
