# Site Structure

# 04_site_structure.md

## Web Sitesi Sayfa Yapısı ve Hiyerarşisi

Bu doküman, Fotomandalin Rezervasyon Sistemi web sitesinin tüm sayfalarını, URL yapılarını, ana bölümlerini ve her bir bölümün temel içeriğini detaylandırmaktadır. Bu yapı, sitenin navigasyonunu, kullanıcı deneyimini ve rezervasyon akışını belirleyecektir.

---

### 1. Ana Sayfa (`/`)

- **URL:** `/` (Kök dizin)
- **Amacı:** Ziyaretçilere Fotomandalin hakkında hızlı bir genel bakış sunmak, hizmetleri tanıtmak ve rezervasyon yapmaya teşvik etmek.
- **Bölümler:**
  - **1.1. Hero Bölümü (Kahraman Alanı):**
    - **İçerik:** Büyük, etkileyici bir başlık (örn: "Anınızı Ölümsüzleştirin: Fotomandalin ile Profesyonel Fotoğrafçılık"), Fotomandalin'in logo ve sloganı, kısa ve çarpıcı bir tanıtım metni.
    - **Görsel:** Fotomandalin'in en iyi çalışmalarından oluşan bir fotoğraf carousel'i veya hero görsel.
    - **CTA (Call-to-Action):** "Hemen Rezervasyon Yap" veya "Paketleri İncele" gibi yönlendirici butonlar.
  - **1.2. Hizmet Özetleri Bölümü:**
    - **İçerik:** Ana hizmet kategorilerinin (Düğün, Nişan, Bebek, Aile, Kurumsal) kısa tanıtımları. Her hizmet için bir kart (card) kullanılmalı.
    - **Hizmet Kartı Yapısı:** Hizmet başlığı, kısa açıklama (1-2 cümle), örnek fotoğraf, başlangıç fiyatı, ve "Rezervasyon Yap" linki.
  - **1.3. Öne Çıkan Portfolyo Bölümü:**
    - **İçerik:** Fotomandalin'in en etkileyici çalışmalarından oluşan fotoğraf galerisi. Responsive grid layout.
    - **Etkileşim:** Fotoğraflara tıklandığında lightbox ile büyük gösterim.
  - **1.4. Hızlı Rezervasyon Bölümü:**
    - **İçerik:** Basit rezervasyon formu: Hizmet seçimi, tarih seçimi, iletişim bilgileri.
    - **Amaç:** Hızlı rezervasyon için kısa yol sunmak.

### 2. Hakkımızda Sayfası (`/about`)

- **URL:** `/about`
- **Amacı:** Fotomandalin'in hikayesini, felsefesini, deneyimini ve ekibini tanıtmak.
- **Bölümler:**
  - **2.1. Firma Hikayesi:**
    - **İçerik:** Fotomandalin'in kuruluş hikayesi, misyon ve vizyon, fotoğrafçılık felsefesi.
  - **2.2. Deneyim ve Uzmanlık:**
    - **İçerik:** Kaç yıllık deneyim, uzmanlık alanları, özel yetenekler ve sertifikalar.
  - **2.3. Ekip Tanıtımı:**
    - **İçerik:** Fotoğrafçı profili, asistan bilgileri, uzmanlık alanları.
  - **2.4. Değerler ve Yaklaşım:**
    - **İçerik:** Müşteri memnuniyeti, kalite standartları, çalışma prensipleri.

### 3. Hizmetler ve Paketler Sayfası (`/services`)

- **URL:** `/services`
- **Amacı:** Tüm hizmet kategorilerini ve paket seçeneklerini detaylı olarak sunmak.
- **Bölümler:**
  - **3.1. Hizmet Kategorileri:**
    - **İçerik:** Ana hizmet kategorilerinin (Düğün, Nişan, Bebek, Aile, Kurumsal) detaylı tanıtımları.
    - **Her kategori için:** Açıklama, örnek fotoğraflar, süre bilgisi, dahil olan hizmetler.
  - **3.2. Paket Detay Sayfası (`/services/[category]/[package-slug]`)**
    - **URL:** `/services/[category]/[package-slug]` (Dinamik URL)
    - **Amacı:** Her bir paketin detaylarını, fiyatını ve rezervasyon seçeneklerini sunmak.
    - **Bölümler:**
      - **Paket Başlığı ve Fiyat:** Paket adı, fiyat bilgisi, süre.
      - **Paket İçeriği:** Dahil olan hizmetler, fotoğraf sayısı, ek özellikler.
      - **Ek Hizmetler:** Seçilebilir ek hizmetler ve fiyatları.
      - **Lokasyon Seçenekleri:** Mevcut çekim lokasyonları.
      - **Örnek Çalışmalar:** Bu pakete ait örnek fotoğraflar.
      - **Rezervasyon Bölümü:** Takvim seçimi, rezervasyon formu.

### 4. Portfolyo Sayfası (`/portfolio`)

- **URL:** `/portfolio`
- **Amacı:** Fotomandalin'in tüm çalışmalarını kategorize edilmiş şekilde sergilemek.
- **Bölümler:**
  - **4.1. Kategori Filtresi:**
    - **İçerik:** Düğün, Nişan, Bebek, Aile, Kurumsal gibi kategorilere göre filtreleme seçenekleri.
  - **4.2. Fotoğraf Galerisi:**
    - **İçerik:** Masonry veya grid layout ile organize edilmiş fotoğraf galerisi.
    - **Etkileşim:** Lightbox ile büyük gösterim, swipe desteği.
  - **4.3. Proje Detay Sayfası (`/portfolio/[project-slug]`)**
    - **URL:** `/portfolio/[project-slug]` (Dinamik URL)
    - **Amacı:** Belirli bir projenin tüm fotoğraflarını ve detaylarını sunmak.
    - **Bölümler:**
      - **Proje Başlığı ve Tarihi:** Çekim adı, tarih ve lokasyon.
      - **Proje Açıklaması:** Çekim hakkında kısa bilgi.
      - **Fotoğraf Koleksiyonu:** Projeye ait tüm fotoğraflar.
      - **Teknik Detaylar:** Kullanılan ekipman, teknikler (opsiyonel).

### 5. Rezervasyon Sayfası (`/booking`)

- **URL:** `/booking`
- **Amacı:** Tam rezervasyon sürecini yönetmek ve müşterinin rezervasyonunu tamamlamasını sağlamak.
- **Bölümler:**
  - **5.1. Paket Seçimi:**
    - **İçerik:** Mevcut paketlerin karşılaştırmalı listesi, fiyat tablosu.
    - **Etkileşim:** Paket seçimi, karşılaştırma özelliği.
  - **5.2. Tarih ve Saat Seçimi:**
    - **İçerik:** Müsait tarihleri gösteren takvim widget'i.
    - **Özellikler:** Müsait/meşgul günlerin görünümü, saat dilimi seçimi.
  - **5.3. Ek Hizmetler:**
    - **İçerik:** Seçilebilir ek hizmetler (drone çekim, albüm, ekstra saat).
    - **Etkileşim:** Checkbox seçimi, dinamik fiyat hesaplama.
  - **5.4. Lokasyon Seçimi:**
    - **İçerik:** Mevcut çekim lokasyonları (stüdyo, açık alan, müşteri mekanı).
    - **Detaylar:** Lokasyon fotoğrafları, özellikler, ek ücret bilgileri.
  - **5.5. Kişisel Bilgiler:**
    - **İçerik:** Müşteri bilgileri formu (ad, soyad, telefon, e-posta, adres).
    - **Validasyon:** Gerçek zamanlı form doğrulama.
  - **5.6. Ödeme Bölümü:**
    - **İçerik:** Fiyat özeti, ödeme seçenekleri, güvenli ödeme formu.
    - **Entegrasyon:** iyzico, Stripe veya benzeri ödeme gateway entegrasyonu.
  - **5.7. Onay Sayfası:**
    - **İçerik:** Rezervasyon onayı, rezervasyon detayları, sonraki adımlar.

### 6. Hesabım Sayfası (`/account`)

- **URL:** `/account`
- **Amacı:** Müşterilerin rezervasyon durumlarını takip etmelerine olanak sağlamak.
- **Bölümler:**
  - **6.1. Rezervasyon Durumu:**
    - **İçerik:** Mevcut rezervasyonların durumu (beklemede, onaylandı, tamamlandı).
  - **6.2. Rezervasyon Geçmişi:**
    - **İçerik:** Geçmiş rezervasyonların listesi ve detayları.
  - **6.3. Profil Bilgileri:**
    - **İçerik:** Kişisel bilgilerin düzenlenmesi.
  - **6.4. Fotoğraf Galerisi:**
    - **İçerik:** Müşteriye ait tamamlanmış çekimlerden fotoğraflar (varsa).

### 7. İletişim Sayfası (`/contact`)

- **URL:** `/contact`
- **Amacı:** Müşterilerin sorularını sorması ve iletişim kurması için kanal sunmak.
- **Bölümler:**
  - **7.1. İletişim Bilgileri:**
    - **İçerik:** Telefon, e-posta, adres, çalışma saatleri.
  - **7.2. Sosyal Medya Linkleri:**
    - **İçerik:** Instagram, Facebook, YouTube gibi sosyal medya hesaplarına linkler.
  - **7.3. İletişim Formu:**
    - **İçerik:** Ad, E-posta, Konu ve Mesaj alanlarını içeren iletişim formu.
  - **7.4. Harita:**
    - **İçerik:** Stüdyo lokasyonunu gösteren interaktif harita.

### 8. Admin Paneli (`/admin`)

- **URL:** `/admin`
- **Amacı:** Fotomandalin ekibinin rezervasyonları, müşterileri ve içerikleri yönetmesi.
- **Bölümler:**
  - **8.1. Dashboard:**
    - **İçerik:** Genel istatistikler, yaklaşan rezervasyonlar, gelir özeti.
  - **8.2. Rezervasyon Yönetimi (`/admin/bookings`):**
    - **İçerik:** Rezervasyon listesi, onay/red, durum güncelleme.
  - **8.3. Takvim Yönetimi (`/admin/calendar`):**
    - **İçerik:** Müsait/meşgul günlerin yönetimi, izin günleri.
  - **8.4. Paket Yönetimi (`/admin/packages`):**
    - **İçerik:** Paket oluşturma, düzenleme, fiyat güncelleme.
  - **8.5. Müşteri Yönetimi (`/admin/customers`):**
    - **İçerik:** Müşteri listesi, iletişim bilgileri, rezervasyon geçmişi.
  - **8.6. İçerik Yönetimi (`/admin/content`):**
    - **İçerik:** Portfolyo yönetimi, fotoğraf yükleme, galeri düzenleme.

### 9. Yasal Sayfalar

- **9.1. Gizlilik Politikası (`/privacy`)**
  - **İçerik:** KVKK uyumlu gizlilik politikası metni.
- **9.2. Kullanım Koşulları (`/terms`)**
  - **İçerik:** Hizmet kullanım koşulları ve sözleşme şartları.
- **9.3. Çerez Politikası (`/cookies`)**
  - **İçerik:** Çerez kullanımı hakkında bilgilendirme.

### 10. Yardımcı Sayfalar

- **10.1. 404 Sayfası (`/404`)**
  - **İçerik:** Kullanıcı dostu hata mesajı ve ana sayfaya yönlendirme.
- **10.2. Sıkça Sorulan Sorular (`/faq`)**
  - **İçerik:** Rezervasyon, ödeme, çekim süreci hakkında SSS.
- **10.3. Sitemap (`/sitemap`)**
  - **İçerik:** Tüm sayfaların organize edilmiş listesi.

### 11. API Endpoints (Backend)

- **11.1. Rezervasyon API (`/api/bookings`)**
  - **İşlevler:** Rezervasyon oluşturma, güncelleme, iptal etme.
- **11.2. Takvim API (`/api/calendar`)**
  - **İşlevler:** Müsait tarihleri getirme, takvim güncelleme.
- **11.3. Ödeme API (`/api/payments`)**
  - **İşlevler:** Ödeme işlemi, doğrulama, iade.
- **11.4. Müşteri API (`/api/customers`)**
  - **İşlevler:** Müşteri bilgileri CRUD işlemleri.

Bu detaylı sayfa yapısı, Fotomandalin Rezervasyon Sistemi'nin her bir bölümünü ve işlevselliğini tutarlı bir şekilde inşa etmesi için net bir yol haritası sunmaktadır.
