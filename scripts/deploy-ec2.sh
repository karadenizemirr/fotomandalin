#!/bin/bash

# EC2 Deployment Script
# Bu script GitHub Actions tarafından EC2'de çalıştırılır

set -e

echo "🚀 Starting deployment on EC2..."

# Renkli output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Environment variables check
required_vars=("DB_PASSWORD" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set"
        exit 1
    fi
done

log_info "Environment variables validated"

# Create application directory
cd ~/fotomandalin || {
    log_error "Failed to change to fotomandalin directory"
    exit 1
}

# Pull latest code (if using git approach)
if [ -d ".git" ]; then
    log_info "Updating code from git..."
    git pull origin main
else
    log_info "Git repository not found, assuming Docker deployment"
fi

# Create environment file
log_info "Creating environment configuration..."
cat > .env.production << EOF
# Database
DATABASE_URL=postgresql://fotomandalin_user:${DB_PASSWORD}@db:5432/fotomandalin
DIRECT_URL=postgresql://fotomandalin_user:${DB_PASSWORD}@db:5432/fotomandalin
DB_PASSWORD=${DB_PASSWORD}

# Application
NODE_ENV=production
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Payment
IYZICO_API_KEY=${IYZICO_API_KEY}
IYZICO_SECRET_KEY=${IYZICO_SECRET_KEY}
IYZICO_BASE_URL=${IYZICO_BASE_URL}

# AWS S3
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=${AWS_REGION}
AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}

# Email
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# SSL
SSL_EMAIL=${SSL_EMAIL}
DOMAIN=${DOMAIN}
EOF

log_info "Environment file created"

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down || true

# Pull latest images
log_info "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml --env-file .env.production pull

# Start services
log_info "Starting services..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to be ready
log_info "Waiting for services to start..."
sleep 30

# Run database migrations
log_info "Running database migrations..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npx prisma migrate deploy || {
    log_warning "Migration failed, trying to push schema..."
    docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T app npx prisma db push || {
        log_error "Database setup failed"
        exit 1
    }
}

# Health check
log_info "Performing health check..."
for i in {1..5}; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log_info "✅ Application is healthy!"
        break
    else
        log_warning "Health check failed, attempt $i/5"
        if [ $i -eq 5 ]; then
            log_error "❌ Application failed to start"
            docker-compose -f docker-compose.prod.yml --env-file .env.production logs app
            exit 1
        fi
        sleep 10
    fi
done

# Cleanup old images
log_info "Cleaning up old Docker images..."
docker image prune -f || true

log_info "🎉 Deployment completed successfully!"
log_info "Application is running at: ${NEXTAUTH_URL}"

# Show running containers
log_info "Running containers:"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps
