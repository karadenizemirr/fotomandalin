"use client";

import { motion } from "framer-motion";
import {
  Camera,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Clock,
  Star,
  Award,
  Heart,
  ArrowRight,
  Shield,
  CreditCard,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSiteSettingsWithDefaults } from "@/contexts/SiteSettingsContext";
import { trpc } from "@/components/providers/trpcProvider";

export default function FooterComponent() {
  const currentYear = new Date().getFullYear();

  // Get site settings with defaults
  const {
    siteName,
    description,
    contactEmail,
    contactPhone,
    contactAddress,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    privacyPolicyUrl,
    termsOfServiceUrl,
    cookiePolicyUrl,
    isLoading,
  } = useSiteSettingsWithDefaults();

  // Get service categories
  const { data: serviceCategories, isLoading: servicesLoading } =
    trpc.serviceCategory.list.useQuery(
      {
        includeInactive: false,
        limit: 6, // Limit to 6 categories for footer
      },
      {
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false,
      }
    );

  // Fallback services if no categories are available
  const fallbackServices = [
    { name: "Düğün Fotoğrafçılığı", href: "/services" },
    { name: "Nişan Çekimi", href: "/services" },
    { name: "Aile Fotoğrafları", href: "/services" },
    { name: "Portre Çekimi", href: "/services" },
    { name: "Bebek Fotoğrafları", href: "/services" },
    { name: "Kurumsal Çekim", href: "/services" },
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
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

  const quickLinks = [
    { name: "Ana Sayfa", href: "/" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "Hizmetlerimiz", href: "/hizmetlerimiz" },
    { name: "Portfolyo", href: "/calismalarimiz" },
    { name: "Rezervasyon", href: "/rezervasyon" },
    { name: "İletişim", href: "/iletisim" },
  ];

  const legalLinks = [
    { name: "Gizlilik Politikası", href: privacyPolicyUrl || "/privacy" },
    { name: "Kullanım Koşulları", href: termsOfServiceUrl || "/terms" },
    { name: "Çerez Politikası", href: cookiePolicyUrl || "/cookies" },
    { name: "Sıkça Sorulan Sorular", href: "/faq" },
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Güvenli Ödeme",
      description: "SSL korumalı ödeme sistemi",
    },
    {
      icon: Award,
      title: "10 Yıl Deneyim",
      description: "Profesyonel fotoğrafçılık",
    },
    {
      icon: Star,
      title: "99% Memnuniyet",
      description: "Binlerce mutlu müşteri",
    },
    {
      icon: Smartphone,
      title: "7/24 Destek",
      description: "Her zaman yanınızdayız",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {isLoading || servicesLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-800 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
            >
              {/* Company Info */}
              <motion.div variants={fadeInUp} className="lg:col-span-1">
                <div className="flex items-center mb-6">
                  <h3 className="text-2xl font-bold">{siteName}</h3>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  {contactPhone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-300">{contactPhone}</span>
                    </div>
                  )}
                  {contactEmail && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-300">{contactEmail}</span>
                    </div>
                  )}
                  {contactAddress && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                      <span className="text-gray-300">
                        {contactAddress.split(",").map((line, index) => (
                          <span key={index}>
                            {line.trim()}
                            {index < contactAddress.split(",").length - 1 && (
                              <br />
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-300">
                      Pazartesi - Pazar: 09:00 - 22:00
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={fadeInUp}>
                <h4 className="text-lg font-semibold mb-6">Hızlı Erişim</h4>
                <ul className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 group flex items-center"
                      >
                        <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Services */}
              <motion.div variants={fadeInUp}>
                <h4 className="text-lg font-semibold mb-6">Hizmetlerimiz</h4>
                <ul className="space-y-3">
                  {serviceCategories?.items &&
                  serviceCategories.items.length > 0
                    ? serviceCategories.items
                        .slice(0, 6)
                        .map((category, index) => (
                          <li key={category.id}>
                            <Link
                              href={`/hizmetlerimiz/paket/${category.slug}`}
                              className="text-gray-300 hover:text-white transition-colors duration-200 group flex items-center"
                            >
                              <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                              {category.name}
                            </Link>
                          </li>
                        ))
                    : fallbackServices.map((service, index) => (
                        <li key={index}>
                          <Link
                            href={service.href}
                            className="text-gray-300 hover:text-white transition-colors duration-200 group flex items-center"
                          >
                            <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                            {service.name}
                          </Link>
                        </li>
                      ))}
                </ul>
              </motion.div>

              {/* Newsletter & Social */}
              <motion.div variants={fadeInUp}>
                <h4 className="text-lg font-semibold mb-6">Bizi Takip Edin</h4>
                <p className="text-gray-300 mb-6">
                  Yeni projelerimiz ve özel fırsatlardan haberdar olmak için
                  bizi takip edin.
                </p>

                {/* Newsletter */}
                <div className="mb-6">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="E-posta adresiniz"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-white transition-colors duration-200"
                    />
                    <button className="px-6 py-3 bg-white text-gray-900 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200 group"
                    >
                      <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  )}
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 group"
                    >
                      <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  )}
                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors duration-200 group"
                    >
                      <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trust Features */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex items-center space-x-3 group"
              >
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:text-gray-900 transition-colors duration-200">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-sm">{feature.title}</h5>
                  <p className="text-gray-400 text-xs">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} {siteName}. Tüm hakları saklıdır.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
              {legalLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex flex-col lg:flex-row justify-end items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="  rounded-lg flex items-center justify-center p-2 ">
                  <Image
                    src="/images/iyzico.svg"
                    alt="İyzico"
                    width={150}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="rounded-lg flex items-center justify-center p-2">
                  <Image
                    src="/images/logo_band_colored.svg"
                    alt="Logo Band"
                    width={300}
                    height={100}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
