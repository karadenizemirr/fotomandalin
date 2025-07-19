import SiteMetadata from "@/components/organisms/SiteMetadata";
import ContactContainer from "@/containers/public/ContactContainer";
import { seoConfigs } from "@/lib/seo";

export default function ContactPage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.contact} />
      <ContactContainer />
    </>
  );
}
