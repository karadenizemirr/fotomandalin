import BookingDetailContainer from "@/containers/account/BookingDetailContainer";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BookingDetailContainer bookingId={resolvedParams.id} />;
}
