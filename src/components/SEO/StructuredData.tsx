import React from "react";

interface StructuredDataProps {
  data: any;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Predefined structured data schemas
export const schemas = {
  // LocalBusiness schema for main site
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Fotomandalin",
    description:
      "Profesyonel fotoğraf çekimi hizmetleri - Düğün, nişan, portre ve etkinlik fotoğrafçılığı",
    url: "https://fotomandalin.com",
    telephone: "+90-XXX-XXX-XXXX",
    email: "info@fotomandalin.com",
    image: "https://fotomandalin.com/images/logo.png",
    logo: "https://fotomandalin.com/images/logo.png",
    address: {
      "@type": "PostalAddress",
      addressCountry: "TR",
      addressLocality: "İstanbul",
      addressRegion: "İstanbul",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "41.0082",
      longitude: "28.9784",
    },
    openingHours: ["Mo-Sa 09:00-18:00"],
    priceRange: "₺₺",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
    sameAs: [
      "https://www.instagram.com/fotomandalin",
      "https://www.facebook.com/fotomandalin",
      "https://twitter.com/fotomandalin",
    ],
  },

  // Service schema
  service: (serviceName: string, description: string, price?: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description,
    provider: {
      "@type": "LocalBusiness",
      name: "Fotomandalin",
    },
    areaServed: {
      "@type": "City",
      name: "İstanbul",
    },
    ...(price && {
      offers: {
        "@type": "Offer",
        price: price,
        priceCurrency: "TRY",
      },
    }),
  }),

  // Product schema for packages
  product: (pkg: any) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    description: pkg.description,
    image: pkg.coverImage || pkg.images?.[0],
    brand: {
      "@type": "Brand",
      name: "Fotomandalin",
    },
    offers: {
      "@type": "Offer",
      price: pkg.discountPrice || pkg.basePrice,
      priceCurrency: pkg.currency || "TRY",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Fotomandalin",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "89",
    },
  }),

  // Article schema for blog posts
  article: (article: any) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      "@type": "Person",
      name: article.author || "Fotomandalin",
    },
    publisher: {
      "@type": "Organization",
      name: "Fotomandalin",
      logo: {
        "@type": "ImageObject",
        url: "https://fotomandalin.com/images/logo.png",
      },
    },
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url,
    },
  }),

  // WebSite schema with search action
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fotomandalin",
    url: "https://fotomandalin.com",
    description: "Profesyonel fotoğraf çekimi rezervasyon sistemi",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://fotomandalin.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },

  // BreadcrumbList schema
  breadcrumbs: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};

export default StructuredData;
