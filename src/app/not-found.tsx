"use client";

import { motion } from "framer-motion";
import { Camera, Home, Search, ArrowLeft, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6"
      >
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-black transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-gray-400">404 - Sayfa Bulunamadı</span>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* 404 Illustration */}
          <motion.div variants={imageVariants} className="mb-8">
            <div className="relative inline-block">
              {/* Main 404 Text */}
              <div className="text-[120px] sm:text-[150px] md:text-[200px] font-bold text-gray-100 leading-none select-none">
                404
              </div>

              {/* Floating Camera Icon */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-20 h-20 bg-[#fca311] rounded-full flex items-center justify-center border-2 border-gray-200">
                  <Camera className="w-10 h-10 text-black" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="mb-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
              Aradığınız Sayfa Bulunamadı
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Maalesef aradığınız sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.
              Endişelenmeyin, Fotomandalin'in güzel dünyasına geri dönmeniz için size yardımcı olalım.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex h-14 items-center justify-center rounded-xl bg-black px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <ArrowLeft className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span>Geri Dön</span>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/"
                className="group inline-flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                <Home className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                <span>Ana Sayfaya Dön</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: Camera,
                title: "Portfolio",
                description: "Çalışmalarımıza göz atın",
                href: "/portfolio",
                color: "text-[#fca311]"
              },
              {
                icon: Clock,
                title: "Rezervasyon",
                description: "Randevu almak için",
                href: "/rezervasyon",
                color: "text-black"
              },
              {
                icon: MapPin,
                title: "İletişim",
                description: "Bize ulaşın",
                href: "/iletisim",
                color: "text-black"
              }
            ].map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={link.href}
                  className="group block p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 transition-all duration-300 group-hover:bg-gray-100`}>
                      <link.icon className={`w-6 h-6 ${link.color} transition-all duration-300 group-hover:scale-110`} />
                    </div>
                    <h3 className="font-semibold text-black group-hover:text-gray-800 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      {link.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-6 bg-gray-50 border border-gray-200 rounded-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Camera className="w-5 h-5 text-[#fca311]" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Fotomandalin İpucu
              </span>
            </div>
            <p className="text-gray-700">
              Aradığınız sayfa kaybolmuş olabilir ama unutmayın, her anınız kaybolmasın!
              Profesyonel fotoğrafçılık hizmetlerimizle özel anlarınızı ölümsüzleştirin.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="border-t border-gray-200 bg-white py-8"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            Hala aradığınızı bulamadınız mı?
          </p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 text-[#fca311] font-semibold hover:underline"
          >
            <Search className="w-4 h-4" />
            Bize yazın, yardımcı olalım
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
