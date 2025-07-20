"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/components/providers/trpcProvider";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams?.get("token");
  const conversationId = searchParams?.get("conversationId");

  const verifyPaymentMutation = trpc.payment.verifyIyzicoPayment.useMutation();
  const createBookingMutation =
      trpc.payment.createBookingFromPayment.useMutation();

  useEffect(() => {
    if (!token) {
      setError("Ödeme token'ı bulunamadı");
      setIsProcessing(false);
      return;
    }

    const processPayment = async () => {
      try {
        // 1. Verify payment
        const verifyResult = await verifyPaymentMutation.mutateAsync({
          token,
          conversationId: conversationId || undefined,
        });

        if (!verifyResult.success || verifyResult.paymentStatus !== "SUCCESS") {
          throw new Error("Ödeme doğrulanamadı");
        }

        // 2. Get booking data from localStorage
        const pendingBookingData = localStorage.getItem("pendingBookingData");
        if (!pendingBookingData) {
          throw new Error("Rezervasyon bilgileri bulunamadı");
        }

        const bookingData = JSON.parse(pendingBookingData);

        // 3. Create booking
        const bookingResult = await createBookingMutation.mutateAsync({
          paymentToken: token,
          ...bookingData,
        });

        if (bookingResult.success) {
          setBookingId(bookingResult.bookingId);
          // Clear localStorage
          localStorage.removeItem("pendingBookingData");
        } else {
          throw new Error("Rezervasyon oluşturulamadı");
        }
      } catch (err: any) {
        console.error("Payment processing error:", err);
        setError(err.message || "Ödeme işlenirken bir hata oluştu");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [token, conversationId]);

  if (isProcessing) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ödemeniz İşleniyor
            </h2>
            <p className="text-gray-600">
              Lütfen bekleyin, ödemenizi doğrulayıp rezervasyonunuzu
              oluşturuyoruz...
            </p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ödeme Başarısız
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => router.push("/rezervasyon")}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Ödeme Başarılı!
          </h2>
          <p className="text-gray-600 mb-6">
            Rezervasyonunuz başarıyla oluşturuldu.
            {bookingId && (
                <span className="block mt-2 font-medium">
              Rezervasyon ID: {bookingId}
            </span>
            )}
          </p>
          <div className="space-y-3">
            <button
                onClick={() => router.push(`/rezervasyon/${bookingId}`)}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Rezervasyonu Görüntüle
            </button>
            <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
  );
}

export default function PaymentSuccessPage() {
  return (
      <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p className="text-gray-600">Ödeme durumu kontrol ediliyor...</p>
              </div>
            </div>
          }
      >
        <PaymentSuccessContent />
      </Suspense>
  );
}