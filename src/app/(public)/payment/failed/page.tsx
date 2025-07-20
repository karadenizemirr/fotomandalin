"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Ödeme Başarısız
                </h2>
                <p className="text-gray-600 mb-6">
                    Ödemeniz işlenirken bir sorun oluştu. Lütfen tekrar deneyiniz.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/booking")}
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Tekrar Dene
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