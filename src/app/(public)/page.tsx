import { Metadata } from "next";
import HomeContainer from "@/containers/HomeContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";
import { serverClient } from "@/server/trpc/serverClient";

export const metadata: Metadata = genMeta({
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  url: "/",
});

// Decimal değerlerini string'e dönüştürme helper fonksiyonu
function serializeDecimalFields(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(serializeDecimalFields);
  }

  if (typeof data === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Decimal alanlarını string'e dönüştür
      if (value && typeof value === 'object' && 'toString' in value &&
          (key.includes('Price') || key.includes('price') || key === 'basePrice' || key === 'discountPrice')) {
        serialized[key] = value.toString();
      } else if (typeof value === 'object') {
        serialized[key] = serializeDecimalFields(value);
      } else {
        serialized[key] = value;
      }
    }
    return serialized;
  }

  return data;
}

export default async function HomePage() {
  // Server-side tRPC ile veri çekme
  let categoriesData = null;
  let portfolio = null;

  try {
    const client = await serverClient();

    // Service Categories verilerini çekme (client-side yerine server-side)
    const rawCategoriesData = await client.serviceCategory.list({
      includeInactive: false,
      limit: 8, // Homepage için 8 kategori limiti
    });

    // Decimal değerlerini serialize et
    categoriesData = serializeDecimalFields(rawCategoriesData);

    const rawPortfolio = await  client.portfolio.list({
      limit:4,
    })

  } catch (error) {
    console.error('❌ Server-side veri çekme hatası:', error);
    categoriesData = null;
  }

  // Verileri HomeContainer'a props olarak geçirme (Decimal sorunu çözüldü)
  return (
    <HomeContainer
      categoriesData={categoriesData}
      categoriesLoading={false} // Server-side'da loading yok
      categoriesError={categoriesData === null ? new Error('Veri çekilemedi') : null}
      portfolioData = {portfolio}
      portfolioIsLoading={false}
    />
  );
}