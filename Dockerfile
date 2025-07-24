# --- Development ve Production için çok aşamalı Dockerfile ---
# 1. Geliştirme ortamı (development)
FROM node:20-alpine AS development
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps || yarn install || pnpm install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 2. Production build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install --legacy-peer-deps || yarn install || pnpm install
COPY . .
RUN npm run build

# 3. Production run (sadece gerekli dosyalar)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js* ./
COPY --from=build /app/next.config.ts* ./
EXPOSE 3000
CMD ["npm", "run", "start"]

