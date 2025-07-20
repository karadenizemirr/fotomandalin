import { Metadata } from "next";
import AboutContainer from "@/containers/public/AboutContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.about.title,
  description: pageMetadata.about.description,
  keywords: pageMetadata.about.keywords,
  url: "/hakkimizda",
});

export default function AboutPage() {
  return <AboutContainer />;
}
