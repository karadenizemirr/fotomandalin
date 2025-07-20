import { Metadata } from "next";
import DashboardContainer from "@/containers/admin/DashboardContainer";
import { generateMetadata as genMeta, adminMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: adminMetadata.dashboard.title,
  description: adminMetadata.dashboard.description,
  noIndex: adminMetadata.dashboard.noIndex,
});

export default function DashboardPage() {
  return (
    <div>
      <DashboardContainer />
    </div>
  );
}
