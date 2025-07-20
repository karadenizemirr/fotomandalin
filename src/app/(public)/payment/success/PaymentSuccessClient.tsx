"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams?.get("token");
    const status = searchParams?.get("status");

    if (!token) {
      setError("Token bulunamadı");
      setIsProcessing(false);
      return;
    }

    // Simply check status from URL params
    if (status === "success") {
      setIsProcessing(false);
    } else {
      setError("Ödeme başarısız");
      setIsProcessing(false);
    }
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ödeme Kontrol Ediliyor...
            </h1>
            <p className="text-gray-600">
              Ödeme durumunuz kontrol ediliyor, lütfen bekleyiniz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ödeme Başarısız
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>

            <div className="space-y-4">
              <button
                onClick={() => router.push("/rezervasyon")}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Yeniden Dene
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Ödeme Başarılı!
          </h1>
          <p className="text-gray-600 mb-8">
            Ödemeniz başarıyla tamamlanmıştır. En kısa sürede sizinle iletişime
            geçeceğiz.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Ana Sayfaya Dön
            </button>

            <button
              onClick={() => router.push("/iletisim")}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              İletişime Geç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
