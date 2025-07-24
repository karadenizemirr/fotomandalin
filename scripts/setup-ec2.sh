#!/bin/bash

# EC2 Instance Setup Script for Fotomandalin
# Run this script on your fresh EC2 Ubuntu instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

print_status "🚀 Starting EC2 setup for Fotomandalin..."

# Update system
print_status "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    vim \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx

# Install Docker
print_status "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
print_status "🏗️ Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure UFW Firewall
print_status "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure fail2ban
print_status "🛡️ Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create application directory
print_status "📁 Creating application directory..."
mkdir -p ~/fotomandalin
cd ~/fotomandalin

# Create necessary directories
mkdir -p nginx/sites-available
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p backups

# Set proper permissions
chmod 755 ~/fotomandalin

# Create a simple nginx config for initial setup (before SSL)
print_status "🌐 Creating initial nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    keepalive_timeout 65;
    
    # Redirect HTTP to HTTPS (will be updated after SSL setup)
    server {
        listen 80;
        server_name _;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Temporary: proxy to app during setup
        location / {
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Create backup script
print_status "💾 Creating backup script..."
cat > ~/fotomandalin/backup.sh << 'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="/home/$(whoami)/fotomandalin/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fotomandalin_backup_$DATE.sql"

echo "Creating database backup..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U fotomandalin_user fotomandalin > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "fotomandalin_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
EOF

chmod +x ~/fotomandalin/backup.sh

# Setup crontab for automatic backups
print_status "⏰ Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$(whoami)/fotomandalin/backup.sh") | crontab -

# Create log rotation config
print_status "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/fotomandalin << EOF
/home/$(whoami)/fotomandalin/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF

# Enable Docker service
print_status "⚙️ Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

print_status "✅ EC2 setup completed successfully!"
print_warning "⚠️  Important next steps:"
echo ""
echo "1. Log out and log back in for Docker permissions to take effect"
echo "2. Configure your GitHub secrets with the following information:"
echo "   - EC2_HOST: Your EC2 public IP or domain"
echo "   - EC2_USER: ubuntu (or your EC2 username)"
echo "   - EC2_SSH_PRIVATE_KEY: Your EC2 private key"
echo "   - All environment variables (database passwords, API keys, etc.)"
echo ""
echo "3. Update the domain in nginx configuration files"
echo "4. Run your first deployment from GitHub Actions"
echo ""
print_status "🎉 Your EC2 instance is ready for deployment!"
