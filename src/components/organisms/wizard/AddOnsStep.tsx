import { Plus, CheckCircle, Clock, Info } from "lucide-react";

export default function AddOnsStep({ addOns, selectedAddOns, onUpdate }: any) {
  const calculateAddOnsTotal = () => {
    return selectedAddOns.reduce((total: number, addOnId: string) => {
      const addOn = addOns.find((a: any) => a.id === addOnId);
      return total + (addOn ? parseFloat(addOn.price) : 0);
    }, 0);
  };

  const calculateAddOnsTotalDuration = () => {
    return selectedAddOns.reduce((total: number, addOnId: string) => {
      const addOn = addOns.find((a: any) => a.id === addOnId);
      return total + (addOn ? addOn.durationInMinutes || 30 : 0);
    }, 0);
  };

  const toggleAddOn = (addOnId: string) => {
    const newSelectedAddOns = selectedAddOns.includes(addOnId)
      ? selectedAddOns.filter((id: string) => id !== addOnId)
      : [...selectedAddOns, addOnId];

    onUpdate(newSelectedAddOns);
  };

  const addOnsTotal = calculateAddOnsTotal();
  const addOnsTotalDuration = calculateAddOnsTotalDuration();

  if (!addOns || addOns.length === 0) {
    return (
      <div className="text-center py-12">
        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ek hizmet bulunmamaktadır
        </h3>
        <p className="text-gray-500">
          Şu anda eklenebilecek ek hizmet bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ek Hizmetler</h2>
        <p className="text-gray-600">
          Çekiminizi daha özel kılmak için ek hizmetleri seçebilirsiniz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addOns.map((addOn: any) => (
          <div
            key={addOn.id}
            onClick={() => toggleAddOn(addOn.id)}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAddOns.includes(addOn.id)
                ? "border-orange-500 bg-orange-50 shadow-md"
                : "border-gray-200 hover:border-orange-300"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {addOn.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {addOn.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
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
              <div className="ml-4 flex flex-col items-end">
                <span className="text-xl font-bold text-orange-600">
                  ₺{addOn.price}
                </span>
                {selectedAddOns.includes(addOn.id) && (
                  <CheckCircle className="w-5 h-5 text-orange-600 mt-2" />
                )}
              </div>
            </div>

            {/* Add-on features or details */}
            {addOn.features &&
              Array.isArray(addOn.features) &&
              addOn.features.length > 0 && (
                <div className="space-y-1">
                  {addOn.features
                    .slice(0, 2)
                    .map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        <span className="line-clamp-1">{feature}</span>
                      </div>
                    ))}
                </div>
              )}

            {/* Selection indicator */}
            {selectedAddOns.includes(addOn.id) && (
              <div className="mt-4 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-600">
                  Seçildi
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedAddOns.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Seçilen Ek Hizmetler
          </h3>
          <div className="space-y-3">
            {selectedAddOns.map((addOnId: string) => {
              const addOn = addOns.find((a: any) => a.id === addOnId);
              if (!addOn) return null;

              return (
                <div
                  key={addOnId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
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
                  </div>
                  <span className="font-medium text-gray-900">
                    ₺{addOn.price}
                  </span>
                </div>
              );
            })}

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">
                  Toplam Ek Süre:
                </span>
                <span className="font-medium text-gray-700">
                  +{Math.floor(addOnsTotalDuration / 60)}$
                  {addOnsTotalDuration % 60 > 0
                    ? `.${Math.round(((addOnsTotalDuration % 60) / 60) * 10)}`
                    : ""}{" "}
                  saat
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Ek Hizmetler Toplamı:
                </span>
                <span className="text-xl font-bold text-orange-600">
                  ₺{addOnsTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAddOns.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-blue-800 font-medium">
                Ek hizmet seçimi isteğe bağlıdır
              </h4>
              <p className="text-blue-700 text-sm mt-1">
                Herhangi bir ek hizmet seçmeden de rezervasyonunuzu
                tamamlayabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
