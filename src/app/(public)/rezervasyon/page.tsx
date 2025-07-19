import SiteMetadata from "@/components/organisms/SiteMetadata";
import BookingContainer from "@/containers/public/BookingContainer";
import { seoConfigs } from "@/lib/seo";

export default function UserBookingPage() {
  return (
    <>
      <SiteMetadata {...seoConfigs.booking} />
      <BookingContainer />
    </>
  );
}
