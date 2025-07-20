# Settings Components

Bu klasör, sistem ayarları sayfasının modüler component'lerini içerir.

## Klasör Yapısı

```
src/
├── components/
│   └── features/
│       └── admin/
│           ├── SettingsTab.tsx          # Sidebar'daki ayar kategorisi tabs
│           ├── SettingsCard.tsx         # Her ayar bölümü için kart container
│           ├── StatusIndicator.tsx      # Aktif/Pasif durumu göstergesi
│           └── settings/
│               ├── SiteSettingsForm.tsx      # Site ayarları formu
│               ├── PaymentSettingsForm.tsx   # Ödeme entegrasyonu formu
│               ├── EmailSettingsForm.tsx     # E-posta entegrasyonu formu
│               ├── SmsSettingsForm.tsx       # SMS entegrasyonu formu
│               ├── SocialSettingsForm.tsx    # Sosyal medya entegrasyonu formu
│               └── BookingSettingsForm.tsx   # Rezervasyon entegrasyonu formu
├── hooks/
│   └── useSettings.ts                   # Settings ile ilgili custom hooks
├── types/
│   └── settings.ts                     # Settings için type ve schema definitions
└── containers/
    └── admin/
        └── SettingsContainer.tsx       # Ana settings container (orchestrator)
```

## Component'ler

### SettingsTab

- Sidebar'da yer alan ayar kategorilerinin tab component'i
- Aktif durumu, değişiklik göstergesi ve açıklama desteği

### SettingsCard

- Her ayar bölümü için kullanılan kart wrapper
- Kaydet/Sıfırla butonları, loading durumu yönetimi
- Başlık, açıklama ve ikon desteği

### StatusIndicator

- Entegrasyonların aktif/pasif durumunu gösteren component
- Loading spinner desteği

### Settings Form Components

Her entegrasyon için ayrı form component'i:

- **SiteSettingsForm**: Temel site bilgileri, tema, SEO ayarları
- **PaymentSettingsForm**: Iyzico, Stripe, PayTR entegrasyonları
- **EmailSettingsForm**: SMTP, SendGrid entegrasyonları
- **SmsSettingsForm**: NetGSM, Twilio entegrasyonları
- **SocialSettingsForm**: Facebook, Instagram, Google entegrasyonları
- **BookingSettingsForm**: Google Calendar, Outlook entegrasyonları

## Custom Hooks

### useSettings.ts

- `useSettingsData`: tRPC queries for fetching settings data
- `useSettingsMutations`: tRPC mutations and submit handlers
- `useSettingsForms`: Form instances and data loading logic

## Type Definitions

### settings.ts

- Zod schemas for all settings types
- TypeScript interfaces for components
- Type exports for entire application

## Avantajlar

1. **Modülerlik**: Her entegrasyon ayrı component olarak yönetiliyor
2. **Maintainability**: Kod değişiklikleri izole edilmiş
3. **Reusability**: Component'ler diğer projelerde de kullanılabilir
4. **Separation of Concerns**: Logic, UI ve data katmanları ayrılmış
5. **Type Safety**: Tüm form verileri type-safe
6. **Testability**: Her component ayrı ayrı test edilebilir

## Kullanım

```tsx
import SettingsContainer from "@/containers/admin/SettingsContainer";

// Ana sayfa içinde
<SettingsContainer />;
```

Component'ler FormProvider ile sarılmış olduğu için form context'ine otomatik erişimleri vardır.
