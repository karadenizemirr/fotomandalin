import { Metadata } from "next";
import SettingsContainer from "@/containers/admin/SettingsContainer";
import { generateMetadata as genMeta, adminMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: adminMetadata.settings.title,
  description: adminMetadata.settings.description,
  noIndex: adminMetadata.settings.noIndex,
});

export default function SettingsPage() {
  return (
    <div>
      <SettingsContainer />
    </div>
  );
}
