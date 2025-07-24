"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import {
  Camera,
  Calendar,
  MapPin,
  Filter,
  Search,
  Grid3X3,
  Star,
  Heart,
  ArrowRight,
  RefreshCw,
  Tag,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react";
import CTA from "@/components/atoms/cta";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string;
  images: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  eventDate: Date | string | null;
  location: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function PortfolioContainer() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"created" | "updated" | "eventDate">(
    "created"
  );
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPortfolioItem, setCurrentPortfolioItem] =
    useState<PortfolioItem | null>(null);

  // Fetch portfolio items
  const {
    data: portfolioData,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = trpc.portfolio.list.useInfiniteQuery(
    {
      featured: featuredOnly || undefined,
      tag: selectedTag || undefined,
      limit: 12,
      sortBy,
      sortOrder: "desc",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const portfolioItems =
    portfolioData?.pages.flatMap((page) => page.items) || [];

  // Filter items by search term
  const filteredItems = portfolioItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Get all unique tags
  const allTags = Array.from(
    new Set(portfolioItems.flatMap((item) => item.tags))
  ).sort();

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Lightbox functions
  const openLightbox = useCallback(
    (item: PortfolioItem, imageIndex: number = 0) => {
      setCurrentPortfolioItem(item);
      setCurrentImageIndex(imageIndex);
      setLightboxOpen(true);
      document.body.style.overflow = "hidden";
    },
    []
  );

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCurrentPortfolioItem(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  }, []);

  const nextImage = useCallback(() => {
    if (currentPortfolioItem) {
      const totalImages = currentPortfolioItem.images.length + 1; // +1 for cover image
      setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    }
  }, [currentPortfolioItem]);

  const prevImage = useCallback(() => {
    if (currentPortfolioItem) {
      const totalImages = currentPortfolioItem.images.length + 1; // +1 for cover image
      setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    }
  }, [currentPortfolioItem]);

  // Get current image URL
  const getCurrentImageUrl = useCallback(() => {
    if (!currentPortfolioItem) return "";
    if (currentImageIndex === 0) return currentPortfolioItem.coverImage;
    return currentPortfolioItem.images[currentImageIndex - 1];
  }, [currentPortfolioItem, currentImageIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          prevImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
      }
    },
    [lightboxOpen, closeLightbox, prevImage, nextImage]
  );

  // Add keyboard listener
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Portfolio Yüklenemedi
            </h3>
            <p className="text-gray-600 mb-4">
              Portfolio öğeleri yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 backdrop-blur-sm px-4 py-2 text-sm shadow-sm mb-8"
            >
              <Camera className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">
                Profesyonel Portfolio
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight"
            >
              Çalışmalarımız
            </motion.h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-24 h-1 bg-black rounded-full mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              En özel anlarınızı ölümsüzleştirdiğimiz çalışmalarımızı keşfedin.{" "}
              <span className="text-gray-800 font-medium">
                Her fotoğraf, bir hikaye anlatır.
              </span>
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Camera className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">
                  {portfolioItems.length}+
                </div>
                <div className="text-gray-600">Tamamlanan Proje</div>
              </div>

              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Star className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">
                  {portfolioItems.filter((item) => item.isFeatured).length}
                </div>
                <div className="text-gray-600">Öne Çıkan Çalışma</div>
              </div>

              <div className="group text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-300">
                  <Heart className="w-6 h-6 text-gray-700" />
                </div>
                <div className="text-3xl font-bold text-black mb-2">500+</div>
                <div className="text-gray-600">Mutlu Müşteri</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Search and Sort */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Proje ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 bg-gray-50/50"
                />
              </div>

              {/* Sort and Featured Filter */}
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
                    setSortBy(
                      e.target.value as "created" | "updated" | "eventDate"
                    )
                  }
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 bg-gray-50/50"
                >
                  <option value="created">Yeniye Göre</option>
                  <option value="updated">Güncellenme Göre</option>
                  <option value="eventDate">Etkinlik Tarihine Göre</option>
                </select>

                <button
                  onClick={() => setFeaturedOnly(!featuredOnly)}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 font-medium ${
                    featuredOnly
                      ? "bg-black text-white border-black"
                      : "bg-gray-50/50 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Öne Çıkanlar
                  </div>
                </button>
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag("")}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                    selectedTag === ""
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Tümü
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? "" : tag)
                    }
                    className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium ${
                      selectedTag === tag
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Grid3X3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">
              {searchTerm || selectedTag
                ? "Arama Sonucu Bulunamadı"
                : "Henüz Portfolio Öğesi Bulunmuyor"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedTag
                ? "Arama kriterlerinize uygun portfolio öğesi bulunamadı. Farklı bir arama terimi deneyebilirsiniz."
                : "Yakında yeni portfolio çalışmaları eklenecek."}
            </p>
            {(searchTerm || selectedTag) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag("");
                }}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Tüm Çalışmaları Görüntüle
              </button>
            )}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => openLightbox(item, 0)}
                  >
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover Action */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                        Görüntüle
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {item.isFeatured && (
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Öne Çıkan
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-800 transition-colors">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      {item.eventDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.eventDate)}</span>
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Yükleniyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Daha Fazla Yükle
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="cta mt-24 mb-25">
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

      {/* Lightbox Modal */}
      {lightboxOpen && currentPortfolioItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {currentPortfolioItem.images.length > 0 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="relative max-w-7xl max-h-full">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Image
                  src={getCurrentImageUrl()}
                  alt={currentPortfolioItem.title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                  priority
                />
              </motion.div>
            </div>
          </div>

          {/* Bottom Info Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {currentPortfolioItem.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>
                      {currentImageIndex + 1} /{" "}
                      {currentPortfolioItem.images.length + 1}
                    </span>
                    {currentPortfolioItem.eventDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(currentPortfolioItem.eventDate)}
                        </span>
                      </div>
                    )}
                    {currentPortfolioItem.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{currentPortfolioItem.location}</span>
                      </div>
                    )}
                  </div>
                  {currentPortfolioItem.description && (
                    <p className="text-gray-300 mt-2 max-w-2xl">
                      {currentPortfolioItem.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = getCurrentImageUrl();
                      link.download = `${currentPortfolioItem.title}-${
                        currentImageIndex + 1
                      }.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    title="İndir"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: currentPortfolioItem.title,
                          text: currentPortfolioItem.description || "",
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        addToast({
                          title: "Başarılı!",
                          message: "Link kopyalandı!",
                          type: "success",
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200"
                    title="Paylaş"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Image Thumbnails */}
              {currentPortfolioItem.images.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {/* Cover Image Thumbnail */}
                  <button
                    onClick={() => setCurrentImageIndex(0)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                      currentImageIndex === 0
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={currentPortfolioItem.coverImage}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </button>

                  {/* Other Images Thumbnails */}
                  {currentPortfolioItem.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index + 1)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${
                        currentImageIndex === index + 1
                          ? "border-white"
                          : "border-transparent opacity-60 hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeLightbox} />
        </div>
      )}
    </div>
  );
}
