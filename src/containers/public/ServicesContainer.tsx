"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import {
  Camera,
  Users,
  Heart,
  Baby,
  Briefcase,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Grid3X3,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import CTA from "@/components/atoms/cta";

interface ServiceCategoryWithPackages {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  packages: {
    id: string;
    name: string;
    basePrice: string;
    discountPrice: string | null;
  }[];
  _count: {
    packages: number;
  };
}

export default function ServicesContainer() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "popular">("name");

  // Fetch service categories
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = trpc.serviceCategory.list.useQuery({
    includeInactive: false,
    limit: 50,
  });

  const getDefaultIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("düğün") || name.includes("nişan"))
      return <Heart className="w-8 h-8" />;
    if (name.includes("bebek") || name.includes("doğum"))
      return <Baby className="w-8 h-8" />;
    if (name.includes("kurumsal") || name.includes("iş"))
      return <Briefcase className="w-8 h-8" />;
    if (name.includes("aile") || name.includes("grup"))
      return <Users className="w-8 h-8" />;
    if (name.includes("özel") || name.includes("sanat"))
      return <Sparkles className="w-8 h-8" />;
    return <Camera className="w-8 h-8" />;
  };

  const getMinPrice = (packages: any[]) => {
    if (!packages || packages.length === 0) return null;
    const prices = packages.map((pkg) =>
      parseFloat(pkg.discountPrice || pkg.basePrice)
    );
    return Math.min(...prices);
  };

  const filteredCategories =
    categoriesData?.items?.filter(
      (category: any) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case "price":
        const priceA = getMinPrice(a.packages) || 0;
        const priceB = getMinPrice(b.packages) || 0;
        return priceA - priceB;
      case "popular":
        return b._count.packages - a._count.packages;
      default:
        return a.name.localeCompare(b.name, "tr");
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hizmetler Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              Hizmet kategorileri yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 backdrop-blur-sm px-4 py-2 text-sm shadow-sm mb-8">
              <Camera className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Profesyonel Fotoğrafçılık Hizmetleri
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
              Hizmetlerimiz
            </h1>

            <div className="w-24 h-1 bg-black rounded-full mx-auto mb-8" />

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Özel anlarınızı ölümsüzleştirmek için profesyonel fotoğrafçılık
              hizmetlerimizi keşfedin.{" "}
              <span className="text-gray-800 font-medium">
                Her kategoride uzman ekibimiz ile en kaliteli çözümleri
                sunuyoruz.
              </span>
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Star className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">500+</div>
                <div className="text-gray-600">Mutlu Müşteri</div>
              </div>

              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Grid3X3 className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">
                  {categoriesData?.items?.length || 0}
                </div>
                <div className="text-gray-600">Hizmet Kategorisi</div>
              </div>

              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Award className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">10+</div>
                <div className="text-gray-600">Yıl Deneyim</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Hizmet kategorisi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 bg-gray-50/50"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Sırala:
                </span>
              </div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "price" | "popular")
                }
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 bg-gray-50/50"
              >
                <option value="name">İsme Göre</option>
                <option value="price">Fiyata Göre</option>
                <option value="popular">Popülerliğe Göre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-6 bg-white border border-gray-100 rounded-b-2xl">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">
              {searchTerm
                ? "Arama Sonucu Bulunamadı"
                : "Henüz Hizmet Bulunmuyor"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? `"${searchTerm}" için herhangi bir hizmet kategorisi bulunamadı. Farklı bir arama terimi deneyebilirsiniz.`
                : "Yakında yeni hizmet kategorileri eklenecek."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Tüm Hizmetleri Görüntüle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCategories.map((category) => {
              const minPrice = getMinPrice(category.packages);

              return (
                <div
                  key={category.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-600">
                        {category.icon ? (
                          <i className={`${category.icon} text-5xl`} />
                        ) : (
                          getDefaultIcon(category.name)
                        )}
                      </div>
                    )}

                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>

                    {/* Package Count Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                      {category._count.packages} Paket
                    </div>

                    {/* Category Icon */}
                    <div className="absolute top-4 left-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
                      <div className="text-gray-700">
                        {category.icon ? (
                          <i className={`${category.icon} text-lg`} />
                        ) : (
                          <div className="scale-50">
                            {getDefaultIcon(category.name)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gray-800 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {category.description ||
                        "Profesyonel fotoğrafçılık hizmeti ile özel anlarınızı ölümsüzleştirin."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      {minPrice && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">
                            Başlangıç
                          </span>
                          <span className="text-lg font-bold text-black">
                            ₺{minPrice.toLocaleString("tr-TR")}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          4.9
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/hizmetlerimiz/paket/${category.slug}`}
                      className="group/btn flex items-center justify-center w-full px-4 py-3.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
                    >
                      <span>Paketleri İncele</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="cta mt-24 mb-24">
        <CTA
          title="Hizmetlerimizle Anılarınızı Ölümsüzleştirin"
          description="Profesyonel fotoğrafçılık hizmetlerimizle özel anlarınızı en güzel şekilde yakalayın. Hemen rezervasyon yapın!"
          buttons={[
            {
              text: "Rezervasyon Yap",
              href: "/rezervasyon",
              variant: "primary",
              icon: ArrowRight,
            },
            {
              text: "Ücretsiz Danışmanlık",
              href: "/iletisim",
              variant: "secondary",
            },
          ]}
        />
      </div>
    </div>
  );
}
