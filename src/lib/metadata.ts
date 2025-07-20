import { Metadata } from "next";

export const siteConfig = {
  name: "Fotoğraf Mandalin",
  description: "Profesyonel fotoğrafçılık hizmetleri - Düğün, nişan, doğum günü ve özel anlarınızı ölümsüzleştiriyoruz.",
  url: "https://fotomandalin.com",
  ogImage: "/og-image.jpg",
  keywords: "fotoğrafçı, düğün fotoğrafçısı, nişan fotoğrafçısı, doğum günü fotoğrafçısı, profesyonel fotoğraf, İstanbul fotoğrafçı",
  author: "Fotoğraf Mandalin",
  locale: "tr_TR",
  type: "website",
};

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
}

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  noIndex = false,
}: MetadataProps = {}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.ogImage;
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url;
  const metaKeywords = [...new Set([...siteConfig.keywords.split(", "), ...keywords])].join(", ");

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: siteConfig.author }],
    creator: siteConfig.author,
    openGraph: {
      type: type as any,
      locale: siteConfig.locale,
      url: metaUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: metaUrl,
    },
  };
}

// Specific page metadata
export const pageMetadata = {
  home: {
    title: "Ana Sayfa",
    description: "Profesyonel fotoğrafçılık hizmetleri ile özel anlarınızı ölümsüzleştiriyoruz. Düğün, nişan ve etkinlik fotoğrafçılığında uzman ekibimizle tanışın.",
    keywords: ["ana sayfa", "fotoğrafçı", "profesyonel fotoğraf"]
  },
  about: {
    title: "Hakkımızda",
    description: "Fotoğraf Mandalin olarak yıllardır profesyonel fotoğrafçılık hizmeti sunuyoruz. Deneyimli ekibimiz ve modern ekipmanlarımızla özel anlarınızı sanat eserine dönüştürüyoruz.",
    keywords: ["hakkımızda", "fotoğrafçı ekibi", "deneyim"]
  },
  services: {
    title: "Hizmetlerimiz",
    description: "Düğün fotoğrafçılığı, nişan çekimi, doğum günü fotoğrafları ve kurumsal etkinlik fotoğrafçılığı hizmetlerimizi keşfedin.",
    keywords: ["hizmetler", "düğün fotoğrafçılığı", "etkinlik fotoğrafçılığı"]
  },
  portfolio: {
    title: "Çalışmalarımız",
    description: "Geçmiş çalışmalarımızdan örnekleri inceleyin. Düğün, nişan ve özel etkinliklerden fotoğraf galerimizi görüntüleyin.",
    keywords: ["portfolio", "galeri", "örnekler", "çalışmalar"]
  },
  contact: {
    title: "İletişim",
    description: "Profesyonel fotoğraf çekimi için bizimle iletişime geçin. Randevu almak ve bilgi almak için iletişim bilgilerimizi kullanın.",
    keywords: ["iletişim", "randevu", "telefon", "adres"]
  },
  booking: {
    title: "Rezervasyon",
    description: "Online rezervasyon sistemi ile kolayca randevu alın. Uygun tarihleri görüntüleyin ve fotoğraf çekimi rezervasyonunuzu yapın.",
    keywords: ["rezervasyon", "randevu", "online rezervasyon"]
  },
  faq: {
    title: "Sıkça Sorulan Sorular",
    description: "Fotoğraf çekimi, fiyatlar ve hizmetlerimiz hakkında en çok sorulan soruların cevaplarını bulun.",
    keywords: ["sss", "sorular", "fiyatlar", "bilgiler"]
  },
  login: {
    title: "Giriş Yap",
    description: "Müşteri panelinize giriş yapın. Rezervasyonlarınızı görüntüleyin ve profil bilgilerinizi yönetin.",
    keywords: ["giriş", "müşteri paneli"],
    noIndex: true
  },
  register: {
    title: "Kayıt Ol",
    description: "Ücretsiz hesap oluşturun ve rezervasyon yapabilmek için sisteme kayıt olun.",
    keywords: ["kayıt", "üyelik"],
    noIndex: true
  },
  privacy: {
    title: "Gizlilik Politikası",
    description: "Kişisel verilerinizin güvenliği konusundaki yaklaşımımızı ve gizlilik politikamızı öğrenin.",
    keywords: ["gizlilik", "kişisel veriler", "güvenlik"]
  },
  terms: {
    title: "Kullanım Koşulları",
    description: "Web sitemizi kullanırken uymanız gereken koşullar ve kullanım şartlarını inceleyin.",
    keywords: ["kullanım koşulları", "şartlar", "sözleşme"]
  },
  cookies: {
    title: "Çerez Politikası",
    description: "Web sitemizde kullanılan çerezler hakkında bilgi alın ve çerez tercihlerinizi yönetin.",
    keywords: ["çerez", "cookies", "tercihler"]
  }
};

// Admin page metadata (no index for admin pages)
export const adminMetadata = {
  dashboard: {
    title: "Yönetim Paneli",
    description: "Admin dashboard",
    noIndex: true
  },
  gallery: {
    title: "Galeri Yönetimi",
    description: "Portfolio ve galeri yönetimi",
    noIndex: true
  },
  bookings: {
    title: "Rezervasyon Yönetimi",
    description: "Müşteri rezervasyonları yönetimi",
    noIndex: true
  },
  customers: {
    title: "Müşteri Yönetimi",
    description: "Müşteri bilgileri yönetimi",
    noIndex: true
  },
  packages: {
    title: "Paket Yönetimi",
    description: "Fotoğraf paketleri yönetimi",
    noIndex: true
  },
  settings: {
    title: "Ayarlar",
    description: "Sistem ayarları",
    noIndex: true
  }
};
