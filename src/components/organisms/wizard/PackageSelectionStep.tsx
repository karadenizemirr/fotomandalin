import { useState } from "react";
import {
  Check,
  Clock,
  Camera,
  Star,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import Image from "next/image";

export default function PackageSelectionStep({
  packages,
  isLoading,
  selectedPackageId,
  onSelect,
}: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mb-4"></div>
        <p className="text-gray-600">Paketler yükleniyor...</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Henüz paket bulunmuyor
        </h3>
        <p className="text-gray-600">Yakında yeni paketler eklenecek.</p>
      </div>
    );
  }

  // Filter packages based on search and price filter
  const filteredPackages = packages.filter((pkg: any) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const price = parseFloat(pkg.basePrice);
    let matchesPrice = true;

    if (priceFilter === "low") matchesPrice = price < 1000;
    else if (priceFilter === "medium")
      matchesPrice = price >= 1000 && price < 3000;
    else if (priceFilter === "high") matchesPrice = price >= 3000;

    return matchesSearch && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Paket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value as any)}
            className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">Tüm Fiyatlar</option>
            <option value="low">₺0 - ₺1.000</option>
            <option value="medium">₺1.000 - ₺3.000</option>
            <option value="high">₺3.000+</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredPackages.length} paket bulundu
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPackages.map((pkg: any) => (
          <div
            key={pkg.id}
            onClick={() => onSelect(pkg.id)}
            className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
              selectedPackageId === pkg.id
                ? "border-black shadow-lg ring-4 ring-gray-100"
                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}
          >
            {/* Selection Indicator */}
            {selectedPackageId === pkg.id && (
              <div className="absolute top-4 right-4 z-10">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            {/* Popular Badge */}
            {pkg.isPopular && (
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3" />
                  <span>Popüler</span>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Package Image */}
              <div className="relative w-full h-48 bg-gray-50 rounded-xl mb-6 overflow-hidden">
                {pkg.coverImage || pkg.images?.[0] ? (
                  <Image
                    src={pkg.coverImage || pkg.images[0]}
                    alt={pkg.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Package Content */}
              <div className="space-y-4">
                {/* Title and Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                    {pkg.name}
                  </h3>
                  {pkg.shortDesc && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {pkg.shortDesc}
                    </p>
                  )}
                </div>

                {/* Key Features */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor(pkg.durationInMinutes / 60)}h{" "}
                    {pkg.durationInMinutes % 60}m
                  </div>
                  {pkg.photoCount && (
                    <div className="flex items-center text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                      <Camera className="w-3 h-3 mr-1" />
                      {pkg.photoCount} fotoğraf
                    </div>
                  )}
                  {pkg.videoIncluded && (
                    <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      Video dahil
                    </div>
                  )}
                </div>

                {/* Features List */}
                {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <div className="space-y-1">
                    {pkg.features
                      .slice(0, 3)
                      .map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-start text-sm text-gray-700"
                        >
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    {pkg.features.length > 3 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{pkg.features.length - 3} özellik daha
                      </p>
                    )}
                  </div>
                )}

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₺
                        {parseFloat(
                          pkg.discountPrice || pkg.basePrice
                        ).toLocaleString("tr-TR")}
                      </span>
                      {pkg.discountPrice &&
                        pkg.discountPrice !== pkg.basePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ₺{parseFloat(pkg.basePrice).toLocaleString("tr-TR")}
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pkg.currency}</p>
                  </div>

                  <div className="flex items-center text-sm font-medium text-gray-700 group-hover:text-black transition-colors">
                    Seç
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aradığınız kriterlere uygun paket bulunamadı
          </h3>
          <p className="text-gray-600 mb-4">
            Farklı arama terimleri deneyin veya filtreleri temizleyin.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setPriceFilter("all");
            }}
            className="text-black hover:text-gray-700 font-medium underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}
