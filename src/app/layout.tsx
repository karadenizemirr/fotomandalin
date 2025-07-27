import { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { TrpcProvider } from "@/components/providers/trpcProvider";
import { SessionProvider } from "@/components/providers/sessionProvider";
import { ToastProvider } from "@/components/ui/toast";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { siteConfig } from "@/lib/metadata";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
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
  other: {
    "google-site-verification": "oa3WrMLgOtV74jmgbbPoXK1Da0ifL4KtTNnt8zbpLmI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <TrpcProvider>
        <SessionProvider>
          <SiteSettingsProvider>
            <body className={`${poppins.className} antialiased`}>
              <ToastProvider position="top-right">{children}</ToastProvider>
            </body>
          </SiteSettingsProvider>
        </SessionProvider>
      </TrpcProvider>
    </html>
  );
}
