# Tech Stack

# 05_tech_stack.md

## Proje Teknoloji Yığını (Tech Stack)

Bu doküman, Fotomandalin Rezervasyon Sistemi projesinin geliştirilmesinde kullanılacak tüm programlama dillerini, frameworkleri, kütüphaneleri, araçları ve platformları detaylandırmaktadır. Belirtilen teknolojilere harfiyen uyulmalı ve bu listenin dışına çıkılmamalıdır. Her bir seçimin arkasındaki mantık da açıklanmıştır.

---

### 1. Temel Geliştirme Ortamı

- **Programlama Dili:** **TypeScript (v5.4+)**

  - **Neden:** JavaScript'in süper kümesi olan TypeScript, rezervasyon sistemlerinde kritik olan tip güvenliğini sağlar. Müşteri bilgileri, ödeme verileri ve rezervasyon durumları gibi karmaşık veri yapılarında hata yakalamayı kolaylaştırır.
  - **Yapılandırma:** `tsconfig.json` dosyasında `strict: true`, `strictNullChecks: true` ayarları aktif olmalıdır. Bu, ödeme ve rezervasyon verilerinde null/undefined hatalarını önler.

- **Paket Yöneticisi:** **pnpm (v9.x)**
  - **Neden:** `npm` ve `yarn`'a göre %70 daha hızlı kurulum, disk alanından tasarruf, monorepo desteği. Rezervasyon sisteminin hızlı geliştirme döngüsü için kritik.

### 2. Frontend Geliştirme

- **React Framework:** **Next.js (v15.x)**

  - **Neden:** App Router mimarisi ile modern React 18+ özelliklerini destekler. SSR/SSG ile SEO optimizasyonu, API Routes ile backend entegrasyonu, Image Optimization ile performans artışı sağlar. Rezervasyon sistemleri için ideal.
  - **Yapılandırma:** App Router (zorunlu), Server Components (API çağrıları için), Client Components (form etkileşimleri için), Edge Runtime (hızlı API responses için).

- **Styling (CSS Framework):** **Tailwind CSS (v3.4+)**

  - **Neden:** Utility-first yaklaşım, hızlı UI geliştirme, küçük bundle boyutu. Rezervasyon formları, takvim bileşenleri ve admin paneli için çok uygundur.
  - **Yapılandırma:** `tailwind.config.js` dosyası Fotomandalin'in marka renkleri, tipografi ve spacing sistemine göre özelleştirilecektir.
  - **Ek Özellikler:** Dark mode desteği, responsive breakpoints, custom animations.

- **Component Library:** **Radix UI (v1.x) + Shadcn/UI**
  - **Neden:** Headless UI primitives, tam erişilebilirlik (a11y) desteği, klavye navigasyonu. Rezervasyon formları ve admin paneli için kritik.
  - **Bileşenler:** Dialog, Calendar, Form, Select, Toast, Dropdown Menu, Tabs.

### 3. Durum Yönetimi ve Veri İşleme

- **Durum Yönetimi:** **Zustand (v4.x)**

  - **Neden:** Basit, performanslı ve TypeScript dostu. Rezervasyon süreci, sepet durumu, kullanıcı oturumu için ideal.
  - **Alternatif:** React Context API (küçük durumlar için), TanStack Query ile birlikte.

- **Veri Çekme:** **TanStack Query (v5.x)**

  - **Neden:** Güçlü cache sistemi, optimistic updates, background sync. Rezervasyon verileri, müsaitlik durumu, ödeme bilgileri için mükemmel.
  - **Özellikler:** Infinite queries (pagination), mutations (rezervasyon oluşturma), cache invalidation.

- **Form Yönetimi:** **React Hook Form (v7.x) + Zod (v3.x)**
  - **Neden:** Yüksek performans, minimum re-render, güçlü validasyon. Rezervasyon formları, kişisel bilgi formları için optimize edilmiş.
  - **Validasyon:** Zod ile runtime ve compile-time tip güvenliği.

### 4. Backend ve Veritabanı

- **Backend Framework:** **Next.js API Routes + tRPC (v11.x)**

  - **Neden:** End-to-end type safety, otomatik API dokümantasyonu, hızlı geliştirme. Frontend ve backend arasında tam TypeScript entegrasyonu.
  - **Alternatif:** Prisma + Express.js (daha karmaşık backend gereksinimlerinde).

- **Veritabanı:** **PostgreSQL (v16.x) + Prisma ORM (v5.x)**

  - **Neden:** İlişkisel veri yapısı rezervasyon sistemleri için ideal. Prisma ile type-safe database queries, migration sistemi.
  - **Hosting:** Vercel Postgres, PlanetScale, veya Supabase.

- **Kimlik Doğrulama:** **NextAuth.js (v5.x)**
  - **Neden:** Çoklu provider desteği, JWT/session yönetimi, güvenli authentication. Admin paneli ve müşteri girişi için.
  - **Providers:** Email/Password, Google OAuth, optionally SMS authentication.

### 5. Ödeme Sistemi

- **Ödeme Gateway:** **Stripe (v14.x) + iyzico (v2.x)**

  - **Neden:** Stripe uluslararası ödemeler için, iyzico Türkiye'deki yerel kartlar için. Güvenli, PCI DSS uyumlu.
  - **Özellikler:** Webhook handling, subscription management, refund processing.

- **Ödeme UI:** **Stripe Elements + React Stripe.js**
  - **Neden:** Güvenli, PCI DSS uyumlu ödeme formları. Özelleştirilebilir, mobil uyumlu.

### 6. Takvim ve Zaman Yönetimi

- **Takvim Kütüphanesi:** **React Big Calendar (v1.x) + date-fns (v3.x)**

  - **Neden:** Güçlü takvim bileşeni, çok görünüm desteği, event management. Admin paneli ve müşteri rezervasyonu için.
  - **Alternatif:** FullCalendar React wrapper.

- **Zaman İşleme:** **date-fns (v3.x)**
  - **Neden:** Hafif, modüler, immutable. Moment.js'den daha modern ve performanslı.
  - **Özellikler:** Timezone desteği, date formatting, duration calculations.

### 7. Dosya ve Medya Yönetimi

- **Dosya Yükleme:** **Uploadthing (v6.x)**

  - **Neden:** Next.js ile perfect entegrasyon, image optimization, CDN support. Portfolyo fotoğrafları için ideal.
  - **Özellikler:** Progress tracking, file type validation, automatic resizing.

- **Resim Optimizasyonu:** **Next.js Image + Sharp**
  - **Neden:** Automatic image optimization, lazy loading, responsive images. Portfolyo performansı için kritik.

### 8. Kod Kalitesi ve Geliştirici Deneyimi

- **Linting:** **ESLint (v8.x) + TypeScript ESLint**

  - **Neden:** Kod kalitesi ve tutarlılığı. Rezervasyon sistemi gibi kritik uygulamalarda hata önleme.
  - **Yapılandırma:** `eslint-config-next`, `@typescript-eslint/recommended`, `eslint-plugin-jsx-a11y`.

- **Formatting:** **Prettier (v3.x)**

  - **Neden:** Otomatik kod biçimlendirme, team consistency.
  - **Yapılandırma:** `.prettierrc` dosyası, ESLint ile entegre.

- **Git Hooks:** **Husky (v9.x) + lint-staged**

  - **Neden:** Commit öncesi kod kalitesi kontrolü, otomatik test çalıştırma.

- **Package Manager:** **pnpm workspaces**
  - **Neden:** Monorepo desteği, frontend/backend/shared packages için.

### 9. Test ve Kalite Güvencesi

- **Unit Testing:** **Vitest (v1.x) + React Testing Library**

  - **Neden:** Vite-based, çok hızlı test execution. Jest'den daha modern ve performanslı.
  - **Fokus:** Rezervasyon logic, form validation, utility functions.

- **E2E Testing:** **Playwright (v1.x)**

  - **Neden:** Multi-browser support, paralel test execution. Rezervasyon akışı için kritik.
  - **Senaryolar:** Tam rezervasyon süreci, ödeme akışı, admin paneli.

- **API Testing:** **Insomnia/Postman + Jest**
  - **Neden:** API endpoint testing, automated testing pipelines.

### 10. Monitoring ve Analytics

- **Analytics:** **Vercel Analytics + Google Analytics 4**

  - **Neden:** Performans metrikleri, kullanıcı davranışı analizi, conversion tracking.

- **Error Tracking:** **Sentry (v7.x)**

  - **Neden:** Real-time error monitoring, performance tracking, user session replay.

- **Logging:** **Winston (v3.x) + Vercel Logs**
  - **Neden:** Structured logging, reservation activity tracking.

### 11. Dağıtım (Deployment) ve DevOps

- **Hosting Platform:** **Vercel (Production) + Staging Environment**

  - **Neden:** Next.js için optimize edilmiş, otomatik SSL, CDN, edge functions.
  - **Özellikler:** Preview deployments, automatic scaling, edge caching.

- **CI/CD:** **GitHub Actions + Vercel Integration**

  - **Neden:** Otomatik deployment, test automation, quality checks.

- **Domain ve SSL:** **Cloudflare (DNS) + Vercel SSL**
  - **Neden:** DDoS protection, CDN, SSL certificate management.

### 12. Güvenlik ve Compliance

- **Security Headers:** **@next/bundle-analyzer + Security Headers**

  - **Neden:** OWASP compliance, XSS protection, CSP headers.

- **Rate Limiting:** **Upstash Redis + Rate Limiting**

  - **Neden:** API protection, brute force prevention.

- **GDPR/KVKK:** **Cookie consent + Data encryption**
  - **Neden:** Legal compliance, user privacy protection.

### 13. Geliştirme Araçları

- **IDE:** **VS Code + Extensions**

  - **Extensions:** TypeScript, Tailwind CSS IntelliSense, ESLint, Prettier, GitLens.

- **Database GUI:** **Prisma Studio + TablePlus**

  - **Neden:** Database inspection, query debugging.

- **API Testing:** **Insomnia/Postman**
  - **Neden:** API endpoint testing, documentation.

Bu teknoloji yığını, Fotomandalin Rezervasyon Sistemi'nin performans, güvenlik, ölçeklenebilirlik ve bakım kolaylığı açısından en iyi uygulamaları takip etmesini sağlayacaktır. Herhangi bir yeni teknoloji veya kütüphane eklenmeden önce bu doküman güncellenmeli ve kullanıcının onayı alınmalıdır.
