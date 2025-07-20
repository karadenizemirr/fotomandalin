import { Metadata } from "next";
import LoginContainer from "@/containers/auth/LoginContainer";
import { generateMetadata as genMeta, pageMetadata } from "@/lib/metadata";
import { Suspense } from "react";

export const metadata: Metadata = genMeta({
  title: pageMetadata.login.title,
  description: pageMetadata.login.description,
  keywords: pageMetadata.login.keywords,
  url: "/giris-yap",
  noIndex: pageMetadata.login.noIndex,
});

function LoginPageContent() {
  return (
    <div>
      <LoginContainer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Yükleniyor...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
