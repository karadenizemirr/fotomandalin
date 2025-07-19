import SiteMetadata from "@/components/organisms/SiteMetadata";
import PortfolioContainer from "@/containers/public/PortfolioContainer";
import { seoConfigs } from "@/lib/seo";

export default function PortfolioPage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.portfolio} />
      <PortfolioContainer />
    </>
  );
}
