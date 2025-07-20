"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Heart,
  Star,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Sparkles,
  TrendingUp,
  MapPin,
  Baby,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/organisms/hero/hero";
import CommentsComponent from "@/components/organisms/comments/Comments";
import { trpc } from "@/components/providers/trpcProvider";
import CTA from "@/components/atoms/cta";

export default function HomeContainer() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Fetch service categories from API
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = trpc.serviceCategory.list.useQuery({
    includeInactive: false,
    limit: 8, // Limit to 8 categories for homepage
  });

  // Helper function to get appropriate icon for each category
  const getDefaultIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("düğün") || name.includes("nişan")) return Heart;
    if (name.includes("bebek") || name.includes("doğum")) return Baby;
    if (name.includes("kurumsal") || name.includes("iş")) return Briefcase;
    if (name.includes("aile") || name.includes("grup")) return Users;
    if (name.includes("özel") || name.includes("sanat")) return Sparkles;
    return Camera;
  };

  // Helper function to get appropriate color for each category
  const getDefaultColor = (index: number) => {
    const colors = [
      "from-red-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-indigo-500",
      "from-amber-500 to-orange-500",
      "from-green-500 to-emerald-500",
      "from-rose-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-cyan-500 to-blue-500",
    ];
    return colors[index % colors.length];
  };

  const stats = [
    { icon: Users, number: "2000+", label: "Mutlu Müşteri" },
    { icon: Camera, number: "5000+", label: "Fotoğraf Çekimi" },
    { icon: Award, number: "50+", label: "Ödül & Başarı" },
    { icon: TrendingUp, number: "99%", label: "Memnuniyet Oranı" },
  ];

  const whyChooseUs = [
    {
      icon: Shield,
      title: "Güvenilir Hizmet",
      description: "5 yıllık deneyim ve binlerce memnun müşteri",
    },
    {
      icon: Clock,
      title: "Hızlı Teslimat",
      description: "Editlenmiş fotoğraflarınız 7-14 gün içinde teslim",
    },
    {
      icon: Star,
      title: "Kaliteli Çekim",
      description: "Son teknoloji ekipmanlar ve profesyonel teknikler",
    },
    {
      icon: MapPin,
      title: "Esnek Lokasyon",
      description: "İstediğiniz her yerde çekim imkanı",
    },
  ];

  return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <Hero />

        {/* Services Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
            >
              <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Hizmetlerimiz
              </motion.h2>
              <motion.p
                  variants={fadeInUp}
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Her özel anınız için profesyonel fotoğrafçılık hizmetleri
                sunuyoruz
              </motion.p>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {categoriesLoading ? (
                  // Loading skeletons
                  Array.from({ length: 4 }).map((_, index) => (
                      <div
                          key={index}
                          className="bg-white rounded-2xl p-8 shadow-lg animate-pulse"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-xl mb-6"></div>
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-4"></div>
                        </div>
                      </div>
                  ))
              ) : categoriesError ? (
                  // Error state
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 mb-4">
                      Kategoriler yüklenirken bir hata oluştu.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Tekrar Dene
                    </button>
                  </div>
              ) : categoriesData?.items && categoriesData.items.length > 0 ? (
                  // Actual data
                  categoriesData.items.slice(0, 4).map((category, index) => {
                    const IconComponent = getDefaultIcon(category.name);
                    const packageCount = category._count?.packages || 0;

                    return (
                        <motion.div
                            key={category.id}
                            variants={fadeInUp}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                        >
                          <Link href={`/hizmetlerimiz`} className="block">
                            <div
                                className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getDefaultColor(
                                    index
                                )} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                            >
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                              {category.name}
                            </h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {category.description ||
                                  "Profesyonel fotoğrafçılık hizmetleri"}
                            </p>
                            <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-500">
                          {packageCount} Paket
                        </span>
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                          </Link>
                        </motion.div>
                    );
                  })
              ) : (
                  // No data state
                  <div className="col-span-full text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Henüz hizmet kategorisi bulunmuyor.
                    </p>
                  </div>
              )}
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mt-12"
            >
              <Link
                  href="/hizmetlerimiz"
                  className="inline-flex items-center px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors duration-300 group"
              >
                Tüm Hizmetleri Gör
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                  <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="text-center"
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                        className="text-4xl font-bold mb-2"
                    >
                      {stat.number}
                    </motion.div>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
            >
              <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              >
                Neden Fotomandalin?
              </motion.h2>
              <motion.p
                  variants={fadeInUp}
                  className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Profesyonel fotoğrafçılık deneyimimiz ve kalite odaklı
                yaklaşımımızla fark yaratıyoruz
              </motion.p>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {whyChooseUs.map((item, index) => (
                  <motion.div
                      key={index}
                      variants={fadeInUp}
                      whileHover={{ y: -5 }}
                      className="text-center group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <CTA
            title="Rezervasyonunuzu Hemen Yapın"
            description="Özel anlarınızı profesyonel fotoğrafçılarımızla ölümsüzleştirin"
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

        {/* Comment Section */}
        <CommentsComponent />
      </div>
  );
}