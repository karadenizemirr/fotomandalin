"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import CTA from "@/components/atoms/cta";
import {
  Camera,
  Clock,
  Star,
  ArrowRight,
  Search,
  Package,
  RefreshCw,
  Play,
  Image as ImageIcon,
  Heart,
  Share2,
} from "lucide-react";

type SortOption = "price" | "popularity" | "name" | "created";

interface CategoryPackagesContainerProps {
  slug?: string;
}

export default function CategoryPackagesContainer({
  slug: propSlug,
}: CategoryPackagesContainerProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string);

  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  // S3 URL format helper function
  const formatImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // Eğer URL zaten tam bir HTTP URL ise, olduğu gibi döndür
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // BASE_URL ile birleştir
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
  };

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

  // Loading State
  if (categoryLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (categoryError || packagesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Kategori Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">
            Aradığınız kategori bulunamadı veya mevcut değil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/hizmetler"
              className="px-6 py-3 text-gray-600 hover:text-black transition-colors border border-gray-300 rounded-lg hover:border-gray-400"
            >
              Hizmetlere Dön
            </Link>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) return null;

  return (
    <div className="min-h-screen bg-gray-5">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-4 px-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/hizmetler" className="hover:text-black transition-colors">
              Hizmetler
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">
              {categoryData.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Modern Hero Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto py-16 px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 mb-6">
              <Package className="w-4 h-4 mr-2" />
              {filteredPackages.length} Paket Seçeneği
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              {categoryData.name}
            </h1>

            {categoryData.description && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {categoryData.description}
              </p>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {filteredPackages.length}
                </div>
                <div className="text-sm text-gray-600">Paket</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {filteredPackages.length > 0
                    ? Math.min(
                        ...filteredPackages.map((p: any) =>
                          parseFloat(p.discountPrice || p.basePrice)
                        )
                      ).toLocaleString('tr-TR')
                    : 0}₺
                </div>
                <div className="text-sm text-gray-600">Başlangıç</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  4.9
                </div>
                <div className="text-sm text-gray-600">Puan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto py-6 px-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Paket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split("-");
                  setSortBy(sort as SortOption);
                  setSortOrder(order as "asc" | "desc");
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="popularity-desc">En Popüler</option>
                <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
                <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
                <option value="name-asc">İsim (A → Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-6xl mx-auto py-12 px-6">
        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Paket bulunamadı
            </h3>
            <p className="text-gray-600 mb-8">
              Arama kriterlerinize uygun paket bulunmuyor.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setPriceRange([0, 50000]);
              }}
              className="text-black hover:text-gray-700 font-medium underline"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPackages.map((pkg: any, index: number) => {
              // S3 URL formatını kontrol et ve düzelt
              const formattedCoverImage = formatImageUrl(pkg.coverImage);
              const formattedFirstImage = pkg.images?.[0] ? formatImageUrl(pkg.images[0]) : null;
              const imageToShow = formattedCoverImage || formattedFirstImage;

              // İlk 4 paket (above-the-fold) için priority=true
              const isPriorityImage = index < 4;

              return (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  {/* Package Image */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {imageToShow ? (
                      <Image
                        src={imageToShow}
                        alt={pkg.name}
                        fill
                        priority={isPriorityImage}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e) => {
                          console.error(`Failed to load image for package ${pkg.name}:`, imageToShow);
                          // Fallback to placeholder on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Camera className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {pkg.isPopular && (
                        <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3" />
                          <span>Popüler</span>
                        </div>
                      )}
                      {pkg.discountPrice && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          %{getDiscountPercentage(pkg.basePrice, pkg.discountPrice)} İndirim
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm"
                        aria-label={`${pkg.name} paketini favorilere ekle`}
                      >
                        <Heart className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm"
                        aria-label={`${pkg.name} paketini paylaş`}
                      >
                        <Share2 className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
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
                    </div>

                    {/* Package Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="flex items-center text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(pkg.durationInMinutes)}
                      </div>
                      {pkg.photoCount && (
                        <div className="flex items-center text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                          <Camera className="w-3 h-3 mr-1" />
                          {pkg.photoCount} fotoğraf
                        </div>
                      )}
                      {pkg.videoIncluded && (
                        <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </div>
                      )}
                      {pkg.albumIncluded && (
                        <div className="flex items-center text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Albüm
                        </div>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(pkg.discountPrice || pkg.basePrice)}
                          </span>
                          {pkg.discountPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(pkg.basePrice)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Başlangıç fiyatı</p>
                      </div>

                      <Link
                        href={`/rezervasyon?paket=${pkg.slug}`}
                        className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                      >
                        <span>Rezervasyon Yap</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {filteredPackages.length > 0 && (
        <div className="bg-white">
          <div className="max-w-6xl mx-auto">
            <CTA
              title="Size Uygun Paketimizi Bulamadınız mı?"
              description="Özel istekleriniz için bizimle iletişime geçin. Size özel paket seçenekleri oluşturabiliriz."
              buttons={[
                {
                  text: "Hemen Rezervasyon Yap",
                  href: "/rezervasyon",
                  variant: "primary",
                },
                {
                  text: "İletişime Geç",
                  href: "/iletisim",
                  variant: "secondary",
                },
              ]}
              variant="light"
              size="md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
