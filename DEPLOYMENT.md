# GitHub Secrets Configuration Guide

Bu dosya, GitHub Actions CI/CD pipeline'ının çalışması için gerekli olan GitHub Secrets'ların listesini içerir.

## GitHub Repository Settings > Secrets and Variables > Actions bölümünden aşağıdaki secrets'ları ekleyin:

### 🖥️ EC2 Connection

```
EC2_HOST=your-ec2-public-ip-or-domain
EC2_USER=ubuntu
EC2_SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[Your EC2 private key content]
-----END OPENSSH PRIVATE KEY-----
```

### 🗄️ Database

```
DB_PASSWORD=your-strong-database-password
```

### 🔐 Authentication

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret-32-chars-min
```

### 💳 Payment (iyzico)

```
IYZICO_API_KEY=your-iyzico-api-key
IYZICO_SECRET_KEY=your-iyzico-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com  # Production
# or
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com  # Sandbox/Test
```

### ☁️ AWS S3

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region (e.g., eu-west-1)
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

### 📧 Email (SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 🔒 SSL Certificate

```
SSL_EMAIL=your-email@domain.com
DOMAIN=your-domain.com
```

## 📋 Setup Checklist

### 1. EC2 Instance Setup

- [ ] Launch EC2 instance (Ubuntu 20.04 LTS recommended)
- [ ] Configure security group (ports 22, 80, 443)
- [ ] Create and download key pair
- [ ] Update EC2_HOST with public IP or domain
- [ ] Upload EC2 private key to GitHub Secrets

### 2. Domain Setup (Optional but recommended)

- [ ] Point your domain to EC2 public IP
- [ ] Update DOMAIN and NEXTAUTH_URL secrets
- [ ] Update nginx configuration with your domain

### 3. GitHub Secrets

- [ ] Add all secrets listed above to GitHub repository
- [ ] Verify secrets are correctly formatted (no extra spaces)

### 4. First Deployment

- [ ] Run EC2 setup script on your instance:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/karadenizemirr/fotomandalin/main/scripts/setup-ec2.sh | bash
  ```
- [ ] Commit and push to main branch to trigger deployment
- [ ] Monitor GitHub Actions for deployment status

### 5. Post-Deployment

- [ ] Verify application is running: `https://your-domain.com/api/health`
- [ ] Set up SSL certificate (automatic with Let's Encrypt)
- [ ] Test payment integration
- [ ] Set up monitoring and backups

## 🔍 Common Issues

### SSL Certificate Issues

If SSL setup fails, manually run:

```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot -w /var/www/certbot --email your-email@domain.com -d your-domain.com --agree-tos
```

### Database Connection Issues

Check if DATABASE_URL format is correct:

```
postgresql://fotomandalin_user:password@db:5432/fotomandalin
```

### Docker Registry Issues

Make sure GitHub token has package read/write permissions:

- Go to GitHub Settings > Developer settings > Personal access tokens
- Ensure token has `read:packages` and `write:packages` scopes

## 📞 Support

For deployment issues, check:

1. GitHub Actions logs
2. EC2 instance logs: `docker-compose logs -f`
3. Application logs: `docker-compose logs app`
