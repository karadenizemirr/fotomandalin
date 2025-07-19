# UI/UX Guidelines

# 08_ui_ux_guidelines.md

## Kullanıcı Arayüzü (UI) ve Kullanıcı Deneyimi (UX) Kılavuzu

Bu doküman, fotomandalin projesinin görsel tasarımını, etkileşim prensiplerini ve kullanıcı deneyimi hedeflerini belirlemektedir. Amaç, sitenin estetik, tutarlı, sezgisel ve erişilebilir bir arayüze sahip olmasını sağlamaktır.

---

### 1. Tasarım Felsefesi ve Prensipleri

- **Minimalizm:** "Az, çoktur." prensibi benimsenecektir. Arayüz, gereksiz görsel unsurlardan arındırılmalı ve içeriğin öne çıkmasına izin vermelidir.
- **Netlik ve Okunabilirlik:** Tipografi, renk kontrastı ve boşluk kullanımı, metinlerin kolayca okunmasını ve anlaşılmasını sağlamalıdır.
- **Tutarlılık:** Arayüz elemanları (butonlar, formlar, kartlar), renkler ve tipografi, site genelinde tutarlı bir şekilde kullanılmalıdır. Bu, kullanıcının siteyi daha kolay öğrenmesini ve kullanmasını sağlar.
- **Sezgisellik:** Kullanıcılar, arayüzü nasıl kullanacaklarını düşünmeden, sezgisel olarak anlayabilmelidir. Etkileşimler, yaygın web standartlarına uygun olmalıdır.
- **Geri Bildirim (Feedback):** Kullanıcının her eylemi (buton tıklaması, form gönderimi vb.) anında görsel bir geri bildirimle yanıtlanmalıdır (örn: butonun durum değiştirmesi, yükleme animasyonu, başarı mesajı).
- **Kurallar** Shadow efekti kullanılmayacak. Border ince bir çizgi olacak border-1 kullanabilirsin. gray-200 olacak rengi koyu olmayacak. Gradient efektleri kesinlikle kullanılmayacak.
- **Animasyon** framer-motion paketi kullanılarak bileşenlere akıcılık kazandırılacak.

### 2. Renk Paleti

Renk paleti, profesyonellik, güven ve modern bir teknoloji hissi uyandırmalıdır.

- **Ana Renkler (Primary):**
  - **PrimaryColor:** `#000000` - Sistem genlinde ana renk olarak bu kullanılacak.
  - **SecondaryColor:** `#fca311` - Sistem genlinde ana renk olarak bu kullanılacak.
  - **DiğerRenkler:** - Sistem genelinde sayfa arkaplanları buton hariç component arkaplanları her zaman beyaz olacak.

### 3. Tipografi

Tipografi, sitenin okunabilirliğini ve hiyerarşisini belirleyen en önemli unsurlardan biridir.

- **Ana Font Ailesi (Gövde Metni):** **Inter** (Google Fonts)

  - **Neden:** Yüksek okunabilirliğe sahip, modern ve çok yönlü bir sans-serif fonttur. Farklı ekran boyutlarında ve çözünürlüklerde net bir görünüm sunar.

- **İkincil Font Ailesi (Başlıklar ve Kod):** **Fira Code** (Google Fonts)

  - **Neden:** Teknik ve modern bir görünüme sahip, programlama ligatürlerini (örn: `=>`, `!=`) destekleyen bir monospace fonttur. Başlıklar ve kod blokları için idealdir.

- **Font Boyutları ve Hiyerarşisi (Ölçek):**

  - `H1` (Ana Sayfa Başlığı): 48px
  - `H2` (Bölüm Başlıkları): 32px
  - `H3` (Alt Başlıklar): 24px
  - `Gövde Metni (Paragraf):` 16px
  - `Küçük Metin (Açıklamalar):` 14px

- **Satır Yüksekliği (Line Height):** Okunabilirliği artırmak için gövde metinlerinde `1.6` satır yüksekliği kullanılmalıdır.

### 4. Boşluk ve Izgara Sistemi (Layout & Spacing)

- **Izgara Sistemi (Grid):** Site, 12 sütunlu bir ızgara sistemi üzerine kurulacaktır. Ana içerik alanı, büyük ekranlarda maksimum `1200px` genişliğinde olacaktır. Bu, içeriğin çok geniş ekranlarda okunmasını zorlaştırmasını engeller.
- **Boşluk (Spacing):** Tutarlı bir boşluk sistemi kullanılacaktır. Tüm `margin` ve `padding` değerleri, 4px veya 8px tabanlı bir ölçekten türetilmelidir (örn: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px). Bu, tasarıma ritim ve düzen kazandırır.

### 5. Etkileşim Tasarımı (Interaction Design)

- **Hover Efektleri:** Fare ile üzerine gelinen tüm etkileşimli elemanlar (linkler, butonlar, kartlar) belirgin bir `hover` efektine sahip olmalıdır. Bu, genellikle rengin hafifçe açılması, bir alt çizgi belirmesi veya hafifçe yukarı kalkması şeklinde olabilir.
- **Focus Durumu:** Klavye ile gezinen kullanıcılar için `focus` durumu, `hover` durumundan daha belirgin olmalıdır. Genellikle elemanın etrafında belirgin bir dış çizgi (outline) ile sağlanır.
- **Animasyonlar:** Animasyonlar, kullanıcı deneyimini desteklemek için minimal ve amaca yönelik kullanılmalıdır. Sayfa geçişlerinde hafif bir `fade-in` efekti, menü açılışlarında yumuşak bir `slide-in` efekti gibi.

### 6. Web Erişilebilirliği (Accessibility - A11y)

Erişilebilirlik, bir seçenek değil, bir zorunluluktur.

- **Anlamsal HTML (Semantic HTML):** Her zaman doğru HTML etiketleri kullanılmalıdır (`<nav>`, `<main>`, `<article>`, `<aside>`, `<button>` vb.). Bu, ekran okuyucuların sayfayı doğru yorumlamasına yardımcı olur.
- **Görsel `alt` Metinleri:** Tüm `<img>` etiketleri, görselin içeriğini açıklayan bir `alt` metnine sahip olmalıdır. Dekoratif görseller için `alt=""` kullanılabilir.
- **Klavye Navigasyonu:** Sitedeki tüm etkileşimli elemanlara sadece klavye kullanılarak (Tab, Shift+Tab, Enter, Space) erişilebilmeli ve bu elemanlar kullanılabilmelidir.
- **Renk Kontrastı:** Metin ve arka plan renkleri arasındaki kontrast oranı, WCAG 2.1 AA seviyesini karşılamalıdır (Normal metin için en az 4.5:1, büyük metin için 3:1).
- **ARIA Rolleri:** Gerekli durumlarda (örn: özel olarak oluşturulmuş karmaşık bileşenler), ARIA (Accessible Rich Internet Applications) rolleri ve özellikleri, bileşenlerin amacını ve durumunu ekran okuyuculara bildirmek için kullanılmalıdır.

Bu kılavuz, projenin sadece işlevsel değil, aynı zamanda estetik, keyifli ve herkes tarafından kullanılabilir olmasını sağlayacaktır.
