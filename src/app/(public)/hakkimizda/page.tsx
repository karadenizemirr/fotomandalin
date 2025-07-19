import SiteMetadata from "@/components/organisms/SiteMetadata";
import AboutContainer from "@/containers/public/AboutContainer";
import { seoConfigs } from "@/lib/seo";

export default function AboutPage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.about} />
      <AboutContainer />
    </>
  );
}
