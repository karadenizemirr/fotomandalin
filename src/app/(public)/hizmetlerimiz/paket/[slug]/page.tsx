import { Metadata } from "next";
import CategoryPackagesContainer from "@/containers/public/CategoryPackagesContainer";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.slug} Paketleri | Fotomandalin`,
    description: `${resolvedParams.slug} kategorisindeki profesyonel fotoğraf paketlerimizi keşfedin. En uygun fiyatlarla kaliteli hizmet.`,
  };
}

export default async function CategoryPackagesPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CategoryPackagesContainer slug={resolvedParams.slug} />;
}
