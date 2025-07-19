# Software Architecture

# 06_software_architecture.md

## Yazılım Mimarisi ve Kod Organizasyonu

Bu doküman, Fotomandalin Rezervasyon Sistemi projesinin yazılım mimarisini, klasör yapısını, bileşen organizasyonunu ve veri akışını detaylandırmaktadır. Amaç, projenin ölçeklenebilir, sürdürülebilir, test edilebilir ve anlaşılır bir kod tabanına sahip olmasını sağlamaktır.

---

### 1. Genel Mimari Yaklaşımı

- **Mimari Stil:** **Fullstack Jamstack + API-First Architecture**

  - **Neden:** Bu hibrit mimari, statik içerikler için SSG performansı, dinamik rezervasyon işlemleri için API routes, ve real-time güncellemeler için modern web teknolojilerinin avantajlarını birleştirir. Rezervasyon sistemleri için ideal olan bu yaklaşım, yüksek performans ve güvenlik sağlar.

- **Bileşen Tasarım Metodolojisi:** **Atomic Design + Domain-Driven Design (DDD)**

  - **Neden:** UI'ı küçük, yeniden kullanılabilir parçalara ayırırken, rezervasyon sistemi özelinde domain-specific bileşenler (BookingFlow, PaymentProcess) oluşturarak business logic'i net bir şekilde organize eder.

- **Veri Akış Mimarisi:** **Unidirectional Data Flow + Optimistic Updates**
  - **Neden:** Rezervasyon durumları, ödeme işlemleri ve takvim güncellemeleri için predictable state management ve kullanıcı deneyimi optimizasyonu sağlar.

### 2. Klasör Yapısı (Next.js App Router + Monorepo)

Proje, Next.js'in App Router mimarisine uygun olarak aşağıdaki gibi yapılandırılacaktır:

```
fotomandalin-booking-system/
├── apps/
│   ├── web/                    # Frontend (Next.js)
│   │   ├── public/             # Statik dosyalar
│   │   │   ├── images/         # Portfolyo fotoğrafları
│   │   │   ├── icons/          # İkonlar ve logolar
│   │   │   └── documents/      # Yasal belgeler (KVKK, sözleşmeler)
│   │   ├── src/
│   │   │   ├── app/            # App Router sayfaları
│   │   │   │   ├── (public)/   # Herkese açık sayfalar
│   │   │   │   │   ├── about/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── [category]/
│   │   │   │   │   │   │   ├── [package]/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── portfolio/
│   │   │   │   │   │   ├── [project]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── booking/
│   │   │   │   │   │   ├── process/
│   │   │   │   │   │   ├── payment/
│   │   │   │   │   │   ├── confirmation/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── contact/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── (auth)/     # Kimlik doğrulama gerektiren sayfalar
│   │   │   │   │   ├── account/
│   │   │   │   │   │   ├── bookings/
│   │   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (admin)/    # Admin paneli
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── bookings/
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── calendar/
│   │   │   │   │   ├── packages/
│   │   │   │   │   ├── customers/
│   │   │   │   │   ├── content/
│   │   │   │   │   └── settings/
│   │   │   │   ├── api/        # API Routes
│   │   │   │   │   ├── trpc/
│   │   │   │   │   │   └── [trpc]/
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── payments/
│   │   │   │   │   │   ├── stripe/
│   │   │   │   │   │   └── iyzico/
│   │   │   │   │   ├── bookings/
│   │   │   │   │   ├── calendar/
│   │   │   │   │   └── webhooks/
│   │   │   │   ├── globals.css
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/     # React bileşenleri
│   │   │   │   ├── atoms/      # Temel UI bileşenleri
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Avatar.tsx
│   │   │   │   │   └── Spinner.tsx
│   │   │   │   ├── molecules/  # Kombine bileşenler
│   │   │   │   │   ├── SearchBox.tsx
│   │   │   │   │   ├── DatePicker.tsx
│   │   │   │   │   ├── ServiceCard.tsx
│   │   │   │   │   ├── PriceTag.tsx
│   │   │   │   │   └── StatusBadge.tsx
│   │   │   │   ├── organisms/  # Karmaşık UI bölümleri
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── BookingCalendar.tsx
│   │   │   │   │   ├── ServiceList.tsx
│   │   │   │   │   ├── PaymentForm.tsx
│   │   │   │   │   ├── PortfolioGallery.tsx
│   │   │   │   │   └── AdminSidebar.tsx
│   │   │   │   ├── templates/  # Sayfa şablonları
│   │   │   │   │   ├── PublicLayout.tsx
│   │   │   │   │   ├── AuthLayout.tsx
│   │   │   │   │   ├── AdminLayout.tsx
│   │   │   │   │   └── BookingLayout.tsx
│   │   │   │   └── features/   # Domain-specific bileşenler
│   │   │   │       ├── booking/
│   │   │   │       │   ├── BookingFlow.tsx
│   │   │   │       │   ├── PackageSelector.tsx
│   │   │   │       │   ├── DateTimeSelector.tsx
│   │   │   │       │   ├── AddOnSelector.tsx
│   │   │   │       │   └── BookingSummary.tsx
│   │   │   │       ├── payment/
│   │   │   │       │   ├── PaymentProcess.tsx
│   │   │   │       │   ├── StripePayment.tsx
│   │   │   │       │   ├── IyzicoPayment.tsx
│   │   │   │       │   └── PaymentConfirmation.tsx
│   │   │   │       ├── admin/
│   │   │   │       │   ├── BookingManager.tsx
│   │   │   │       │   ├── CalendarManager.tsx
│   │   │   │       │   ├── PackageManager.tsx
│   │   │   │       │   └── CustomerManager.tsx
│   │   │   │       └── portfolio/
│   │   │   │           ├── GalleryViewer.tsx
│   │   │   │           ├── ImageLightbox.tsx
│   │   │   │           └── CategoryFilter.tsx
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useBooking.ts
│   │   │   │   ├── usePayment.ts
│   │   │   │   ├── useCalendar.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLocalStorage.ts
│   │   │   ├── lib/            # Yardımcı fonksiyonlar
│   │   │   │   ├── auth.ts
│   │   │   │   ├── database.ts
│   │   │   │   ├── payments/
│   │   │   │   │   ├── stripe.ts
│   │   │   │   │   └── iyzico.ts
│   │   │   │   ├── validations/
│   │   │   │   │   ├── booking.ts
│   │   │   │   │   ├── payment.ts
│   │   │   │   │   └── user.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── constants.ts
│   │   │   ├── store/          # State management
│   │   │   │   ├── booking.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── ui.ts
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   │   ├── booking.ts
│   │   │   │   ├── payment.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── api.ts
│   │   │   └── styles/         # Styling
│   │   │       ├── globals.css
│   │   │       └── components.css
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── api/                    # Backend API (opsiyonel, ayrı servis)
├── packages/
│   ├── database/               # Prisma schema ve migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   ├── shared/                 # Paylaşılan types ve utilities
│   │   ├── types/
│   │   ├── constants/
│   │   └── utils/
│   └── ui/                     # Paylaşılan UI bileşenleri
├── tools/
│   ├── eslint-config/
│   └── typescript-config/
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### 3. Bileşen Organizasyonu (Domain-Driven Atomic Design)

- **`src/components/atoms/`**

  - **Tanım:** Temel UI yapı taşları, domain-agnostic bileşenler.
  - **Örnekler:** `Button.tsx`, `Input.tsx`, `Badge.tsx`, `Avatar.tsx`, `Spinner.tsx`.
  - **Özellikler:** Shadcn/UI tabanlı, tam erişilebilirlik desteği, tema desteği.
  - **Kural:** Props-driven, state-less, domain logic içermez.

- **`src/components/molecules/`**

  - **Tanım:** Atomların birleşimi, basit kompozit bileşenler.
  - **Örnekler:** `SearchBox.tsx`, `DatePicker.tsx`, `ServiceCard.tsx`, `PriceTag.tsx`.
  - **Özellikler:** Basit interaction logic, controlled/uncontrolled patterns.
  - **Kural:** Tek bir UI amacı, minimal business logic.

- **`src/components/organisms/`**

  - **Tanım:** Sayfanın büyük bölümlerini oluşturan karmaşık bileşenler.
  - **Örnekler:** `Header.tsx`, `BookingCalendar.tsx`, `PaymentForm.tsx`, `PortfolioGallery.tsx`.
  - **Özellikler:** Multiple data sources, complex interactions, state management.
  - **Kural:** Bağımsız functionality, reusable across pages.

- **`src/components/templates/`**

  - **Tanım:** Sayfa layout'larını tanımlayan şablonlar.
  - **Örnekler:** `PublicLayout.tsx`, `AuthLayout.tsx`, `AdminLayout.tsx`, `BookingLayout.tsx`.
  - **Özellikler:** Routing, authentication, global state integration.

- **`src/components/features/`**
  - **Tanım:** Domain-specific, business logic içeren bileşenler.
  - **Örnekler:** `BookingFlow.tsx`, `PaymentProcess.tsx`, `AdminDashboard.tsx`.
  - **Özellikler:** End-to-end user flows, domain expertise, complex state.
  - **Kural:** Single responsibility principle, domain boundaries.

### 4. Veri Akışı ve Durum Yönetimi

- **State Management Architecture:**

  - **Global State:** Zustand - Auth, UI preferences, booking context
  - **Server State:** TanStack Query - API data, cache management
  - **Local State:** React useState/useReducer - Component-level state
  - **Form State:** React Hook Form - Form validation, submission

- **Veri Akış Katmanları:**

  ```
  UI Components → Custom Hooks → TanStack Query → tRPC → API Routes → Database
               ↓
             Zustand Store (Global State)
  ```

- **Booking Flow State Management:**

  ```typescript
  // store/booking.ts
  interface BookingState {
    currentStep: BookingStep;
    selectedPackage?: Package;
    selectedDate?: Date;
    selectedAddOns: AddOn[];
    customerInfo?: CustomerInfo;
    paymentStatus: PaymentStatus;
    bookingId?: string;
  }
  ```

- **Real-time Updates:**
  - **WebSocket/Server-Sent Events:** Calendar availability, booking status
  - **Optimistic Updates:** UI updates before server confirmation
  - **Background Sync:** Offline support, cache synchronization

### 5. API Tasarımı (tRPC + REST Hybrid)

- **tRPC Routers:**

  ```typescript
  // server/routers/
  ├── auth.ts          # Authentication procedures
  ├── booking.ts       # Booking CRUD operations
  ├── payment.ts       # Payment processing
  ├── calendar.ts      # Availability management
  ├── admin.ts         # Admin operations
  └── public.ts        # Public content (services, portfolio)
  ```

- **REST Endpoints (Webhooks):**
  ```
  /api/webhooks/stripe     # Stripe payment webhooks
  /api/webhooks/iyzico     # Iyzico payment webhooks
  /api/auth/callback       # OAuth callbacks
  /api/upload              # File upload endpoint
  ```

### 6. Güvenlik Mimarisi

- **Authentication Flow:**

  ```
  User → NextAuth.js → JWT Token → API Routes → Database
                    ↓
                Session Store
  ```

- **Authorization Layers:**

  - **Route-level:** Middleware authentication
  - **API-level:** tRPC context authorization
  - **Database-level:** Row-level security (RLS)

- **Data Validation:**
  ```typescript
  Client → Zod Schema → tRPC → Prisma → Database
                      ↓
               Runtime Validation
  ```

### 7. Performans Optimizasyonu

- **Code Splitting Strategy:**

  - **Route-based:** Automatic Next.js code splitting
  - **Component-based:** React.lazy() for heavy components
  - **Library-based:** Dynamic imports for large libraries

- **Caching Strategy:**

  - **Static:** ISR for content pages
  - **Dynamic:** TanStack Query for API data
  - **Edge:** Vercel Edge Cache for global content

- **Image Optimization:**
  - **Next.js Image:** Automatic optimization, WebP conversion
  - **Uploadthing:** CDN delivery, multiple formats
  - **Lazy Loading:** Intersection Observer API

### 8. Test Mimarisi

- **Test Strategy:**

  ```
  Unit Tests (Vitest) → Integration Tests → E2E Tests (Playwright)
                     ↓
               Component Tests (React Testing Library)
  ```

- **Test Coverage:**
  - **Business Logic:** 90%+ coverage
  - **Components:** Visual regression testing
  - **API Routes:** Contract testing
  - **User Flows:** E2E testing

### 9. Monitoring ve Logging

- **Application Monitoring:**

  - **Sentry:** Error tracking, performance monitoring
  - **Vercel Analytics:** Web vitals, user behavior
  - **Custom Metrics:** Booking conversion, payment success rates

- **Logging Strategy:**
  ```
  Application → Structured Logs → Vercel Logs → Sentry → Dashboards
                               ↓
                         Alert System
  ```

Bu mimari, Fotomandalin Rezervasyon Sistemi'nin ölçeklenebilir, sürdürülebilir ve yüksek performanslı olmasını sağlayacak sağlam bir temel oluşturur. Her bir bileşen ve modül, bu mimari prensiplere uygun olarak geliştirilecektir.
