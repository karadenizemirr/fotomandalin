import { Metadata } from "next";
import PortfolioContainer from "@/containers/public/PortfolioContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.portfolio.title,
  description: pageMetadata.portfolio.description,
  keywords: pageMetadata.portfolio.keywords,
  url: "/calismalarimiz",
});

export default function PortfolioPage() {
  return <PortfolioContainer />;
}
