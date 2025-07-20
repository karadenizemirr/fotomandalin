import { Metadata } from "next";
import CustomerContainer from "@/containers/admin/CustomerContainer";
import { generateMetadata as genMeta, adminMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: adminMetadata.customers.title,
  description: adminMetadata.customers.description,
  noIndex: adminMetadata.customers.noIndex,
});

export default function CustomerPage() {
  return (
    <div>
      <CustomerContainer />
    </div>
  );
}
