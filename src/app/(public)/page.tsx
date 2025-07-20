import { Metadata } from "next";
import HomeContainer from "@/containers/HomeContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.home.title,
  description: pageMetadata.home.description,
  keywords: pageMetadata.home.keywords,
  url: "/",
});

export default function HomePage() {
  return <HomeContainer />;
}
