"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import {
  Camera,
  Clock,
  Star,
  MapPin,
  Users,
  Check,
  ArrowRight,
  Heart,
  Share2,
  Filter,
  Grid3X3,
  List,
  Search,
  SlidersHorizontal,
  Package,
  Zap,
  Award,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  Play,
  Image as ImageIcon,
} from "lucide-react";

interface PackageFeature {
  name: string;
  included: boolean;
}

interface PackageWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDesc: string | null;
  basePrice: string;
  discountPrice: string | null;
  currency: string;
  durationInMinutes: number;
  photoCount: number | null;
  videoIncluded: boolean;
  albumIncluded: boolean;
  features: any;
  images: string[];
  coverImage: string | null;
  isActive: boolean;
  isPopular: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

type SortOption = "price" | "popularity" | "name" | "created";
type ViewMode = "grid" | "list";

interface CategoryPackagesContainerProps {
  slug?: string;
}

export default function CategoryPackagesContainer({
  slug: propSlug,
}: CategoryPackagesContainerProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);
  const { addToast } = useToast();

  // Debug log
  console.log("CategoryPackagesContainer - slug:", slug, "params:", params);

  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch category details
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = trpc.serviceCategory.getBySlug.useQuery(
    { slug },
    {
      enabled: !!slug,
      retry: false,
    }
  );

  // Fetch packages for category
  const {
    data: packagesData,
    isLoading: packagesLoading,
    error: packagesError,
    refetch,
  } = trpc.package.list.useQuery(
    {
      categoryId: categoryData?.id,
      includeInactive: false,
      limit: 50,
      sortBy,
      sortOrder,
    },
    { enabled: !!categoryData?.id }
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}s ${remainingMinutes}dk`
      : `${hours} saat`;
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const getDiscountPercentage = (
    basePrice: string | number,
    discountPrice: string | number
  ) => {
    const base =
      typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;
    const discount =
      typeof discountPrice === "string"
        ? parseFloat(discountPrice)
        : discountPrice;
    return Math.round(((base - discount) / base) * 100);
  };

  const parseFeatures = (features: any): PackageFeature[] => {
    if (!features) return [];
    if (Array.isArray(features)) return features;
    if (typeof features === "object") {
      return Object.entries(features).map(([name, included]) => ({
        name,
        included: Boolean(included),
      }));
    }
    return [];
  };

  const filteredPackages =
    packagesData?.items?.filter((pkg: any) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const currentPrice = parseFloat(pkg.discountPrice || pkg.basePrice);
      const matchesPrice =
        currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
      return matchesSearch && matchesPrice;
    }) || [];

  if (categoryLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categoryError || packagesError) {
    console.error("Category Error:", categoryError);
    console.error("Packages Error:", packagesError);
    console.log("Current slug:", slug);

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sayfa Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              {categoryError
                ? `Kategori bulunamadı: ${slug}`
                : "Paketler yüklenirken bir hata oluştu."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/services"
                className="px-6 py-2 text-gray-600 hover:text-black transition-colors"
              >
                Hizmetlere Dön
              </Link>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-orange-600">
              Ana Sayfa
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/services"
              className="text-gray-500 hover:text-orange-600"
            >
              Hizmetler
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">
              {categoryData.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Category Hero */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              {categoryData.name}
            </h1>
            {categoryData.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {categoryData.description}
              </p>
            )}

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {packagesData?.items?.length || 0}
                </div>
                <div className="text-gray-600">Paket Seçeneği</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  {(packagesData?.items?.length || 0) > 0
                    ? Math.min(
                        ...(packagesData?.items?.map((p: any) =>
                          parseFloat(p.discountPrice || p.basePrice)
                        ) || [0])
                      )
                    : 0}
                  ₺
                </div>
                <div className="text-gray-600">Başlangıç Fiyatı</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">
                  4.9
                </div>
                <div className="text-gray-600">Müşteri Memnuniyeti</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Paket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split("-");
                  setSortBy(sort as SortOption);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="popularity-desc">En Popüler</option>
                <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
                <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
                <option value="name-asc">İsim (A → Z)</option>
                <option value="name-desc">İsim (Z → A)</option>
              </select>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtreler
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat Aralığı
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Max"
                    />
                    <span className="text-sm text-gray-500">₺</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Arama Sonucu Bulunamadı"
                : "Henüz Paket Bulunmuyor"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `"${searchTerm}" için herhangi bir paket bulunamadı.`
                : "Bu kategori için henüz paket eklenmemiş."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Tüm Paketleri Görüntüle
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }
          >
            {filteredPackages.map((pkg: any) => {
              const currentPrice = pkg.discountPrice || pkg.basePrice;
              const hasDiscount =
                pkg.discountPrice &&
                parseFloat(pkg.discountPrice) < parseFloat(pkg.basePrice);
              const discountPercentage = hasDiscount
                ? getDiscountPercentage(pkg.basePrice, pkg.discountPrice!)
                : 0;
              const features = parseFeatures(pkg.features);

              if (viewMode === "list") {
                return (
                  <div
                    key={pkg.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Image */}
                      <div className="lg:w-64 h-48 lg:h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl overflow-hidden flex-shrink-0">
                        {pkg.coverImage ? (
                          <Image
                            src={pkg.coverImage}
                            alt={pkg.name}
                            width={256}
                            height={192}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-500">
                            <Camera className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-black">
                                {pkg.name}
                              </h3>
                              {pkg.isPopular && (
                                <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded-full">
                                  Popüler
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {pkg.shortDesc || pkg.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {hasDiscount && (
                                <span className="text-lg text-gray-400 line-through">
                                  {formatPrice(pkg.basePrice)}
                                </span>
                              )}
                              <span className="text-2xl font-bold text-orange-600">
                                {formatPrice(currentPrice)}
                              </span>
                            </div>
                            {hasDiscount && (
                              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                                %{discountPercentage} İndirim
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {formatDuration(pkg.durationInMinutes)}
                          </div>
                          {pkg.photoCount && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Camera className="w-4 h-4" />
                              {pkg.photoCount} Fotoğraf
                            </div>
                          )}
                          {pkg.videoIncluded && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Play className="w-4 h-4" />
                              Video Dahil
                            </div>
                          )}
                          {pkg.albumIncluded && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ImageIcon className="w-4 h-4" />
                              Albüm Dahil
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Link
                            href={`/rezervaston?paket=${pkg.slug}`}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Rezervasyon Yap
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid view
              return (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                    {pkg.coverImage ? (
                      <Image
                        src={pkg.coverImage}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-orange-500">
                        <Camera className="w-16 h-16" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {pkg.isPopular && (
                        <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                          Popüler
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                          %{discountPercentage} İndirim
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-right">
                      {hasDiscount && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(pkg.basePrice)}
                        </div>
                      )}
                      <div className="text-lg font-bold text-orange-600">
                        {formatPrice(currentPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-orange-600 transition-colors">
                      {pkg.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {pkg.shortDesc || pkg.description}
                    </p>

                    {/* Package Features */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {formatDuration(pkg.durationInMinutes)}
                      </div>
                      {pkg.photoCount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Camera className="w-4 h-4" />
                          {pkg.photoCount} Fotoğraf
                        </div>
                      )}
                      {features.slice(0, 2).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          {feature.name}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/hizmetlerimiz?paket=${pkg.slug}`}
                      className="flex items-center justify-between w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors group/btn"
                    >
                      <span className="font-medium">Rezervasyon Yap</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Zap className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Hemen Rezervasyonunuzu Yapın
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {categoryData.name} kategorisinde en uygun paketi seçin ve
              profesyonel fotoğraf çekimi deneyimi yaşayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/iletisim"
                className="px-8 py-4 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Ücretsiz Danışmanlık
              </Link>
              <Link
                href="/calismalarimiz"
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors"
              >
                Portfolyomuzu İncele
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
