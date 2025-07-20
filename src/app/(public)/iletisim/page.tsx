import { Metadata } from "next";
import ContactContainer from "@/containers/public/ContactContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.contact.title,
  description: pageMetadata.contact.description,
  keywords: pageMetadata.contact.keywords,
  url: "/iletisim",
});

export default function ContactPage() {
  return <ContactContainer />;
}
