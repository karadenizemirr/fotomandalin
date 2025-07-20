import { Metadata } from "next";
import PackageContainer from "@/containers/admin/PackageContainer";
import { generateMetadata as genMeta, adminMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: adminMetadata.packages.title,
  description: adminMetadata.packages.description,
  noIndex: adminMetadata.packages.noIndex,
});

export default function PackagePage() {
  return (
    <div>
      <PackageContainer />
    </div>
  );
}
