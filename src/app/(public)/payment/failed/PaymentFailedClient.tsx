"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Suspense } from "react";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Ödeme işlemi başarısız oldu";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Ödeme Başarısız
        </h2>
        <p className="text-gray-600 mb-6">{error}. Lütfen tekrar deneyiniz.</p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/rezervasyon")}
            className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Yeniden Dene
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
