"use client";

import { CheckCircle, Info } from "lucide-react";

export function ConfirmationStep({ formData }: any) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Rezervasyonunuz Alındı!
      </h2>
      <p className="text-gray-600 mb-6">
        Rezervasyon talebiniz başarıyla oluşturuldu. En kısa sürede sizinle
        iletişime geçeceğiz.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">
          Rezervasyon Detayları
        </h3>
        <div className="space-y-2 text-sm text-gray-600 text-left">
          <p>
            <strong>Ad:</strong> {formData.customerName}
          </p>
          <p>
            <strong>E-posta:</strong> {formData.customerEmail}
          </p>
          <p>
            <strong>Telefon:</strong> {formData.customerPhone}
          </p>
          {formData.selectedDate && (
            <p>
              <strong>Tarih:</strong>{" "}
              {new Date(formData.selectedDate).toLocaleDateString("tr-TR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          {formData.selectedTime && (
            <p>
              <strong>Saat:</strong> {formData.selectedTime}
            </p>
          )}
          {formData.specialNotes && (
            <div>
              <strong>Özel Notlar:</strong>
              <p className="mt-1 text-gray-600">{formData.specialNotes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-blue-800 font-medium text-sm">
                Sonraki Adımlar
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                • Size e-posta ile onay gönderilecek
                <br />
                • 24 saat içinde telefon ile ulaşılacak
                <br />• Çekim detayları netleştirilecek
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
}
