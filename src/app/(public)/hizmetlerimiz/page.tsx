import SiteMetadata from "@/components/organisms/SiteMetadata";
import ServicesContainer from "@/containers/public/ServicesContainer";
import { seoConfigs } from "@/lib/seo";

export default function ServicesPage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.services} />
      <ServicesContainer />
    </>
  );
}
