import SiteMetadata from "@/components/organisms/SiteMetadata";
import HomeContainer from "@/containers/HomeContainer";
import { seoConfigs } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.home} includeBusinessSchema={true} />
      <HomeContainer />
    </>
  );
}
