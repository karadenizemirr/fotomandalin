import { Metadata } from "next";
import ServicesContainer from "@/containers/public/ServicesContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.services.title,
  description: pageMetadata.services.description,
  keywords: pageMetadata.services.keywords,
  url: "/hizmetlerimiz",
});

export default function ServicesPage() {
  return <ServicesContainer />;
}
