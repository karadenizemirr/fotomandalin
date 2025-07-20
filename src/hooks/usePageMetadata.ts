"use client";

import { useEffect } from "react";

interface UsePageMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export function usePageMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
}: UsePageMetadataProps) {
  useEffect(() => {
    // Update document title if title is provided
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
    
    // Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }
    
    // Update canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', window.location.origin + canonicalUrl);
      }
    }
  }, [title, description, keywords, ogImage, canonicalUrl]);
}

// Utility function for generating structured data
export function generateStructuredData(type: string, data: any) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify({
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  });
  
  // Remove existing structured data of the same type
  const existingScript = document.querySelector(`script[type="application/ld+json"]`);
  if (existingScript) {
    existingScript.remove();
  }
  
  document.head.appendChild(script);
}

// Predefined metadata configurations
export const pageMetadataConfigs = {
  home: {
    title: "Ana Sayfa",
    description: "Profesyonel fotoğrafçılık hizmetleri ile özel anlarınızı ölümsüzleştirin",
    keywords: "fotoğrafçı, düğün fotoğrafı, portre, profesyonel fotoğraf",
    canonicalUrl: "/",
  },
  about: {
    title: "Hakkımızda",
    description: "Yılların deneyimi ile profesyonel fotoğrafçılık hizmetleri sunuyoruz",
    keywords: "hakkımızda, fotoğrafçı, deneyim, profesyonel",
    canonicalUrl: "/about",
  },
  services: {
    title: "Hizmetlerimiz",
    description: "Düğün, nişan, aile ve portre fotoğrafçılığı hizmetlerimizi keşfedin",
    keywords: "hizmetler, düğün fotoğrafı, nişan çekimi, aile fotoğrafı",
    canonicalUrl: "/services",
  },
  portfolio: {
    title: "Portfolyo",
    description: "Çektiğimiz en güzel anıları portfolyomuzda inceleyin",
    keywords: "portfolyo, fotoğraf galerisi, çalışmalar",
    canonicalUrl: "/portfolio",
  },
  booking: {
    title: "Rezervasyon",
    description: "Fotoğraf çekimi için hemen rezervasyon yapın",
    keywords: "rezervasyon, randevu, fotoğraf çekimi",
    canonicalUrl: "/booking",
  },
  contact: {
    title: "İletişim",
    description: "Bizimle iletişime geçin, sorularınızı yanıtlayalım",
    keywords: "iletişim, telefon, adres, email",
    canonicalUrl: "/contact",
  },
};
