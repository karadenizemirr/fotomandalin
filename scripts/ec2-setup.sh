#!/bin/bash

# EC2 Setup Script for Fotomandalin Deployment
# Bu script EC2 instance'ında çalıştırılacak

set -e

echo "🚀 Fotomandalin EC2 deployment kurulumu başlıyor..."

# Update system
echo "📦 Sistem güncellemesi..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Docker kurulumu..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
echo "🔧 Docker Compose kurulumu..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install other dependencies
echo "📋 Diğer bağımlılıklar kuruluyor..."
sudo apt install -y curl wget git htop nano nginx-full certbot python3-certbot-nginx

# Create application directory
echo "📁 Uygulama dizini oluşturuluyor..."
mkdir -p /home/$USER/fotomandalin
cd /home/$USER/fotomandalin

# Clone repository (ilk kurulum için)
if [ ! -d ".git" ]; then
    echo "📂 Repository klonlanıyor..."
    echo "ℹ️  Private repository için SSH key gerekli!"
    echo "   GitHub'da SSH key setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    
    # SSH key varsa SSH ile clone
    if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ]; then
        echo "🔑 SSH key bulundu, SSH ile clone yapılıyor..."
        git clone git@github.com:karadenizemirr/fotomandalin.git .
    else
        echo "❌ SSH key bulunamadı!"
        echo "   Lütfen önce SSH key setup yapın:"
        echo "   1. ssh-keygen -t ed25519 -C 'your-email@domain.com'"
        echo "   2. cat ~/.ssh/id_ed25519.pub  # Bu key'i GitHub'a ekleyin"
        echo "   3. ssh -T git@github.com  # Bağlantıyı test edin"
        echo ""
        echo "   Alternatif olarak repository dosyalarını manuel olarak upload edebilirsiniz."
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Gerekli dizinler oluşturuluyor..."
mkdir -p nginx/ssl
mkdir -p backups
mkdir -p logs

# Set up SSL certificates (self-signed for development)
echo "🔐 SSL sertifikaları oluşturuluyor..."
if [ ! -f "nginx/ssl/cert.pem" ]; then
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Fotomandalin/CN=localhost"
    
    sudo chown $USER:$USER nginx/ssl/*
fi

# Create backup script
echo "💾 Backup scripti oluşturuluyor..."
cat > backup.sh << 'EOF'
#!/bin/bash
# Fotomandalin Backup Script

BACKUP_DIR="/home/$USER/fotomandalin/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
echo "Veritabanı yedekleniyor..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U fotomandalin_user fotomandalin > "$BACKUP_DIR/db_backup_$DATE.sql"

# Uploads backup
echo "Upload dosyaları yedekleniyor..."
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" -C public uploads

# Remove old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Yedekleme tamamlandı: $DATE"
EOF

chmod +x backup.sh

# Create monitoring script
echo "📊 Monitoring scripti oluşturuluyor..."
cat > monitor.sh << 'EOF'
#!/bin/bash
# Fotomandalin Monitoring Script

echo "=== Fotomandalin System Status ==="
echo "Date: $(date)"
echo

echo "=== Docker Containers ==="
docker-compose -f docker-compose.prod.yml ps

echo "=== Disk Usage ==="
df -h

echo "=== Memory Usage ==="
free -h

echo "=== CPU Usage ==="
top -bn1 | grep "Cpu(s)"

echo "=== Application Logs (last 10 lines) ==="
docker-compose -f docker-compose.prod.yml logs --tail=10 web

echo "=== Database Status ==="
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U fotomandalin_user -d fotomandalin
EOF

chmod +x monitor.sh

# Create log rotation
echo "📝 Log rotation kurulumu..."
sudo tee /etc/logrotate.d/fotomandalin << 'EOF'
/home/*/fotomandalin/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /home/$USER/fotomandalin/docker-compose.prod.yml restart web
    endscript
}
EOF

# Setup cron jobs
echo "⏰ Cron jobs kuruluyor..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/fotomandalin/backup.sh >> /home/$USER/fotomandalin/logs/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /home/$USER/fotomandalin/monitor.sh >> /home/$USER/fotomandalin/logs/monitor.log 2>&1") | crontab -

# Create environment template
echo "⚙️ Environment template oluşturuluyor..."
cat > .env.template << 'EOF'
# Database
DATABASE_URL="postgresql://fotomandalin_user:fotomandalin_secure_password@postgres:5432/fotomandalin"
POSTGRES_PASSWORD="fotomandalin_secure_password"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET_NAME="your-s3-bucket"

# Payment (Iyzico)
IYZICO_API_KEY="your-iyzico-api-key"
IYZICO_SECRET_KEY="your-iyzico-secret-key"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Application
NODE_ENV="production"
PORT="3000"
EOF

# Set up firewall
echo "🔥 Firewall kuruluyor..."
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Create deployment script
echo "🚀 Deployment scripti oluşturuluyor..."
cat > deploy.sh << 'EOF'
#!/bin/bash
# Manual deployment script

set -e

echo "🚀 Manuel deployment başlıyor..."

# Pull latest changes
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d

echo "✅ Deployment tamamlandı!"
EOF

chmod +x deploy.sh

echo "✅ EC2 kurulumu tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. .env.production dosyasını GitHub Secrets ile oluşturacak"
echo "2. SSL sertifikalarını Let's Encrypt ile güncelleyebilirsiniz:"
echo "   sudo certbot --nginx -d your-domain.com"
echo "3. Manuel deployment için: ./deploy.sh"
echo "4. Sistem durumunu kontrol için: ./monitor.sh"
echo "5. Yedek almak için: ./backup.sh"
echo ""
echo "🔧 GitHub Actions için gerekli secrets:"
echo "- EC2_HOST: EC2 public IP"
echo "- EC2_USER: ubuntu (veya ec2-user)"
echo "- EC2_SSH_KEY: Private SSH key"
echo "- Diğer environment variables"
