# Rules

# 03_rules.md

## Genel Davranış Kuralları ve Kısıtlamalar

Bu doküman, Fotomandalin Rezervasyon Sistemi geliştirme sürecinde uyulması gereken tüm genel kuralları, yasakları, güvenlik protokollerini ve en iyi uygulama prensiplerini detaylandırmaktadır. Bu kurallar, projenin kalitesini, güvenliğini, sürdürülebilirliğini ve performansını garanti altına almak için kritik öneme sahiptir.

---

### 1. Temel Prensipler ve Yaklaşım

- **Bağlam Odaklılık:** Verilen tüm `context` dosyaları (01_persona.md, 02_project_overview.md vb.) en yüksek önceliğe sahiptir. Her karar ve eylem, bu bağlam dosyalarında belirtilen bilgilerle uyumlu olmalıdır.
- **İteratif Gelişim:** Proje, küçük, yönetilebilir adımlarla ilerlemelidir. Her adımda çıktıların doğruluğu ve kalitesi kontrol edilmelidir.
- **Şeffaflık:** Yapılan her işlem, alınan her karar ve karşılaşılan her sorun açıkça raporlanmalıdır. Kod yorumları ve dokümantasyon bu şeffaflığı desteklemelidir.
- **Müşteri Merkezlilik:** Tüm tasarım ve geliştirme kararları, `02_project_overview.md` dosyasında tanımlanan hedef kitlenin ihtiyaçları ve rezervasyon sistemi UX prensipleri doğrultusunda alınmalıdır.
- **İş Süreci Odaklılık:** Fotomandalin'in mevcut iş süreçlerini anlamak ve dijital çözümlerle optimize etmek önceliklidir.

### 2. Kod Kalitesi ve En İyi Uygulamalar

- **Clean Code Prensibi:**

  - **Okunabilirlik:** Kod, sanki bir hikaye anlatıyormuş gibi okunabilir olmalıdır. Değişken, fonksiyon, sınıf ve bileşen isimleri, amaçlarını ve işlevlerini net bir şekilde yansıtmalıdır (örn: `calculateReservationTotal`, `BookingCalendarCard`, `PaymentProcessor`). Kısaltmalardan ve belirsiz isimlerden kaçınılmalıdır.
  - **Basitlik:** Karmaşık rezervasyon algoritmaları veya iş mantıkları, daha küçük, anlaşılır ve test edilebilir parçalara ayrılmalıdır.
  - **Yorumlar:** Kodun neden yazıldığına dair karmaşık iş mantığını veya kritik kararları açıklayan yorumlar eklenmelidir. Özellikle rezervasyon çakışma kontrolü, ödeme işlemleri ve takvim algoritmaları gibi karmaşık süreçler detaylı yorumlanmalıdır.
  - **Biçimlendirme:** `05_tech_stack.md` dosyasında belirtilen linting ve formatting araçlarının (ESLint, Prettier) kurallarına harfiyen uyulmalıdır. Tutarlı girintileme, boşluk kullanımı ve satır sonları sağlanmalıdır.

- **Tek Sorumluluk Prensibi (Single Responsibility Principle - SRP):** Her fonksiyon, sınıf veya bileşen sadece tek bir sorumluluğa sahip olmalıdır. Örneğin, rezervasyon bileşeni sadece rezervasyon ile ilgili işlemleri yapmalı, ödeme işlemleri ayrı bir bileşende ele alınmalıdır.

- **DRY Prensibi (Don't Repeat Yourself):** Kod tekrarından kaçınılmalıdır. Ortak kullanılan mantıklar veya UI elementleri yeniden kullanılabilir bileşenler olarak soyutlanmalıdır. Özellikle form validasyonları, tarih işlemleri ve ödeme fonksiyonları için ortak kütüphaneler geliştirilmelidir.

- **Modülerlik:** Kod, bağımsız ve yeniden kullanılabilir modüllere ayrılmalıdır. Rezervasyon sistemi, ödeme sistemi, takvim sistemi gibi ana bileşenler birbirinden bağımsız çalışabilir olmalıdır.

- **Hata Yönetimi:**

  - Potansiyel hata durumları öngörülmeli ve uygun hata yakalama (try-catch) mekanizmaları ile kullanıcıya dostu hata mesajları sunulmalıdır.
  - Ödeme hataları, rezervasyon çakışmaları, API çağrısı hataları gibi kritik durumlar özel olarak ele alınmalıdır.
  - Hata mesajları Türkçe olmalı ve kullanıcıya net eylem adımları sunmalıdır.

- **Performans Optimizasyonu:**
  - `02_project_overview.md` dosyasındaki performans hedeflerine ulaşmak için kod yazımında ve kaynak kullanımında optimizasyonlar yapılmalıdır.
  - Büyük takvim verilerinde lazy loading, rezervasyon listelerinde pagination kullanılmalıdır.
  - Resim optimizasyonu, code splitting ve caching stratejileri uygulanmalıdır.

### 3. Rezervasyon Sistemi Özel Kuralları

- **Double Booking Önleme:** Aynı tarih ve saatte birden fazla rezervasyon alınmasını önleyecek katı kontrol mekanizmaları uygulanmalıdır.
- **Takvim Yönetimi:** Müsait/meşgul günlerin doğru bir şekilde hesaplanması ve güncellenmesi sağlanmalıdır.
- **Ödeme Güvenliği:** Ödeme bilgileri asla frontend'de saklanmamalı, güvenli ödeme gateway'leri kullanılmalıdır.
- **Rezervasyon Durumu Takibi:** Her rezervasyonun durumu (beklemede, onaylandı, iptal edildi) net bir şekilde izlenmelidir.
- **Otomatik Bildirimler:** E-posta ve SMS bildirimleri için güvenilir sistemler kurulmalıdır.

### 4. Güvenlik Protokolleri ve Yasaklar

- **Hassas Bilgi Yönetimi:**

  - API anahtarları, veritabanı kimlik bilgileri, ödeme gateway anahtarları gibi hassas bilgiler asla doğrudan frontend koduna gömülmemelidir.
  - Bunlar her zaman ortam değişkenleri (environment variables) aracılığıyla veya güvenli bir backend servisi üzerinden yönetilmelidir.
  - Müşteri kişisel bilgileri ve ödeme bilgileri KVKK'ya uygun şekilde işlenmelidir.

- **Girdi Doğrulama ve Temizleme (Input Validation & Sanitization):**

  - Kullanıcıdan alınan tüm girdiler (rezervasyon formları, kişisel bilgiler, ödeme bilgileri) sunucuya gönderilmeden önce ve sunucu tarafında mutlaka doğrulanmalı ve temizlenmelidir.
  - Özellikle tarih aralıkları, telefon numaraları, e-posta adresleri için katı validasyon kuralları uygulanmalıdır.
  - Cross-Site Scripting (XSS) ve SQL Injection gibi saldırıları önlemek için tüm girdiler sanitize edilmelidir.

- **Ödeme Güvenliği:**

  - Ödeme bilgileri asla frontend'de saklanmamalı veya loglanmamalıdır.
  - PCI DSS standartlarına uygun ödeme işlemleri yapılmalıdır.
  - Ödeme gateway entegrasyonları SSL sertifikası ile korunmalıdır.
  - Ödeme bilgileri şifreli şekilde iletilmelidir.

- **KVKK Uyumluluğu:**

  - Kişisel verilerin toplanması, işlenmesi ve saklanması KVKK'ya uygun olmalıdır.
  - Açık rıza metinleri net ve anlaşılır olmalıdır.
  - Veri saklama süreleri belirlenmelidir.
  - Kullanıcı veri silme talepleri için mekanizma kurulmalıdır.

- **Session Yönetimi:**
  - Kullanıcı oturumları güvenli şekilde yönetilmelidir.
  - Session timeout süreleri belirlenmelidir.
  - Admin paneli için özel güvenlik önlemleri alınmalıdır.

### 5. Yasaklar (Kesinlikle Yapılmaması Gerekenler)

- **Placeholder Metinler:** Asla `Lorem Ipsum` veya "Test" gibi yer tutucu metinler kullanılmamalıdır. Her zaman Fotomandalin'in iş süreçlerine uygun, gerçekçi ve anlamlı içerikler üretilmelidir.

- **Sahte Veriler:** Rezervasyon sisteminde sahte müşteri bilgileri, sahte ödeme bilgileri veya sahte rezervasyon verileri kullanılmamalıdır.

- **Kırık Linkler ve Görseller:** Sitede hiçbir kırık link veya yüklenemeyen görsel bulunmamalıdır. Tüm bağlantılar ve kaynaklar test edilmelidir.

- **Debug İfadeleri:** Nihai (production) kodda asla `console.log`, `alert`, `debugger` gibi debug ifadeleri bırakılmamalıdır.

- **!important Kullanımı:** CSS'te `!important` kullanmaktan kaçınılmalıdır. CSS özgüllüğü (specificity) kuralları doğru bir şekilde kullanılmalıdır.

- **Optimize Edilmemiş Kaynaklar:** Büyük resim dosyaları, videolar veya optimize edilmemiş JavaScript/CSS dosyaları kullanılmamalıdır. Tüm kaynaklar performansı en üst düzeye çıkarmak için sıkıştırılmalı ve optimize edilmelidir.

- **Sihirli Sayılar ve Dizeler:** Kod içinde doğrudan sayısal veya metinsel değerler kullanmaktan kaçınılmalıdır. Bu tür değerler, anlamlı isimlere sahip sabitler olarak tanımlanmalıdır.

- **Teknoloji Kısıtlamalarını İhlal Etme:** `05_tech_stack.md` dosyasında belirtilen teknoloji yığınının dışına çıkılmamalıdır. Yeni bir kütüphane veya araç eklemek için kullanıcıdan onay alınmalıdır.

- **Erişilebilirlik Standartlarını Göz Ardı Etme:** WCAG 2.1 AA standartları asla ihlal edilmemelidir. Özellikle form erişilebilirliği, klavye navigasyonu kritik önem taşır.

- **Mobil Uyumluluğu Göz Ardı Etme:** Mobil-first yaklaşım benimsenmelidir. Tüm özellikler mobil cihazlarda mükemmel çalışmalıdır.

### 6. Performans Kuralları

- **Sayfa Yükleme Süresi:** Tüm sayfalar 3 saniye altında yüklenmelidir.
- **Lighthouse Skorları:** Performans, Erişilebilirlik, En İyi Pratikler ve SEO kategorilerinde 95+ puan hedeflenir.
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1 hedeflenir.
- **Resim Optimizasyonu:** Tüm resimler WebP formatında ve uygun boyutlarda optimize edilmelidir.
- **Kod Bölme:** JavaScript bundles'ları 250KB'ı geçmemelidir.

### 7. Test Kuralları

- **Unit Testler:** Kritik iş mantığı fonksiyonları için unit testler yazılmalıdır.
- **E2E Testler:** Rezervasyon akışı, ödeme süreci gibi kritik kullanıcı yolları için end-to-end testler yazılmalıdır.
- **Manual Testing:** Her özellik farklı cihaz ve tarayıcılarda test edilmelidir.
- **Regresyon Testleri:** Yeni özellikler eklendiğinde mevcut özellikler etkilenmemeli.

### 8. Dokümantasyon Kuralları

- **Kod Dokümantasyonu:** Karmaşık fonksiyonlar JSDoc ile dokümante edilmelidir.
- **API Dokümantasyonu:** Tüm API endpoint'leri detaylı şekilde dokümante edilmelidir.
- **Kullanıcı Kılavuzu:** Admin paneli için kullanıcı kılavuzu hazırlanmalıdır.
- **Teknik Dokümantasyon:** Sistem mimarisi ve deployment süreçleri dokümante edilmelidir.

Bu kurallar, Fotomandalin Rezervasyon Sistemi'nin başarısı için bir sözleşme niteliğindedir. Geliştirme uzmanı, bu kurallara tam uyum sağlamayı taahhüt eder.
