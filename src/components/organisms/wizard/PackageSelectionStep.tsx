import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";

// Placeholder components for other steps
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
  const [currentPage, setCurrentPage] = useState(1);
  const packagesPerPage = 6;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-500">Paketler yükleniyor...</p>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz paket bulunmamaktadır
        </h3>
        <p className="text-gray-500">Lütfen daha sonra tekrar deneyiniz.</p>
      </div>
    );
  }

  // Filter packages based on search and price filter
  const filteredPackages = packages.filter((pkg: any) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesPrice = true;
    const price = parseFloat(pkg.basePrice);

    switch (priceFilter) {
      case "low":
        matchesPrice = price <= 1000;
        break;
      case "medium":
        matchesPrice = price > 1000 && price <= 3000;
        break;
      case "high":
        matchesPrice = price > 3000;
        break;
      default:
        matchesPrice = true;
    }

    return matchesSearch && matchesPrice;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPackages.length / packagesPerPage);
  const startIndex = (currentPage - 1) * packagesPerPage;
  const endIndex = startIndex + packagesPerPage;
  const currentPackages = filteredPackages.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePriceFilterChange = (
    value: "all" | "low" | "medium" | "high"
  ) => {
    setPriceFilter(value);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Fotoğraf Paketinizi Seçin
        </h2>
        <p className="text-gray-600">
          İhtiyacınıza en uygun paketi seçerek devam edin
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Paket ara..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Price Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePriceFilterChange("all")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              priceFilter === "all"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tüm Paketler
          </button>
          <button
            onClick={() => handlePriceFilterChange("low")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              priceFilter === "low"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ₺0 - ₺1.000
          </button>
          <button
            onClick={() => handlePriceFilterChange("medium")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              priceFilter === "medium"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ₺1.000 - ₺3.000
          </button>
          <button
            onClick={() => handlePriceFilterChange("high")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              priceFilter === "high"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ₺3.000+
          </button>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredPackages.length} paket bulundu
            {searchTerm && ` "${searchTerm}" için`}
          </span>
          {totalPages > 1 && (
            <span>
              Sayfa {currentPage} / {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* No Results */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arama kriterlerinize uygun paket bulunamadı
          </h3>
          <p className="text-gray-500 mb-4">
            Lütfen farklı arama terimleri veya filtreler deneyiniz.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setPriceFilter("all");
              setCurrentPage(1);
            }}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Package Grid */}
      {currentPackages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {currentPackages.map((pkg: any) => (
            <div
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPackageId === pkg.id
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              {pkg.images?.[0] && (
                <Image
                  src={pkg.images[0]}
                  alt={pkg.name}
                  width={300}
                  height={160}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {pkg.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {pkg.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-orange-600">
                  ₺{pkg.basePrice}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {Math.floor(pkg.durationInMinutes / 60)} saat
                </div>
              </div>

              {/* Package features */}
              {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                <div className="space-y-1">
                  {pkg.features
                    .slice(0, 3)
                    .map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                        <span className="line-clamp-1">{feature}</span>
                      </div>
                    ))}
                  {pkg.features.length > 3 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{pkg.features.length - 3} özellik daha
                    </p>
                  )}
                </div>
              )}

              {/* Selection indicator */}
              {selectedPackageId === pkg.id && (
                <div className="mt-4 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-600">
                    Seçildi
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, current, and adjacent pages
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            if (!showPage && page !== 2 && page !== totalPages - 1) {
              if (page === 3 && currentPage > 4) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              if (page === totalPages - 2 && currentPage < totalPages - 3) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentPage === page
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
