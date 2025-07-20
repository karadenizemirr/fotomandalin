"use client";

import { motion } from "framer-motion";
import { Camera, Home, RefreshCw, AlertTriangle, ArrowLeft, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  // Error tracking için basit log
  useEffect(() => {
    console.error("Uygulama Hatası:", error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 saniye bekleme
      reset();
    } finally {
      setIsRetrying(false);
    }
  };

  // Animasyon varyantları
  const containerVariants:any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants:any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
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
          <span className="text-gray-400">Sistem Hatası</span>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          {/* Error Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center border-2 border-gray-200"
              >
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </motion.div>

              {/* Floating Camera Icon */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -top-2 -right-2 w-12 h-12 bg-[#fca311] rounded-full flex items-center justify-center border-2 border-gray-200"
              >
                <Camera className="w-6 h-6 text-black" />
              </motion.div>
            </div>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="mb-8 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-black">
              Bir Şeyler Ters Gitti
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Rezervasyon sistemimizdeki beklenmedik bir hata nedeniyle işleminiz tamamlanamadı.
              Endişelenmeyin, teknik ekibimiz durumdan haberdar edildi ve sorunu en kısa sürede çözeceğiz.
            </p>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <motion.details
                variants={itemVariants}
                className="mt-4 text-left bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-2xl mx-auto"
              >
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Geliştirici Detayları (Sadece geliştirme modunda görünür)
                </summary>
                <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-auto">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-2">
                    Hata ID: {error.digest}
                  </p>
                )}
              </motion.details>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <motion.button
              onClick={handleRetry}
              disabled={isRetrying}
              whileHover={{ scale: isRetrying ? 1 : 1.02, y: isRetrying ? 0 : -2 }}
              whileTap={{ scale: isRetrying ? 1 : 0.98 }}
              className="group inline-flex h-14 items-center justify-center rounded-xl bg-black px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`mr-3 h-5 w-5 transition-transform ${isRetrying ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span>{isRetrying ? 'Tekrar Deneniyor...' : 'Tekrar Dene'}</span>
            </motion.button>

            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex h-14 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 text-base font-semibold text-black transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
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
                <span>Ana Sayfa</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Help Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                icon: Phone,
                title: "Acil Rezervasyon",
                description: "Hemen rezervasyon yapmak istiyorsanız",
                action: "Telefon ile ara",
                href: "tel:+90-537-123-4567",
                color: "text-green-600"
              },
              {
                icon: Mail,
                title: "Teknik Destek",
                description: "Sorunla ilgili bilgi almak için",
                action: "E-posta gönder",
                href: "mailto:destek@fotomandalin.com",
                color: "text-blue-600"
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  className="group block p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 transition-all duration-300 group-hover:bg-gray-100">
                      <item.icon className={`w-6 h-6 ${item.color} transition-all duration-300 group-hover:scale-110`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-black group-hover:text-gray-800 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mb-2">
                        {item.description}
                      </p>
                      <span className="text-sm font-medium text-[#fca311] group-hover:underline">
                        {item.action} →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Reassurance Message */}
          <motion.div
            variants={itemVariants}
            className="mt-16 p-6 bg-gray-50 border border-gray-200 rounded-2xl max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Camera className="w-5 h-5 text-[#fca311]" />
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Fotomandalin Güvencesi
              </span>
            </div>
            <p className="text-gray-700">
              Bu geçici teknik sorun, rezervasyon kayıtlarınızı etkilememektedir.
              Mevcut rezervasyonlarınız güvende ve planlandığı gibi devam edecektir.
              Herhangi bir endişeniz varsa bizimle iletişime geçin.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="border-t border-gray-200 bg-white py-6"
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Sistem durumu izleniyor • Teknik ekip çalışıyor</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
