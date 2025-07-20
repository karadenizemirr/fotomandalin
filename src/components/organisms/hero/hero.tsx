"use client";

import { motion, useInView } from "framer-motion";
import { ArrowRight, Camera, Sparkles, Star, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";

export default function HeroComponent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    visible: { opacity: 1, y: 0 },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
  };

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gray-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 left-16 w-80 h-80 bg-gray-50/60 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Hero Content */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-8 lg:pr-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 backdrop-blur-sm px-4 py-2 text-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  Profesyonel Fotoğrafçılık
                </span>
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-tight">
                <span className="inline-block">Anınızı</span>{" "}
                <span className="inline-block text-black">Ölümsüzleştirin</span>
              </h1>

              <motion.div
                className="w-24 h-1 bg-black rounded-full"
                initial={{ width: 0 }}
                animate={isInView ? { width: 96 } : { width: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 max-w-[600px] leading-relaxed"
            >
              Fotomandalin ile özel anlarınızı profesyonel fotoğrafçılık
              hizmetimizle ölümsüzleştirin.
              <span className="text-gray-800 font-medium">
                {" "}
                Düğün, nişan, bebek, aile ve kurumsal çekimleriniz
              </span>{" "}
              için sizlere özel paketler sunuyoruz.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 py-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-gray-600 fill-current" />
                </div>
                <span className="text-sm text-gray-600">
                  <strong className="text-black">500+</strong> Mutlu Müşteri
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Award className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-600">
                  <strong className="text-black">10+</strong> Yıl Deneyim
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-600">
                  <strong className="text-black">1000+</strong> Başarılı Proje
                </span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/rezervasyon"
                  className="group inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-black to-gray-800 px-8 text-base font-semibold text-white transition-all duration-200 hover:shadow-xl hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Hemen Rezervasyon Yap
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/hizmetlerimiz"
                  className="group inline-flex h-14 items-center justify-center rounded-xl border border-gray-300 bg-white px-8 text-base font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Paketleri İncele
                  <Camera className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            variants={imageVariants}
            className="relative h-[500px] lg:h-[700px] w-full overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            {/* Professional Camera Interface */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute inset-4 bg-white/98 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden"
            >
              {/* Professional Header */}
              <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg">
                      <Camera className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Fotomandalin Pro</h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        Professional Studio Live
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-sm"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    </div>
                    <div className="text-xs bg-white/10 px-2 py-1 rounded-full">
                      4K
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Portfolio Grid */}
              <div className="p-6 h-full bg-gradient-to-br from-gray-50/50 to-white">
                {/* Stats Bar */}
                <div className="flex items-center justify-between mb-6 p-3 bg-white/80 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-gray-600">4.9/5</span>
                    </div>
                    <div className="text-gray-600">500+ Projeler</div>
                  </div>
                  <div className="text-xs text-gray-500">2025</div>
                </div>

                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Main Feature Image */}
                  <motion.div
                    className="col-span-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl relative overflow-hidden group shadow-lg"
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Hero Image */}
                    <div className="absolute inset-0">
                      <Image
                        src="/images/heroImage.jpg"
                        alt="Fotomandalin - Profesyonel Fotoğrafçılık"
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                      />
                      {/* Overlay for better text readability and image darkening */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </div>

                    {/* Image Placeholder with Professional Grid - shown if image fails to load */}
                    <div className="absolute inset-4 border-2 border-white/30 rounded-xl opacity-20">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-white/20" />
                        ))}
                      </div>
                    </div>

                    {/* Professional Labels */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                        Premium Wedding
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                        <h4 className="font-bold text-gray-900 mb-1">
                          Düğün Çekimi
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Premium Package - 8 Saat Çekim
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full border-2 border-white"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              +2 Fotoğrafçı
                            </span>
                          </div>
                          <div className="text-lg font-bold text-black">
                            ₺12,500
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Camera Icon */}
                    <motion.div
                      className="absolute top-4 right-4 w-10 h-10 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Side Portfolio Items */}
                  <div className="col-span-4 space-y-4">
                    {/* Portre */}
                    <motion.div
                      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-32 relative overflow-hidden group"
                      whileHover={{ scale: 1.03, x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                      <div className="absolute inset-2 border border-white/40 rounded-lg opacity-30" />

                      <div className="absolute top-3 left-3">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs font-semibold text-gray-800">
                            Portre Çekimi
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">
                              2 Saat
                            </span>
                            <span className="text-sm font-bold text-black">
                              ₺850
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Aile */}
                    <motion.div
                      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-32 relative overflow-hidden group"
                      whileHover={{ scale: 1.03, x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
                      <div className="absolute inset-2 border border-white/40 rounded-lg opacity-30" />

                      <div className="absolute top-3 left-3">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs font-semibold text-gray-800">
                            Aile Çekimi
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">
                              3 Saat
                            </span>
                            <span className="text-sm font-bold text-black">
                              ₺1,200
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bebek */}
                    <motion.div
                      className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-32 relative overflow-hidden group"
                      whileHover={{ scale: 1.03, x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-500/10" />
                      <div className="absolute inset-2 border border-white/40 rounded-lg opacity-30" />

                      <div className="absolute top-3 left-3">
                        <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-pink-500 rounded-full" />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-xs font-semibold text-gray-800">
                            Bebek Çekimi
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">
                              2 Saat
                            </span>
                            <span className="text-sm font-bold text-black">
                              ₺950
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Professional Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">
                            Profesyonel Ekip
                          </span>
                        </div>
                        <div className="w-1 h-4 bg-gray-200 rounded-full" />
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600">
                            Özel Paketler
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">24/7 Destek</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Floating Elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-gray-200/60 to-gray-300/40 rounded-2xl blur-sm shadow-lg"
              animate={{
                y: [0, -25, 0],
                rotate: [0, 5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-gray-100/80 to-gray-200/60 rounded-xl blur-sm shadow-md"
              animate={{
                y: [0, 20, 0],
                x: [0, -15, 0],
                rotate: [0, -5, 0],
                scale: [1, 0.95, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 10,
                ease: "easeInOut",
                delay: 3,
              }}
            />

            {/* Professional Corner Accents */}
            <div className="absolute top-8 left-8 w-3 h-3 bg-black/20 rounded-full" />
            <div className="absolute bottom-8 right-8 w-2 h-2 bg-black/15 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-gray-200/60"
        >
          <motion.div
            className="group flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all duration-300">
              <Award className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-black">Profesyonel Ekip</h3>
            <p className="text-gray-600 leading-relaxed">
              Deneyimli fotoğrafçılarımızla en özel anlarınızı yakalıyoruz ve
              ölümsüzleştiriyoruz.
            </p>
          </motion.div>

          <motion.div
            className="group flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-black">Özel Paketler</h3>
            <p className="text-gray-600 leading-relaxed">
              İhtiyaçlarınıza uygun özelleştirilebilir çekim paketleri ve esnek
              fiyatlandırma sunuyoruz.
            </p>
          </motion.div>

          <motion.div
            className="group flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-all duration-300">
              <Star className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-black">Hızlı Teslimat</h3>
            <p className="text-gray-600 leading-relaxed">
              Çekimlerinizi en kısa sürede işleyip yüksek kalitede size teslim
              ediyoruz.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
