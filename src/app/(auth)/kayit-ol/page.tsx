import { Metadata } from "next";
import RegisterContainer from "@/containers/auth/RegisterContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = genMeta({
  title: pageMetadata.register.title,
  description: pageMetadata.register.description,
  keywords: pageMetadata.register.keywords,
  url: "/kayit-ol",
  noIndex: pageMetadata.register.noIndex,
});

export default function RegisterPage() {
  return (
    <div>
      <RegisterContainer />
    </div>
  );
}
