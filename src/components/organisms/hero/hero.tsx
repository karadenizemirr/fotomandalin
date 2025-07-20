"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Camera, Star, Award,
  CheckCircle, Clock as ClockIcon, ChevronLeft, ChevronRight, Play, Pause
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { trpc } from "@/components/providers/trpcProvider";

export default function HeroComponent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSliderPlaying, setIsSliderPlaying] = useState(true);

  // TRPC kullanarak öne çıkarılan portfolio öğelerini çek
  const { data: portfolioItems, isLoading } = trpc.portfolio.featured.useQuery(
    { limit: 6 }, // Maksimum 6 öne çıkarılan öğe
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 dakika cache
    }
  );

  // Yedek statik veriler (API'den veri gelmediğinde kullanılacak)
  const fallbackImages = [
    {
      id: "fallback-1",
      title: "Düğün Fotoğrafçılığı",
      coverImage: "/uploads/00d7c90b-7144-4dd8-adf6-e13315e22655_thumb.jpg",
      description: "Hayatınızın en özel gününü sanat eseri kalitesinde fotoğraflarla ölümsüzleştiriyoruz.",
      tags: ["Düğün", "Wedding", "Evlilik"],
      location: "İstanbul",
      slug: "dugun-fotografciligi"
    },
    {
      id: "fallback-2",
      title: "Aile Portreleri",
      coverImage: "/uploads/23d1c560-897d-4a5e-ad69-fece2131c829_thumb.jpg",
      description: "Ailenizin sıcaklığını ve birlikteliğini yansıtan duygusal aile portreleri.",
      tags: ["Aile", "Family", "Portre"],
      location: "İstanbul",
      slug: "aile-portreleri"
    },
    {
      id: "fallback-3",
      title: "Bebek & Newborn",
      coverImage: "/uploads/475f2e0e-e0a2-4f24-9960-d77fc8a75bc1_thumb.jpg",
      description: "Minik mucizelerinizin ilk günlerini hassasiyetle kayıt altına alıyoruz.",
      tags: ["Bebek", "Newborn", "Baby"],
      location: "İstanbul",
      slug: "bebek-newborn"
    }
  ];

  // Portfolio verilerini normalize et
  const normalizePortfolioData = (items: any[]) => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      coverImage: item.coverImage,
      description: item.description || "",
      tags: item.tags || [],
      location: item.location || "İstanbul",
      slug: item.slug,
      // Slider için gerekli alanları ekle
      src: item.coverImage, // coverImage'i src olarak kullan
      alt: `Fotomandalin ${item.title} - İstanbul profesyonel fotoğrafçılık`,
      category: item.tags?.[0] || "Fotoğrafçılık" // İlk tag'i kategori olarak kullan
    }));
  };

  // Fallback verilerini de normalize et
  const normalizedFallbackImages = fallbackImages.map((item) => ({
    ...item,
    src: item.coverImage,
    alt: `Fotomandalin ${item.title} - İstanbul profesyonel fotoğrafçılık`,
    category: item.tags?.[0] || "Fotoğrafçılık"
  }));

  // Kullanılacak görsel verisi - gerçek veri varsa onu kullan, yoksa fallback
  const displayImages = !isLoading && portfolioItems && portfolioItems.length > 0
    ? normalizePortfolioData(portfolioItems)
    : normalizedFallbackImages;

  // Slider kontrol fonksiyonları
  const nextSlide = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  const toggleSliderPlayback = () => {
    setIsSliderPlaying(!isSliderPlaying);
  };

  // Otomatik slider oynatma
  useEffect(() => {
    if (isSliderPlaying && displayImages.length > 0) {
      const interval = setInterval(nextSlide, 5000); // 5 saniye
      return () => clearInterval(interval);
    }
  }, [isSliderPlaying, displayImages.length]);

  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
    }
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Fotomandalin",
            "description": "İstanbul'un profesyonel fotoğrafçılık hizmeti. Dü��ün, nişan, bebek, aile ve kurumsal çekimlerde 10+ yıllık deneyim.",
            "url": "https://fotomandalin.com",
            "telephone": "+90-XXX-XXX-XXXX",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "İstanbul",
              "addressCountry": "TR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "41.0082",
              "longitude": "28.9784"
            },
            "openingHours": "Mo-Su 09:00-20:00",
            "priceRange": "$$",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "200",
              "bestRating": "5",
              "worstRating": "1"
            },
            "service": [
              {
                "@type": "Service",
                "name": "Düğün Fotoğrafçılığı",
                "description": "Profesyonel düğün fotoğraf çekimi hizmeti"
              },
              {
                "@type": "Service",
                "name": "Aile Fotoğrafçılığı",
                "description": "Aile çekimi ve portre fotoğrafçılık hizmeti"
              },
              {
                "@type": "Service",
                "name": "Bebek Fotoğrafçılığı",
                "description": "Newborn ve bebek fotoğraf çekimi hizmeti"
              },
              {
                "@type": "Service",
                "name": "Kurumsal Fotoğrafçılık",
                "description": "Kurumsal ve iş fotoğrafçılık hizmeti"
              }
            ]
          })
        }}
      />

      <section
        ref={ref}
        className="relative w-full min-h-[75vh] flex items-center bg-white overflow-hidden"
        itemScope
        itemType="https://schema.org/LocalBusiness"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-72 h-72 bg-gray-50 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-32 left-8 w-96 h-96 bg-[#fca311] opacity-5 rounded-full"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              repeat: Infinity,
              duration: 12,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
          >
            {/* Hero Content */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              {/* Brand Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-block"
              >
                <div className="inline-flex items-center gap-4 rounded-full border border-gray-200 bg-white px-6 py-4">
                  <div className="relative">
                    <Camera className="w-6 h-6 text-black" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#fca311] rounded-full"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black font-bold text-sm tracking-wide" itemProp="name">
                      FOTOMANDALIN
                    </span>
                    <span className="text-xs text-gray-500">Profesyonel Fotoğrafçılık</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    10+ YIL
                  </div>
                </div>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-[0.95]">
                  <span className="block">Anılarınızı</span>
                  <span className="block text-[#fca311] relative">
                    Ölümsüzleştirin
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-1 bg-[#fca311] opacity-30"
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                <p className="text-lg text-gray-600 max-w-[580px] leading-relaxed" itemProp="description">
                  <strong className="text-black font-semibold">İstanbul'un önde gelen fotoğrafçılık hizmeti</strong> ile özel anlarınızı
                  sanat eserine dönüştürün.
                  <span className="text-black font-medium"> Düğün, nişan, bebek, aile ve kurumsal çekimlerde</span>
                  {" "}10+ yıllık deneyimimizle yanınızdayız.
                </p>

                {/* Service Tags */}
                <div className="flex flex-wrap gap-2 text-sm">
                  {["Düğün Fotoğrafçısı", "Aile Çekimi", "Bebek Fotoğrafçısı", "Kurumsal Çekim"].map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-default"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8"
              >
                {[
                  { icon: Star, value: "4.9/5", label: "Müşteri Puanı", count: "200+ Değerlendirme", color: "text-[#fca311]" },
                  { icon: Award, value: "10+", label: "Yıl Deneyim", count: "Sektörde", color: "text-black" },
                  { icon: Camera, value: "1500+", label: "Başarılı Proje", count: "Mutlu Müşteri", color: "text-black" },
                  { icon: ClockIcon, value: "24/7", label: "Online Rezervasyon", count: "Hızlı Yanıt", color: "text-black" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${stat.color} bg-opacity-10 mb-2`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-xl font-semibold text-black" itemProp="aggregateRating">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stat.count}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/rezervasyon"
                    className="group inline-flex h-14 items-center justify-center rounded-xl bg-black px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    aria-label="Fotomandalin ile hemen rezervasyon yapın - İstanbul fotoğrafçı"
                  >
                    <span>Ücretsiz Keşif Randevusu</span>
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href="/calismalarimiz"
                    className="group inline-flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <span>Portfolyoyu İncele</span>
                    <Camera className="ml-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Gallery Showcase */}
            <motion.div
              variants={imageVariants}
              className="lg:col-span-5 relative"
            >
              {/* Main Slider Container */}
              <div className="relative group">
                {/* Main Image Display */}
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={displayImages[activeImageIndex]?.src || displayImages[0]?.src}
                        alt={displayImages[activeImageIndex]?.alt || displayImages[0]?.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={activeImageIndex < 2}
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Info Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute bottom-6 left-6 right-6 bg-white/10 rounded-2xl p-6 border border-white/20"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                            className="px-4 py-2 bg-[#fca311] text-black text-xs font-bold rounded-full"
                          >
                            {displayImages[activeImageIndex]?.category}
                          </motion.span>
                          <div className="flex items-center gap-1 text-white/80 text-xs">
                            <div className="w-1.5 h-1.5 bg-[#fca311] rounded-full"></div>
                            <span>{activeImageIndex + 1} / {displayImages.length}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                          {displayImages[activeImageIndex]?.title}
                        </h3>
                        <p className="text-sm text-white/90 leading-relaxed max-w-md">
                          {displayImages[activeImageIndex]?.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <motion.button
                    onClick={prevSlide}
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Önceki fotoğraf"
                  >
                    <ChevronLeft className="w-7 h-7 text-black" />
                  </motion.button>

                  <motion.button
                    onClick={nextSlide}
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 opacity-0 group-hover:opacity-100 z-10"
                    aria-label="Sonraki fotoğraf"
                  >
                    <ChevronRight className="w-7 h-7 text-black" />
                  </motion.button>

                  {/* Play/Pause Button */}
                  <motion.button
                    onClick={toggleSliderPlayback}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-6 right-6 w-12 h-12 bg-black/60 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 z-10"
                    aria-label={isSliderPlaying ? "Otomatik oynatmayı durdur" : "Otomatik oynatmayı başlat"}
                  >
                    <motion.div
                      animate={{ rotate: isSliderPlaying ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isSliderPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </motion.div>
                  </motion.button>
                </div>

                {/* Thumbnail Navigation */}
                <div className="mt-8 relative">
                  <div className="flex items-center justify-center gap-3 overflow-x-auto py-3 px-2">
                    {displayImages.map((image, index) => (
                      <motion.button
                        key={image.id}
                        onClick={() => setActiveImageIndex(index)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative flex-shrink-0 group ${
                          index === activeImageIndex 
                            ? 'w-20 h-20' 
                            : 'w-16 h-16'
                        } rounded-2xl overflow-hidden transition-all duration-500 ${
                          index === activeImageIndex 
                            ? 'ring-4 ring-[#fca311] ring-offset-2 ring-offset-white' 
                            : 'ring-2 ring-gray-200 hover:ring-gray-300'
                        }`}
                      >
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          className={`object-cover transition-all duration-500 ${
                            index === activeImageIndex 
                              ? 'grayscale-0 brightness-100' 
                              : 'grayscale-[0.3] brightness-90 group-hover:grayscale-0 group-hover:brightness-100'
                          }`}
                          sizes="80px"
                        />
                        {index === activeImageIndex && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-[#fca311]/30 to-transparent"
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center mt-6">
                  <div className="flex gap-2">
                    {displayImages.map((_, index) => (
                      <motion.div
                        key={index}
                        className="relative"
                        whileHover={{ scale: 1.2 }}
                      >
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                            index === activeImageIndex 
                              ? 'w-12 bg-[#fca311]' 
                              : 'w-3 bg-gray-300 hover:bg-gray-400'
                          }`}
                          onClick={() => setActiveImageIndex(index)}
                        />
                        {index === activeImageIndex && isSliderPlaying && (
                          <motion.div
                            className="absolute inset-0 bg-[#fca311] rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                            style={{ transformOrigin: 'left' }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}