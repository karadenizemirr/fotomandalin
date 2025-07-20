import { Metadata } from "next";
import BookingDetailContainer from "@/containers/account/BookingDetailContainer";
import { generateMetadata as genMeta } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return genMeta({
    title: `Rezervasyon Detayı - #${resolvedParams.id}`,
    description: "Rezervasyon detaylarınızı görüntüleyin ve yönetin.",
    noIndex: true,
    url: `/rezervasyon/${resolvedParams.id}`,
  });
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BookingDetailContainer bookingId={resolvedParams.id} />;
}
