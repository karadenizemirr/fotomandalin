import { Plus, CheckCircle, Clock, Info } from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  isActive: boolean;
  durationInMinutes?: number;
  features?: string[];
}

interface AddOnsStepProps {
  addOns: AddOn[];
  selectedAddOns: string[];
  onUpdate: (selectedAddOns: string[]) => void;
  isLoading?: boolean;
}

export default function AddOnsStep({
  addOns,
  selectedAddOns,
  onUpdate,
  isLoading = false
}: AddOnsStepProps) {
  // Debug logging
  console.log('AddOnsStep rendered with:', {
    addOns: addOns,
    addOnsCount: addOns?.length || 0,
    selectedAddOns: selectedAddOns,
    isLoading: isLoading
  });

  const calculateAddOnsTotal = () => {
    return selectedAddOns.reduce((total: number, addOnId: string) => {
      const addOn = addOns.find((a: any) => a.id === addOnId);
      return total + (addOn ? parseFloat(addOn.price.toString()) : 0);
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

    console.log('Toggling addOn:', addOnId, 'New selection:', newSelectedAddOns);
    onUpdate(newSelectedAddOns);
  };

  const addOnsTotal = calculateAddOnsTotal();
  const addOnsTotalDuration = calculateAddOnsTotalDuration();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ek Hizmetler</h2>
          <p className="text-gray-600">
            Çekiminizi daha özel kılmak için ek hizmetleri seçebilirsiniz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-2 border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No add-ons available
  if (!addOns || addOns.length === 0) {
    console.log('No addOns available - showing empty state');
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ek Hizmetler</h2>
          <p className="text-gray-600">
            Çekiminizi daha özel kılmak için ek hizmetleri seçebilirsiniz
          </p>
        </div>

        <div className="text-center py-12">
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ek hizmet bulunmamaktadır
          </h3>
          <p className="text-gray-500">
            Şu anda eklenebilecek ek hizmet bulunmamaktadır. Ana paket ile devam edebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering addOns grid with', addOns.length, 'items');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ek Hizmetler</h2>
        <p className="text-gray-600">
          Çekiminizi daha özel kılmak için ek hizmetleri seçebilirsiniz
        </p>
      </div>

      {/* Selected Add-ons Summary */}
      {selectedAddOns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {selectedAddOns.length} ek hizmet seçildi
              </span>
            </div>
            <div className="text-right">
              <div className="text-blue-800 font-bold text-lg">
                +{addOnsTotal.toLocaleString('tr-TR')} ₺
              </div>
              {addOnsTotalDuration > 0 && (
                <div className="text-blue-600 text-sm">
                  +{Math.floor(addOnsTotalDuration / 60)} saat {addOnsTotalDuration % 60} dk
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addOns.map((addOn: AddOn, index: number) => {
          console.log(`Rendering addOn ${index}:`, addOn);

          return (
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
                  {addOn.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {addOn.description}
                    </p>
                  )}
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
                    {typeof addOn.price === 'string'
                      ? `₺${addOn.price}`
                      : `₺${addOn.price.toLocaleString('tr-TR')}`}
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
                      .map((feature: string, featureIndex: number) => (
                        <div
                          key={featureIndex}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    {addOn.features.length > 2 && (
                      <div className="text-xs text-gray-500 mt-2">
                        +{addOn.features.length - 2} daha fazla özellik
                      </div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Skip Add-ons Option */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          Ek hizmet seçmek zorunda değilsiniz. Ana paket ile devam edebilirsiniz.
        </p>
      </div>
    </div>
  );
}
