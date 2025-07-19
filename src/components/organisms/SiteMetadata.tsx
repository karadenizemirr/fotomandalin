"use client";

import Head from "next/head";
import { useSiteSettingsWithDefaults } from "@/contexts/SiteSettingsContext";

interface SiteMetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile" | "video" | "music" | "book";
  pageType?: "website" | "article" | "product" | "profile";
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLanguages?: Array<{ lang: string; url: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  openingHours?: string[];
  priceRange?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  businessType?: "LocalBusiness" | "Organization" | "ProfessionalService";
  socialLinks?: string[];
  includeBusinessSchema?: boolean;
  customSchema?: any;
}

export default function SiteMetadata({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  pageType,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  locale = "tr_TR",
  alternateLanguages = [],
  breadcrumbs = [],
  openingHours = [],
  priceRange,
  telephone,
  address,
  geo,
  businessType = "ProfessionalService",
  socialLinks = [],
  includeBusinessSchema = false,
  customSchema,
}: SiteMetadataProps) {
  const {
    siteName,
    description: defaultDescription,
    siteUrl,
    metaTitle,
    metaDescription,
    metaKeywords,
    favicon: contextFavicon,
    logo: contextLogo,
    contactEmail,
    contactPhone,
    contactAddress,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    twitterUrl,
    linkedinUrl,
    isLoading,
  } = useSiteSettingsWithDefaults();

  // Don't render anything while loading to avoid hydration mismatch
  if (isLoading) {
    return null;
  }

  const pageTitle = title ? `${title} | ${siteName}` : metaTitle || siteName;
  const pageDescription = description || metaDescription || defaultDescription;
  const pageKeywords = keywords || metaKeywords;
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const finalTelephone = telephone || contactPhone;
  const finalAddress =
    address || (contactAddress ? { streetAddress: contactAddress } : undefined);
  const finalFavicon = contextFavicon;
  const finalLogo = contextLogo;

  // Combine site social links with passed social links
  const allSocialLinks = [
    ...socialLinks,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    twitterUrl,
    linkedinUrl,
  ].filter(Boolean);

  // Robots directive
  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
    "max-snippet:-1",
    "max-image-preview:large",
    "max-video-preview:-1",
  ].join(", ");

  // Generate structured data for business
  const generateBusinessSchema = () => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": businessType,
      name: siteName,
      description: pageDescription,
      url: siteUrl,
      logo: finalLogo ? `${siteUrl}${finalLogo}` : undefined,
      image: ogImage ? `${siteUrl}${ogImage}` : undefined,
      telephone: finalTelephone,
      email: contactEmail,
      priceRange: priceRange || "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "150",
        bestRating: "5",
        worstRating: "1",
      },
    };

    if (finalAddress) {
      schema.address = {
        "@type": "PostalAddress",
        streetAddress: finalAddress.streetAddress,
        addressLocality: finalAddress.addressLocality || "İstanbul",
        addressRegion: finalAddress.addressRegion || "İstanbul",
        postalCode: finalAddress.postalCode,
        addressCountry: finalAddress.addressCountry || "TR",
      };
    }

    if (geo) {
      schema.geo = {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      };
    }

    if (openingHours.length > 0) {
      schema.openingHours = openingHours;
    }

    if (allSocialLinks.length > 0) {
      schema.sameAs = allSocialLinks;
    }

    // Add services offered
    schema.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Fotoğrafçılık Hizmetleri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Düğün Fotoğrafçılığı",
            description: "Profesyonel düğün fotoğrafçılığı hizmetleri",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Nişan Çekimi",
            description: "Romantic nişan çekimi hizmetleri",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Aile Fotoğrafları",
            description: "Aile portreleri ve grup fotoğrafları",
          },
        },
      ],
    };

    return schema;
  };

  // Generate breadcrumb schema
  const generateBreadcrumbSchema = () => {
    if (breadcrumbs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    };
  };

  // Generate article schema for blog posts
  const generateArticleSchema = () => {
    if (ogType !== "article") return null;

    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageTitle,
      description: pageDescription,
      image: ogImage ? `${siteUrl}${ogImage}` : undefined,
      author: {
        "@type": "Person",
        name: author || siteName,
      },
      publisher: {
        "@type": "Organization",
        name: siteName,
        logo: {
          "@type": "ImageObject",
          url: finalLogo ? `${siteUrl}${finalLogo}` : undefined,
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": fullUrl,
      },
      articleSection: section,
      keywords: [
        ...(pageKeywords ? pageKeywords.split(",") : []),
        ...tags,
      ].join(","),
    };
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* SEO Meta Tags */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      <meta name="bingbot" content={robotsContent} />
      <meta name="language" content="tr" />
      <meta name="author" content={author || siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />

      {/* Article specific meta tags */}
      {ogType === "article" && publishedTime && (
        <meta name="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta name="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta name="article:author" content={author} />
      )}
      {ogType === "article" && section && (
        <meta name="article:section" content={section} />
      )}
      {ogType === "article" &&
        tags.length > 0 &&
        tags.map((tag) => <meta key={tag} name="article:tag" content={tag} />)}

      {/* Favicon and Icons */}
      {finalFavicon && <link rel="icon" href={finalFavicon} />}
      {finalFavicon && <link rel="shortcut icon" href={finalFavicon} />}
      {finalFavicon && <link rel="apple-touch-icon" href={finalFavicon} />}
      <link rel="manifest" href="/site.webmanifest" />

      {/* Canonical and Alternate URLs */}
      <link rel="canonical" href={fullUrl} />
      {alternateLanguages.map((alt) => (
        <link
          key={alt.lang}
          rel="alternate"
          hrefLang={alt.lang}
          href={alt.url}
        />
      ))}

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//connect.facebook.net" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {ogImage && <meta property="og:image" content={`${siteUrl}${ogImage}`} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {ogImage && <meta property="og:image:type" content="image/jpeg" />}
      {ogImage && <meta property="og:image:alt" content={pageTitle} />}

      {/* Facebook specific */}
      <meta property="fb:app_id" content="your-fb-app-id" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fotomandalin" />
      <meta name="twitter:creator" content="@fotomandalin" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {ogImage && (
        <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      )}
      {ogImage && <meta name="twitter:image:alt" content={pageTitle} />}

      {/* LinkedIn specific */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="627" />

      {/* WhatsApp specific */}
      <meta property="og:image:type" content="image/jpeg" />

      {/* Additional Performance and Security Headers */}
      <meta
        httpEquiv="Content-Security-Policy"
        content="upgrade-insecure-requests"
      />
      <meta name="referrer" content="strict-origin-when-cross-origin" />

      {/* Structured Data */}
      {includeBusinessSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBusinessSchema()),
          }}
        />
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateBreadcrumbSchema()),
          }}
        />
      )}

      {/* Article Schema */}
      {ogType === "article" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateArticleSchema()),
          }}
        />
      )}

      {/* Additional Rich Snippets for Photography Business */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: siteUrl,
            description: pageDescription,
            publisher: {
              "@type": "Organization",
              name: siteName,
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* FAQ Schema if needed */}
      {customSchema && customSchema["@type"] === "FAQPage" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(customSchema),
          }}
        />
      )}

      {/* Custom Schema */}
      {customSchema && customSchema["@type"] !== "FAQPage" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(customSchema),
          }}
        />
      )}
    </Head>
  );
}
