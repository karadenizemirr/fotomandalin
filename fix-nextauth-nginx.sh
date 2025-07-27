#!/bin/bash

echo "🔧 NextAuth Nginx Hatası Düzeltme Script"
echo "========================================"

# 1. Mevcut durumu kontrol et
echo "1. Container durumları:"
docker ps --filter 'name=fotomandalin' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
echo ""

# 2. Nginx konfigürasyonunu test et
echo "2. Nginx konfigürasyon testi:"
docker exec fotomandalin-nginx-1 nginx -t
echo ""

# 3. Git'ten güncel konfigürasyonu çek
echo "3. Git'ten güncel değişiklikleri çekiliyor..."
git pull origin main
echo ""

# 4. Docker Compose'u yeniden başlat
echo "4. Docker Compose yeniden başlatılıyor..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
echo ""

# 5. Container'ların ayaklanmasını bekle
echo "5. Container'ların ayaklanması bekleniyor..."
sleep 30

# 6. NextAuth API test et
echo "6. NextAuth API testleri:"
echo "- CSRF Token test:"
curl -s https://fotomandalin.com/api/auth/csrf | head -c 200
echo ""

echo "- Providers test:"
curl -s https://fotomandalin.com/api/auth/providers | head -c 200
echo ""

# 7. Nginx loglarını kontrol et
echo "7. Nginx error logları (son 10 satır):"
docker logs fotomandalin-nginx-1 --tail=10
echo ""

# 8. Web container loglarını kontrol et
echo "8. Web container logları (son 10 satır):"
docker logs fotomandalin-web-1 --tail=10
echo ""

echo "✅ Düzeltme işlemi tamamlandı!"
echo "Eğer hala sorun varsa, logları kontrol edin."
