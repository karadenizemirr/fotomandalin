import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
}

const defaultMetadata = {
  title: 'Fotomandalin - Profesyonel Fotoğraf Çekimi Rezervasyon Sistemi',
  description: 'İstanbul\'da profesyonel fotoğraf çekimi için online rezervasyon yapın. Düğün, nişan, doğum günü, kurumsal etkinlik ve portre fotoğrafçılığı hizmetleri.',
  keywords: [
    'fotoğraf çekimi',
    'profesyonel fotoğrafçı',
    'düğün fotoğrafçısı',
    'İstanbul fotoğrafçı',
    'fotoğraf rezervasyon',
    'portre fotoğrafçılığı',
    'etkinlik fotoğrafçısı',
    'nişan fotoğrafı',
    'doğum günü fotoğrafı',
    'kurumsal fotoğraf'
  ],
  siteUrl: 'https://fotomandalin.com',
  siteName: 'Fotomandalin',
  locale: 'tr_TR',
  author: 'Fotomandalin',
  twitterHandle: '@fotomandalin',
  facebookPage: 'fotomandalin',
  instagramHandle: '@fotomandalin'
}

export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}: SEOProps = {}): Metadata {
  const seoTitle = title 
    ? `${title} | ${defaultMetadata.siteName}`
    : defaultMetadata.title

  const seoDescription = description || defaultMetadata.description
  const seoKeywords = [...defaultMetadata.keywords, ...keywords]
  const seoUrl = url || defaultMetadata.siteUrl
  const seoImage = image || `${defaultMetadata.siteUrl}/images/og-default.jpg`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(', '),
    authors: [{ name: author || defaultMetadata.author }],
    creator: defaultMetadata.author,
    publisher: defaultMetadata.author,
    
    // Open Graph
    openGraph: {
      type,
      locale: defaultMetadata.locale,
      url: seoUrl,
      siteName: defaultMetadata.siteName,
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: seoImage,
          width: 1200,
          height: 630,
          alt: seoTitle,
        }
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: defaultMetadata.twitterHandle,
      creator: defaultMetadata.twitterHandle,
      title: seoTitle,
      description: seoDescription,
      images: [seoImage],
    },

    // Additional metadata
    alternates: {
      canonical: seoUrl,
      languages: {
        'tr-TR': seoUrl,
      },
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Additional tags
    other: {
      'fb:app_id': '123456789', // Facebook App ID eklenecek
      'application-name': defaultMetadata.siteName,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': defaultMetadata.siteName,
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#000000',
      'msapplication-tap-highlight': 'no',
      'theme-color': '#000000',
    },
  }
}

// Sayfa tipine göre önceden tanımlanmış SEO ayarları
export const seoPresets = {
  home: {
    title: 'Ana Sayfa',
    description: 'Profesyonel fotoğraf çekimi hizmetleri. Online rezervasyon yapın ve unutulmaz anlarınızı ölümsüzleştirin.',
    keywords: ['ana sayfa', 'fotoğraf hizmetleri', 'online rezervasyon']
  },
  
  packages: {
    title: 'Fotoğraf Paketleri',
    description: 'Farklı bütçelere uygun fotoğraf çekim paketlerini keşfedin. Düğün, nişan, portre ve etkinlik paketleri.',
    keywords: ['fotoğraf paketleri', 'çekim paketleri', 'fiyatlar']
  },
  
  gallery: {
    title: 'Galeri',
    description: 'Çektiğimiz fotoğraflara göz atın. Düğün, nişan, portre ve etkinlik fotoğraflarından örnekler.',
    keywords: ['fotoğraf galerisi', 'örnek çalışmalar', 'portfolyo']
  },
  
  about: {
    title: 'Hakkımızda',
    description: 'Fotomandalin ekibi ve hikayemiz. Profesyonel fotoğrafçılık deneyimimiz ve misyonumuz.',
    keywords: ['hakkımızda', 'fotoğrafçı', 'deneyim', 'misyon']
  },
  
  contact: {
    title: 'İletişim',
    description: 'Bizimle iletişime geçin. Fotoğraf çekimi rezervasyonu için arayın veya mesaj gönderin.',
    keywords: ['iletişim', 'telefon', 'adres', 'randevu']
  },
  
  booking: {
    title: 'Rezervasyon',
    description: 'Online fotoğraf çekimi rezervasyonu yapın. Tarih seçin, paket belirleyin ve hemen rezerve edin.',
    keywords: ['rezervasyon', 'randevu', 'online booking', 'tarih seçimi']
  }
}

export const seoConfigs = {
  home: {
    title: "Profesyonel Fotoğrafçılık Hizmetleri | Fotoğraf Mandalin",
    description: "Düğün, nişan, doğum günü ve özel anlarınızı profesyonel fotoğrafçılık hizmetleri ile ölümsüzleştiriyoruz. İstanbul'da güvenilir fotoğrafçı.",
    keywords: "fotoğrafçı, düğün fotoğrafçısı, profesyonel fotoğraf, İstanbul fotoğrafçı, nişan fotoğrafçısı, etkinlik fotoğrafçısı",
    ogImage: "/images/home-og.jpg",
    canonical: "/",
    schema: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Fotoğraf Mandalin",
      "description": "Profesyonel fotoğrafçılık hizmetleri",
      "image": "/images/logo.png",
      "telephone": "+90-XXX-XXX-XXXX",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR",
        "addressLocality": "İstanbul"
      }
    }
  },
  about: {
    title: "Hakkımızda - Profesyonel Fotoğrafçı Ekibi | Fotoğraf Mandalin",
    description: "Yıllardır profesyonel fotoğrafçılık hizmeti sunan deneyimli ekibimizle tanışın. Modern ekipmanlar ve yaratıcı bakış açısı ile özel anlarınızı sanat eserine dönüştürüyoruz.",
    keywords: "hakkımızda, fotoğrafçı ekibi, deneyimli fotoğrafçı, profesyonel fotoğraf çekimi",
    canonical: "/hakkimizda"
  },
  services: {
    title: "Hizmetlerimiz - Fotoğraf Çekimi Paketleri | Fotoğraf Mandalin",
    description: "Düğün, nişan, doğum günü, kurumsal etkinlik ve özel günler için profesyonel fotoğraf çekimi hizmetleri. Uygun fiyatlı paketlerimizi keşfedin.",
    keywords: "hizmetler, düğün fotoğrafçılığı, nişan çekimi, doğum günü fotoğrafları, kurumsal fotoğraf",
    canonical: "/hizmetlerimiz"
  },
  portfolio: {
    title: "Çalışmalarımız - Fotoğraf Galerisi | Fotoğraf Mandalin",
    description: "Düğün, nişan ve özel etkinliklerden çektiğimiz fotoğraf örneklerini inceleyin. Profesyonel fotoğrafçılık hizmetlerimizin kalitesini görün.",
    keywords: "portfolio, galeri, fotoğraf örnekleri, düğün fotoğrafları, çalışmalar",
    canonical: "/calismalarimiz"
  },
  contact: {
    title: "İletişim - Randevu Al | Fotoğraf Mandalin",
    description: "Profesyonel fotoğraf çekimi için bizimle iletişime geçin. Telefon, e-posta veya online form ile randevu alabilirsiniz.",
    keywords: "iletişim, randevu, telefon, adres, konum, fotoğraf çekimi randevusu",
    canonical: "/iletisim"
  },
  booking: {
    title: "Online Rezervasyon - Randevu Al | Fotoğraf Mandalin", 
    description: "Müsait tarihleri görüntüleyin ve online rezervasyon sistemi ile kolayca fotoğraf çekimi randevusu alın.",
    keywords: "rezervasyon, online randevu, müsait tarih, fotoğraf çekimi rezervasyonu",
    canonical: "/rezervasyon"
  },
  faq: {
    title: "Sıkça Sorulan Sorular - SSS | Fotoğraf Mandalin",
    description: "Fotoğraf çekimi, fiyatlandırma, süreç ve hizmetlerimiz hakkında en çok merak edilen soruların cevaplarını bulun.",
    keywords: "sss, sıkça sorulan sorular, fotoğraf çekimi soruları, fiyat, süreç",
    canonical: "/faq"
  },
  login: {
    title: "Müşteri Girişi | Fotoğraf Mandalin",
    description: "Müşteri panelinize giriş yapın, rezervasyonlarınızı görüntüleyin ve profil bilgilerinizi yönetin.",
    canonical: "/giris-yap",
    noindex: true
  },
  register: {
    title: "Üyelik | Fotoğraf Mandalin",
    description: "Ücretsiz hesap oluşturun ve rezervasyon yapabilmek için sisteme kayıt olun.",
    canonical: "/kayit-ol",
    noindex: true
  },
  privacy: {
    title: "Gizlilik Politikası | Fotoğraf Mandalin",
    description: "Kişisel verilerinizin korunması ve gizlilik politikamız hakkında detaylı bilgiler.",
    keywords: "gizlilik politikası, kişisel veriler, veri güvenliği, KVKK",
    canonical: "/privacy"
  },
  terms: {
    title: "Kullanım Koşulları | Fotoğraf Mandalin",
    description: "Web sitemizi kullanırken uymanız gereken koşullar ve kullanım şartları.",
    keywords: "kullanım koşulları, şartlar, web sitesi kuralları",
    canonical: "/terms"
  },
  cookies: {
    title: "Çerez Politikası | Fotoğraf Mandalin",
    description: "Web sitemizde kullanılan çerezler hakkında bilgi ve çerez tercihlerinizi yönetme rehberi.",
    keywords: "çerez politikası, cookies, web sitesi çerezleri",
    canonical: "/cookies"
  }
};
