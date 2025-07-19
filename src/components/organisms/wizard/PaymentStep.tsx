"use client";
import { CreditCard, CheckCircle, Clock, Info } from "lucide-react";

export default function PaymentStep({
  formData,
  totalPrice,
  packages,
  addOns,
  locations,
  bookingSettings,
  onSubmit,
  isLoading,
}: any) {
  const selectedPackage = packages.find(
    (p: any) => p.id === formData.packageId
  );
  const selectedAddOnsList = addOns.filter((a: any) =>
    formData.selectedAddOns?.includes(a.id)
  );
  const selectedLocation = locations.find(
    (loc: any) => loc.id === formData.locationId
  );

  // Calculate total duration
  const calculateTotalDuration = () => {
    let totalDuration = 0;

    // Add package duration
    if (selectedPackage) {
      totalDuration += selectedPackage.durationInMinutes || 240; // Default 4 hours
    }

    // Add add-ons duration
    selectedAddOnsList.forEach((addOn: any) => {
      totalDuration += addOn.durationInMinutes || 30; // Default 30 minutes
    });

    return totalDuration;
  };

  // Calculate end time
  const calculateEndTime = () => {
    if (!formData.selectedDate || !formData.selectedTime) return null;

    const totalDuration = calculateTotalDuration();
    const startDateTime = new Date(
      `${formData.selectedDate}T${formData.selectedTime}:00`
    );
    const endDateTime = new Date(
      startDateTime.getTime() + totalDuration * 60 * 1000
    );

    return endDateTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalDuration = calculateTotalDuration();
  const endTime = calculateEndTime();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Ödeme ve Onay</h2>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rezervasyon Özeti
        </h3>

        <div className="space-y-4">
          {/* Package Details */}
          {selectedPackage && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Seçilen Paket</h4>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-gray-700">{selectedPackage.name}</span>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(
                      (selectedPackage.durationInMinutes || 240) / 60
                    )}{" "}
                    saat
                  </div>
                </div>
                <span className="font-medium">
                  ₺{selectedPackage.basePrice}
                </span>
              </div>
            </div>
          )}

          {/* Add-ons Details */}
          {selectedAddOnsList.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Ek Hizmetler</h4>
              {selectedAddOnsList.map((addOn: any) => (
                <div
                  key={addOn.id}
                  className="flex justify-between items-start mb-2"
                >
                  <div>
                    <span className="text-gray-700">{addOn.name}</span>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {addOn.durationInMinutes
                        ? `${Math.floor(addOn.durationInMinutes / 60)}${
                            addOn.durationInMinutes % 60 > 0
                              ? `.${Math.round(
                                  ((addOn.durationInMinutes % 60) / 60) * 10
                                )}`
                              : ""
                          } saat`
                        : "30 dakika"}
                    </div>
                  </div>
                  <span className="font-medium">₺{addOn.price}</span>
                </div>
              ))}
            </div>
          )}

          {/* Location Extra Fee */}
          {selectedLocation &&
            selectedLocation.extraFee &&
            parseFloat(selectedLocation.extraFee) > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Lokasyon Ek Ücreti
                </h4>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-700">
                      {selectedLocation.name}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      Ek lokasyon ücreti
                    </div>
                  </div>
                  <span className="font-medium">
                    ₺{selectedLocation.extraFee}
                  </span>
                </div>
              </div>
            )}

          {/* Time Summary */}
          {formData.selectedDate && formData.selectedTime && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Zaman Detayları
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih:</span>
                  <span className="text-gray-900">
                    {new Date(formData.selectedDate).toLocaleDateString(
                      "tr-TR",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Başlangıç:</span>
                  <span className="text-gray-900">{formData.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Süre:</span>
                  <span className="text-gray-900">
                    {Math.floor(totalDuration / 60)}$
                    {totalDuration % 60 > 0
                      ? `.${Math.round(((totalDuration % 60) / 60) * 10)}`
                      : ""}{" "}
                    saat
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bitiş (Tahmini):</span>
                  <span className="text-gray-900 font-medium">{endTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Price Total */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Toplam Tutar
              </span>
              <span className="text-2xl font-bold text-orange-600">
                ₺{totalPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-blue-800 font-medium mb-2">Ödeme Bilgileri</h3>
            <p className="text-blue-700 text-sm mb-3">
              &ldquo;Ödemeyi Tamamla&rdquo; butonuna tıkladığınızda güvenli
              İyzico ödeme sayfasına yönlendirileceksiniz. Ödeme başarılı
              olduktan sonra rezervasyonunuz otomatik olarak oluşturulacaktır.
            </p>
            <div className="text-blue-700 text-sm space-y-1">
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-2" />
                <span>256-bit SSL şifreleme ile güvenli ödeme</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-2" />
                <span>Tüm kredi kartları ve banka kartları kabul edilir</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-2" />
                <span>
                  Ödeme başarısız olursa rezervasyon bilgileriniz korunur
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Policies */}
      {bookingSettings && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Rezervasyon Koşulları
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>İptal süresi:</span>
                <span className="font-medium text-gray-900">
                  {bookingSettings.cancellationHours} saat öncesinden
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rezervasyon onayı:</span>
                <span className="font-medium text-gray-900">
                  {bookingSettings.autoConfirmBookings
                    ? "Otomatik"
                    : "Manuel onay"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Hazırlık süresi:</span>
                <span className="font-medium text-gray-900">
                  {bookingSettings.bufferTimeBefore} dakika öncesinden
                </span>
              </div>
              <div className="flex justify-between">
                <span>Çekim sonrası:</span>
                <span className="font-medium text-gray-900">
                  {bookingSettings.bufferTimeAfter} dakika buffer
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Önemli:</strong> Rezervasyonunuz ödeme onayından sonra
              kesinleşecektir. İptal işlemleri için rezervasyon tarihinden en az{" "}
              {bookingSettings.cancellationHours} saat öncesinden bizimle
              iletişime geçiniz.
            </p>
          </div>
        </div>
      )}

      {/* Payment Actions */}
      <div className="space-y-3">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Ödeme Sayfasına Yönlendiriliyor...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Ödemeyi Tamamla (₺{totalPrice})</span>
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-500">
          Bu işlemle{" "}
          <a href="/terms" className="text-orange-600 hover:underline">
            Kullanım Koşulları
          </a>{" "}
          ve{" "}
          <a href="/privacy" className="text-orange-600 hover:underline">
            Gizlilik Politikası
          </a>
          &rsquo;nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}
