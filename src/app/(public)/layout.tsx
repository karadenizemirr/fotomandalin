import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import FooterComponent from "@/components/organisms/footer/Footer";
import Topbar from "@/components/organisms/navbar/topbar";
import type { Metadata } from "next";

// import Footer from "@/components/organisms/footer/footer"; // TODO: Footer komponenti oluşturulacak

export const metadata: Metadata = {
  title: {
    default: "Fotomandalin - Profesyonel Fotoğrafçılık Hizmetleri",
    template: "%s | Fotomandalin",
  },
  description:
    "Düğün, nişan, bebek ve aile fotoğrafçılığında uzman. Anılarınızı ölümsüzleştirmek için profesyonel fotoğrafçılık hizmetleri.",
  keywords: [
    "fotoğrafçı",
    "düğün fotoğrafçılığı",
    "nişan fotoğrafçılığı",
    "bebek fotoğrafçılığı",
    "aile fotoğrafçılığı",
    "kurumsal fotoğrafçılık",
    "profesyonel fotoğraf",
    "rezervasyon",
  ],
  authors: [{ name: "Fotomandalin" }],
  creator: "Fotomandalin",
  publisher: "Fotomandalin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fotomandalin.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://fotomandalin.com",
    siteName: "Fotomandalin",
    title: "Fotomandalin - Profesyonel Fotoğrafçılık Hizmetleri",
    description:
      "Düğün, nişan, bebek ve aile fotoğrafçılığında uzman. Anılarınızı ölümsüzleştirmek için profesyonel fotoğrafçılık hizmetleri.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fotomandalin - Profesyonel Fotoğrafçılık",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fotomandalin - Profesyonel Fotoğrafçılık Hizmetleri",
    description:
      "Düğün, nişan, bebek ve aile fotoğrafçılığında uzman. Anılarınızı ölümsüzleştirmek için profesyonel fotoğrafçılık hizmetleri.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-black text-white px-4 py-2 z-50 rounded-br-md"
      >
        Ana içeriğe geç
      </a>
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white">
        <ConditionalNavbar />
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 focus:outline-none"
        tabIndex={-1}
      >
        <div className="min-h-full container mx-auto px-4 sm:px-6 lg:px-8 mt-2 ">
          {children}
        </div>
      </main>
      <FooterComponent />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Fotomandalin",
            description:
              "Profesyonel fotoğrafçılık hizmetleri - Düğün, nişan, bebek ve aile fotoğrafçılığı",
            url: "https://fotomandalin.com",
            telephone: "+90-XXX-XXX-XXXX",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Adres Bilgisi",
              addressLocality: "Şehir",
              addressRegion: "Bölge",
              postalCode: "XXXXX",
              addressCountry: "TR",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "XX.XXXXX",
              longitude: "XX.XXXXX",
            },
            openingHours: ["Mo-Sa 09:00-18:00"],
            priceRange: "$$",
            image: "https://fotomandalin.com/logo.jpg",
            sameAs: [
              "https://www.instagram.com/fotomandalin",
              "https://www.facebook.com/fotomandalin",
            ],
            serviceArea: {
              "@type": "City",
              name: "Şehir Adı",
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
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Nişan Fotoğrafçılığı",
                    description: "Romantik nişan fotoğrafçılığı hizmetleri",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Bebek Fotoğrafçılığı",
                    description: "Bebek ve çocuk fotoğrafçılığı hizmetleri",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Aile Fotoğrafçılığı",
                    description: "Aile portreleri ve fotoğrafçılık hizmetleri",
                  },
                },
              ],
            },
          }),
        }}
      />
    </div>
  );
}
