#!/bin/bash

# Environment Variables Validation Script
# Bu script deployment öncesi environment variables kontrolü yapar

set -e

echo "🔍 Fotomandalin Environment Variables Kontrolü"
echo "=============================================="

# Required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_REGION"
    "AWS_S3_BUCKET_NAME"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
)

# Optional but recommended variables
OPTIONAL_VARS=(
    "IYZICO_API_KEY"
    "IYZICO_SECRET_KEY"
    "POSTGRES_PASSWORD"
    "NODE_ENV"
)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

missing_vars=()
present_vars=()
optional_missing=()

echo ""
echo "📋 Gerekli Environment Variables:"
echo "---------------------------------"

# Check required variables
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo -e "${RED}❌ $var${NC} - EKSIK"
        missing_vars+=("$var")
    else
        echo -e "${GREEN}✅ $var${NC} - OK"
        present_vars+=("$var")
        
        # Show partial value for verification (hide sensitive parts)
        case $var in
            *SECRET*|*PASSWORD*|*KEY*)
                echo "   Değer: ${!var:0:8}***"
                ;;
            *URL*|*HOST*)
                echo "   Değer: ${!var}"
                ;;
            *)
                echo "   Değer: ${!var:0:20}..."
                ;;
        esac
    fi
done

echo ""
echo "📋 Opsiyonel Environment Variables:"
echo "-----------------------------------"

# Check optional variables
for var in "${OPTIONAL_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo -e "${YELLOW}⚠️  $var${NC} - EKSIK (opsiyonel)"
        optional_missing+=("$var")
    else
        echo -e "${GREEN}✅ $var${NC} - OK"
        
        # Show partial value for verification
        case $var in
            *SECRET*|*PASSWORD*|*KEY*)
                echo "   Değer: ${!var:0:8}***"
                ;;
            *)
                echo "   Değer: ${!var}"
                ;;
        esac
    fi
done

echo ""
echo "📊 Özet:"
echo "--------"
echo -e "${GREEN}✅ Mevcut gerekli değişkenler: ${#present_vars[@]}/${#REQUIRED_VARS[@]}${NC}"
echo -e "${YELLOW}⚠️  Eksik opsiyonel değişkenler: ${#optional_missing[@]}/${#OPTIONAL_VARS[@]}${NC}"

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Tüm gerekli environment variables mevcut!${NC}"
    echo -e "${GREEN}Deployment için hazır.${NC}"
    
    if [ ${#optional_missing[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}ℹ️  Eksik opsiyonel değişkenler:${NC}"
        for var in "${optional_missing[@]}"; do
            case $var in
                "IYZICO_API_KEY"|"IYZICO_SECRET_KEY")
                    echo -e "${YELLOW}   - $var: Ödeme sistemi için gerekli${NC}"
                    ;;
                "POSTGRES_PASSWORD")
                    echo -e "${YELLOW}   - $var: Veritabanı güvenliği için önerilir${NC}"
                    ;;
                "NODE_ENV")
                    echo -e "${YELLOW}   - $var: production olarak ayarlanmalı${NC}"
                    ;;
            esac
        done
    fi
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Eksik gerekli environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    
    echo ""
    echo -e "${RED}Bu değişkenler GitHub Secrets'a eklenmelidir:${NC}"
    echo "GitHub Repository → Settings → Secrets and variables → Actions"
    
    exit 1
fi
