import { Metadata } from "next";
import GalleryContainer from "@/containers/admin/GalleryContainer";
import { generateMetadata as genMeta, adminMetadata } from "@/lib/metadata";
import {getPortfolios} from "@/server/trpc/server";

export const metadata: Metadata = genMeta({
  title: adminMetadata.gallery.title,
  description: adminMetadata.gallery.description,
  noIndex: adminMetadata.gallery.noIndex,
});

export default function GalleryPage() {

  const galleryData = getPortfolios();

  return (
    <div>
      <GalleryContainer />
    </div>
  );
}
