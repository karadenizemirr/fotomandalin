import { Metadata } from "next";
import HomeContainer from "@/containers/HomeContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";
import { getHomepageData } from "@/server/trpc/server";

export const metadata: Metadata = genMeta({
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  url: "/",
});

export default async function HomePage() {
  // Merkezi veri çekme sistemi - tek fonksiyon ile tüm homepage verileri
  const homepageData = await getHomepageData();

  return (
    <HomeContainer
      categoriesData={homepageData.categories}
      categoriesLoading={false} // Server-side'da loading yok
      categoriesError={homepageData.categories === null ? new Error('Kategori verileri çekilemedi') : null}
      portfolioData={homepageData.portfolios}
      portfolioIsLoading={false} // Server-side'da loading yok
      announcementsData={homepageData.announcements}
      systemSettings={homepageData.systemSettings}
      fetchMeta={homepageData.meta}
    />
  );
}