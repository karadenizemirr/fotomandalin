# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# DNS ayarları ve gerekli paketler
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf && \
    apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# npm için DNS ve registry ayarları (mirror kullanımı)
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 10 && \
    npm ci && \
    npm config set registry https://registry.npmjs.org/ && \
    npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Build arguments for environment variables
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Set environment variables for build
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory and set permissions
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads
RUN chown -R nextjs:nodejs /app

# Create health check endpoint
RUN echo '{"status":"ok","timestamp":"'$(date -Iseconds)'"}' > ./public/health.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]

# --- Development stage for local development ---
FROM node:18-alpine AS development
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Create directories and set permissions
RUN mkdir -p .next public/uploads && chown -R nextjs:nodejs .next public/uploads
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

