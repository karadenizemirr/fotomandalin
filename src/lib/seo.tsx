import SiteMetadata from "@/components/organisms/SiteMetadata";

// Predefined metadata configurations for different page types
export const seoConfigs = {
  // Homepage
  home: {
    title: "Ana Sayfa",
    description:
      "Profesyonel fotoğrafçılık hizmetleri ile özel anlarınızı ölümsüzleştirin. Düğün, nişan, aile ve portre fotoğrafçılığı.",
    keywords:
      "fotoğrafçı, düğün fotoğrafı, portre, profesyonel fotoğraf, İstanbul fotoğrafçı, nişan çekimi, aile fotoğrafı",
    ogImage: "/images/og-home.jpg",
    canonicalUrl: "/",
    breadcrumbs: [],
    openingHours: ["Mo-Su 09:00-22:00"],
    priceRange: "$$",
    address: {
      streetAddress: "Ataşehir",
      addressLocality: "İstanbul",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
  },

  // About page
  about: {
    title: "Hakkımızda - Profesyonel Fotoğrafçılık",
    description:
      "10 yılı aşkın deneyimimiz ile profesyonel fotoğrafçılık hizmetleri sunuyoruz. Ekibimiz ve çalışma felsefemizi keşfedin.",
    keywords: "hakkımızda, fotoğrafçı, deneyim, profesyonel, ekip, felsefe",
    ogImage: "/images/og-about.jpg",
    canonicalUrl: "/about",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Hakkımızda", url: "/about" },
    ],
  },

  // Services page
  services: {
    title: "Hizmetlerimiz - Fotoğrafçılık Paketleri",
    description:
      "Düğün, nişan, aile ve portre fotoğrafçılığı hizmetlerimizi keşfedin. Her bütçeye uygun paket seçenekleri.",
    keywords:
      "hizmetler, düğün fotoğrafı, nişan çekimi, aile fotoğrafı, portre, paket, fiyat",
    ogImage: "/images/og-services.jpg",
    canonicalUrl: "/services",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Hizmetlerimiz", url: "/services" },
    ],
  },

  // Portfolio page
  portfolio: {
    title: "Portfolyo - Çalışma Örnekleri",
    description:
      "Çektiğimiz en güzel anıları portfolyomuzda inceleyin. Düğün, nişan ve aile fotoğrafları galerimiz.",
    keywords:
      "portfolyo, fotoğraf galerisi, çalışmalar, düğün fotoğrafları, nişan fotoğrafları",
    ogImage: "/images/og-portfolio.jpg",
    canonicalUrl: "/portfolio",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Portfolyo", url: "/portfolio" },
    ],
  },

  // Booking page
  booking: {
    title: "Rezervasyon - Randevu Al",
    description:
      "Fotoğraf çekimi için hemen rezervasyon yapın. Online randevu sistemi ile kolayca tarih seçin.",
    keywords:
      "rezervasyon, randevu, fotoğraf çekimi, online rezervasyon, tarih seçimi",
    ogImage: "/images/og-booking.jpg",
    canonicalUrl: "/booking",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Rezervasyon", url: "/booking" },
    ],
  },

  // Contact page
  contact: {
    title: "İletişim - Bize Ulaşın",
    description:
      "Bizimle iletişime geçin, sorularınızı yanıtlayalım. Adres, telefon ve iletişim formu bilgileri.",
    keywords: "iletişim, telefon, adres, email, lokasyon, harita, ulaşım",
    ogImage: "/images/og-contact.jpg",
    canonicalUrl: "/contact",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "İletişim", url: "/contact" },
    ],
  },
};

// Dynamic SEO configurations for different content types
export const generateSEOConfig = {
  // Wedding photography service page
  weddingService: (slug: string) => ({
    title: "Düğün Fotoğrafçılığı - Profesyonel Çekim",
    description:
      "Hayatınızın en özel gününü profesyonel düğün fotoğrafçılığı ile ölümsüzleştirin. Modern ve klasik tarzda çekim seçenekleri.",
    keywords:
      "düğün fotoğrafı, gelin damat, düğün çekimi, düğün albümü, profesyonel düğün fotoğrafçısı",
    ogImage: "/images/wedding-hero.jpg",
    canonicalUrl: `/services/${slug}`,
    ogType: "article" as const,
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Hizmetlerimiz", url: "/services" },
      { name: "Düğün Fotoğrafçılığı", url: `/services/${slug}` },
    ],
  }),

  // Blog post
  blogPost: (post: {
    title: string;
    excerpt: string;
    slug: string;
    tags: string[];
    publishedAt: string;
    updatedAt?: string;
    author?: string;
  }) => ({
    title: post.title,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    ogImage: `/images/blog/${post.slug}-og.jpg`,
    canonicalUrl: `/blog/${post.slug}`,
    ogType: "article" as const,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt,
    author: post.author,
    tags: post.tags,
    section: "Blog",
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${post.slug}` },
    ],
  }),

  // Service category page
  serviceCategory: (category: {
    name: string;
    description: string;
    slug: string;
  }) => ({
    title: `${category.name} - Profesyonel Fotoğrafçılık`,
    description: category.description,
    keywords: `${category.name.toLowerCase()}, fotoğraf, çekim, profesyonel, İstanbul`,
    ogImage: `/images/services/${category.slug}-og.jpg`,
    canonicalUrl: `/services/${category.slug}`,
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Hizmetlerimiz", url: "/services" },
      { name: category.name, url: `/services/${category.slug}` },
    ],
  }),

  // Gallery/Portfolio category
  portfolioCategory: (category: {
    name: string;
    description?: string;
    slug: string;
  }) => ({
    title: `${category.name} Fotoğrafları - Portfolyo`,
    description:
      category.description ||
      `${category.name} kategorisindeki çalışma örneklerimizi inceleyin.`,
    keywords: `${category.name.toLowerCase()}, portfolyo, fotoğraf galerisi, örnekler`,
    ogImage: `/images/portfolio/${category.slug}-og.jpg`,
    canonicalUrl: `/portfolio/${category.slug}`,
    breadcrumbs: [
      { name: "Ana Sayfa", url: "/" },
      { name: "Portfolyo", url: "/portfolio" },
      { name: category.name, url: `/portfolio/${category.slug}` },
    ],
  }),
};

// Utility function to generate schema for different business types
export const generateBusinessSchema = (businessInfo: {
  name: string;
  description: string;
  url: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  address?: any;
  geo?: { latitude: number; longitude: number };
  openingHours?: string[];
  priceRange?: string;
  socialLinks?: string[];
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": businessInfo.url,
    name: businessInfo.name,
    description: businessInfo.description,
    url: businessInfo.url,
    logo: businessInfo.logo,
    image: businessInfo.image,
    telephone: businessInfo.telephone,
    email: businessInfo.email,
    address: businessInfo.address,
    geo: businessInfo.geo,
    openingHours: businessInfo.openingHours,
    priceRange: businessInfo.priceRange,
    sameAs: businessInfo.socialLinks,
    serviceType: "Photography Services",
    areaServed: {
      "@type": "City",
      name: "İstanbul",
      "@id": "https://en.wikipedia.org/wiki/Istanbul",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Fotoğrafçılık Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Düğün Fotoğrafçılığı",
            description: "Profesyonel düğün fotoğrafçılığı hizmetleri",
            provider: {
              "@type": "ProfessionalService",
              name: businessInfo.name,
            },
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Nişan Çekimi",
            description: "Romantik nişan çekimi hizmetleri",
            provider: {
              "@type": "ProfessionalService",
              name: businessInfo.name,
            },
          },
        },
        {
          "@type": "Service",
          name: "Aile Fotoğrafları",
          description: "Aile portreleri ve grup fotoğrafları",
          provider: {
            "@type": "ProfessionalService",
            name: businessInfo.name,
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
  };
};

// Export the main component with predefined configs
export { SiteMetadata };
export default SiteMetadata;
