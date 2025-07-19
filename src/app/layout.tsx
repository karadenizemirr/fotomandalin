import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TrpcProvider } from "@/components/providers/trpcProvider";
import { SessionProvider } from "@/components/providers/sessionProvider";
import { ToastProvider } from "@/components/ui/toast";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import SiteMetadata from "@/components/organisms/SiteMetadata";
import { seoConfigs } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <TrpcProvider>
        <SessionProvider>
          <SiteSettingsProvider>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
              <ToastProvider position="top-right">{children}</ToastProvider>
            </body>
          </SiteSettingsProvider>
        </SessionProvider>
      </TrpcProvider>
    </html>
  );
}
