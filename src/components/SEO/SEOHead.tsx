import Head from "next/head";
import StructuredData, { schemas } from "./StructuredData";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: any;
  noIndex?: boolean;
  canonicalUrl?: string;
}

export default function SEOHead({
  title = "Fotomandalin - Profesyonel Fotoğraf Çekimi",
  description = "İstanbul'da profesyonel fotoğraf çekimi için online rezervasyon yapın.",
  keywords = [],
  image = "/images/og-default.jpg",
  url = "https://fotomandalin.com",
  type = "website",
  author = "Fotomandalin",
  publishedTime,
  modifiedTime,
  structuredData,
  noIndex = false,
  canonicalUrl,
}: SEOHeadProps) {
  const finalCanonicalUrl = canonicalUrl || url;
  const keywordsString = keywords.join(", ");
  const finalImage = image.startsWith("http")
    ? image
    : `https://fotomandalin.com${image}`;

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywordsString && <meta name="keywords" content={keywordsString} />}
        <meta name="author" content={author} />

        {/* Canonical URL */}
        <link rel="canonical" href={finalCanonicalUrl} />

        {/* Robots */}
        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta
            name="robots"
            content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          />
        )}

        {/* Open Graph */}
        <meta property="og:type" content={type} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={finalCanonicalUrl} />
        <meta property="og:site_name" content="Fotomandalin" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:image" content={finalImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={title} />
        {publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@fotomandalin" />
        <meta name="twitter:creator" content="@fotomandalin" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={finalImage} />

        {/* Additional Meta Tags */}
        <meta name="application-name" content="Fotomandalin" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Fotomandalin" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        {/* Viewport and Mobile */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Preload Critical Resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
      </Head>

      {/* Structured Data */}
      {structuredData && <StructuredData data={structuredData} />}

      {/* Default Website Schema */}
      {!structuredData && type === "website" && (
        <StructuredData data={schemas.website} />
      )}
    </>
  );
}

// Hook for easier usage
export function useSEO(props: SEOHeadProps) {
  return <SEOHead {...props} />;
}
