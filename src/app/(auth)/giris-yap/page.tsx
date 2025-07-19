import LoginContainer from "@/containers/auth/LoginContainer";
import { Suspense } from "react";

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
