import { Metadata } from "next";
import BookingContainer from "@/containers/public/BookingContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.booking.title,
  description: pageMetadata.booking.description,
  keywords: pageMetadata.booking.keywords,
  url: "/rezervasyon",
});

export default function UserBookingPage() {
  return <BookingContainer />;
}
