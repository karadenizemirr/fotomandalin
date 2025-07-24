#!/bin/bash

# 🚀 EC2 Docker Setup Script
# Bu script EC2 instance'ınızda Docker environment'ını hazırlar

echo "🔧 EC2 Docker Setup başlıyor..."

# Sistem güncellemesi
echo "📦 Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
echo "🐳 Docker kuruluyor..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Current user'ı docker grubuna ekle
sudo usermod -aG docker $USER

# Docker Compose kurulumu
echo "🐳 Docker Compose kuruluyor..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git kurulumu (GitHub Actions için gerekli)
echo "📂 Git kuruluyor..."
sudo apt install git -y

# UFW Firewall ayarları
echo "🔒 Firewall ayarlanıyor..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Nginx kurulumu (reverse proxy için)
echo "🌐 Nginx kuruluyor..."
sudo apt install nginx -y
sudo systemctl enable nginx

# Gerekli dizinleri oluştur
echo "📁 Dizinler oluşturuluyor..."
mkdir -p ~/fotomandalin
mkdir -p ~/backups

# Docker servisini başlat
echo "🚀 Docker servisleri başlatılıyor..."
sudo systemctl enable docker
sudo systemctl start docker

echo "✅ EC2 Docker setup tamamlandı!"
echo "⚠️  Önemli: Sistemi yeniden başlatın veya logout/login yapın!"
echo "📝 Sonraki adım: docker --version && docker-compose --version komutlarıyla test edin"

# Sistem bilgilerini göster
echo "📊 Sistem Bilgileri:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Docker: $(docker --version 2>/dev/null || echo 'Logout/login gerekli')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Logout/login gerekli')"
echo "Free Memory: $(free -h | awk '/^Mem:/ {print $7}')"
echo "Disk Space: $(df -h / | awk 'NR==2 {print $4}')"
