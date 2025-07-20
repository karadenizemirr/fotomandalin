"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Camera,
  Calendar,
  CreditCard,
  MapPin,
  Star,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Filter,
} from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  questions: FAQItem[];
}

export default function FaqContainer() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const faqCategories: FAQCategory[] = [
    {
      id: "general",
      title: "Genel Bilgiler",
      description: "Fotomandalin hakkında temel bilgiler ve hizmet kapsamı",
      icon: HelpCircle,
      color: "bg-blue-500",
      questions: [
        {
          id: "services",
          question: "Fotomandalin hangi fotoğrafçılık hizmetleri sunuyor?",
          answer: "Fotomandalin olarak profesyonel düğün fotoğrafçılığı, nişan çekimleri, doğum günü partileri, bebek ve hamilelik çekimleri, aile portföy çekimleri, kurumsal etkinlik fotoğrafçılığı, mezuniyet çekimleri, bireysel portföy çekimleri ve özel organizasyon fotoğrafçılığı hizmetleri sunuyoruz. Tüm çekimlerimizde son model profesyonel ekipmanlar kullanıyoruz.",
          keywords: ["düğün fotoğrafçısı", "nişan çekimi", "doğum günü", "bebek çekimi", "aile fotoğrafı"]
        },
        {
          id: "locations",
          question: "Hangi şehirlerde profesyonel fotoğraf çekimi hizmeti veriyorsunuz?",
          answer: "Ana hizmet bölgemiz İstanbul ve çevre illeridir (Kocaeli, Sakarya, Tekirdağ, Bursa). Ankara, İzmir ve diğer büyük şehirlerdeki özel talepleri de değerlendiriyoruz. Şehir dışı çekimler için ulaşım ve konaklama masrafları ayrıca hesaplanır.",
          keywords: ["İstanbul fotoğrafçı", "şehir dışı çekim", "lokasyon"]
        },
        {
          id: "experience",
          question: "Fotomandalin ekibinin deneyimi nasıl?",
          answer: "15 yıllık fotoğrafçılık deneyimi ile sektörde köklü bir geçmişe sahibiz. Ekibimizde profesyonel fotoğrafçılar, video uzmanları ve dijital tasarım uzmanları bulunmaktadır. Bugüne kadar 1000'den fazla düğün ve etkinlik çekimi gerçekleştirdik.",
          keywords: ["deneyimli fotoğrafçı", "profesyonel ekip", "referanslar"]
        },
        {
          id: "portfolio",
          question: "Çekim örneklerinizi nasıl görüntüleyebilirim?",
          answer: "Web sitemizin galeri bölümünde farklı kategorilerde çekim örneklerimizi inceleyebilirsiniz. Instagram hesabımız @fotomandalin'den de güncel çalışmalarımızı takip edebilir, müşteri yorumlarını okuyabilirsiniz.",
          keywords: ["galeri", "portfolio", "örnekler", "referans çalışmalar"]
        }
      ]
    },
    {
      id: "booking",
      title: "Rezervasyon ve Planlama",
      description: "Online rezervasyon süreci, tarih planlama ve organizasyon",
      icon: Calendar,
      color: "bg-green-500",
      questions: [
        {
          id: "how-to-book",
          question: "Online fotoğraf çekimi rezervasyonu nasıl yapılır?",
          answer: "Web sitemizin 'Rezervasyon' bölümünden kolayca rezervasyon yapabilirsiniz. Çekim türünü seçin, tarih ve saat belirleyin, paket seçiminizi yapın ve ödeme bilgilerinizi girin. Alternatif olarak +90 (555) 123-4567 numaralı telefon hattımızdan veya WhatsApp üzerinden iletişime geçebilirsiniz.",
          keywords: ["online rezervasyon", "randevu alma", "rezervasyon sistemi"]
        },
        {
          id: "advance-booking",
          question: "Düğün fotoğrafçısı için ne kadar önceden rezervasyon yapmalıyım?",
          answer: "Düğün sezonu (Mayıs-Ekim arası) için en az 6-12 ay önceden rezervasyon yapmanızı şiddetle öneriyoruz. Kış aylarındaki düğünler için 3-6 ay yeterli olabilir. Nişan, doğum günü gibi diğer etkinlikler için 2-4 hafta önceden rezervasyon yeterlidir.",
          keywords: ["düğün rezervasyonu", "erken rezervasyon", "müsaitlik"]
        },
        {
          id: "cancellation",
          question: "Rezervasyon iptali ve değişiklik koşulları nelerdir?",
          answer: "Çekim tarihinden 30 gün öncesine kadar ücretsiz iptal hakkınız bulunur ve kapora %100 iade edilir. 15-30 gün arası iptallerde %50 kapora iadesi yapılır. 15 günden sonraki iptallerde kapora iade edilmez. Tarih değişikliği müsaitlik dahilinde ücretsizdir.",
          keywords: ["rezervasyon iptali", "tarih değişikliği", "kapora iadesi"]
        },
        {
          id: "consultation",
          question: "Çekim öncesi konsültasyon ve planlama toplantısı var mı?",
          answer: "Evet, özellikle düğün çekimleri için çekim öncesi detaylı planlama toplantısı yapıyoruz. Bu toplantıda çekim planını, özel isteklerinizi, lokasyon keşfini ve çekim akışını birlikte belirleriz. Bu hizmet paket fiyatına dahildir.",
          keywords: ["ön görüşme", "planlama toplantısı", "çekim planı"]
        }
      ]
    },
    {
      id: "photography",
      title: "Fotoğraf Çekimi",
      description: "Çekim süreci, ekipman, teknik detaylar ve çalışma şekli",
      icon: Camera,
      color: "bg-purple-500",
      questions: [
        {
          id: "duration",
          question: "Fotoğraf çekimi ne kadar sürer ve nasıl planlanır?",
          answer: "Düğün çekimleri 8-12 saat (hazırlıktan eğlenceye kadar), nişan çekimleri 3-4 saat, doğum günü partileri 3-5 saat, aile portföy çekimleri 1-2 saat sürer. Çekim süresi seçtiğiniz pakete ve özel isteklerinize göre değişkenlik gösterebilir.",
          keywords: ["çekim süresi", "düğün çekimi", "etkinlik fotoğrafçılığı"]
        },
        {
          id: "equipment",
          question: "Hangi profesyonel fotoğraf ekipmanlarını kullanıyorsunuz?",
          answer: "Canon R5, Canon 5D Mark IV ve Nikon Z9 gibi son model profesyonel fotoğraf makineleri kullanıyoruz. 24-70mm, 85mm, 135mm ve geniş açı lenslerin yanında profesyonel stüdyo aydınlatma sistemleri, reflektörler ve yedek ekipmanlarımız mevcuttur.",
          keywords: ["profesyonel ekipman", "Canon", "Nikon", "lens"]
        },
        {
          id: "styles",
          question: "Hangi fotoğraf çekim tarzları ve stilleri uyguluyorsunuz?",
          answer: "Doğal ve samimi anları yakaladığımız photojournalistic tarz, romantik ve dreamy portreler, modern ve minimal kompozisyonlar, vintage ve film tadında renkler sunuyoruz. Çekim öncesi görüşmede tercih ettiğiniz tarzı belirleriz.",
          keywords: ["fotoğraf tarzı", "photojournalistic", "romantik", "vintage"]
        },
        {
          id: "weather",
          question: "Hava koşulları çekimi nasıl etkiler?",
          answer: "Açık hava çekimleri için hava durumu takibi yapıyoruz. Yağmur durumunda alternatif kapalı mekan önerilerimiz hazırdır. Kar ve güneşli hava koşulları da atmosferik fotoğraflar için fırsat oluşturur. Tüm senaryolar için ekipmanımız hazırdır.",
          keywords: ["hava durumu", "yağmur", "açık hava çekimi"]
        }
      ]
    },
    {
      id: "pricing",
      title: "Fiyatlandırma ve Ödeme",
      description: "Paket fiyatları, ödeme seçenekleri ve finansal koşullar",
      icon: CreditCard,
      color: "bg-orange-500",
      questions: [
        {
          id: "pricing-factors",
          question: "Fotoğraf çekimi fiyatları nasıl belirlenir?",
          answer: "Fiyatlarımız çekim türü (düğün, nişan, doğum günü vs.), çekim süresi, lokasyon sayısı, fotoğrafçı sayısı, ek hizmetler (video, drone, albüm) ve sezon faktörlerine göre belirlenir. Her müşteri için özelleştirilmiş paket teklifleri hazırlıyoruz.",
          keywords: ["fiyat listesi", "paket fiyatları", "özelleştirilmiş teklif"]
        },
        {
          id: "payment-options",
          question: "Hangi ödeme yöntemleri kabul ediliyor?",
          answer: "Nakit, tüm banka kredi kartları (12 aya kadar taksit), havale/EFT, PayPal ve dijital cüzdan ödemeleri kabul ediyoruz. Kredi kartı ile güvenli online ödeme imkanı da sunuyoruz. Ödeme güvenliği için 3D Secure sistemi kullanıyoruz.",
          keywords: ["kredi kartı", "taksit", "online ödeme", "PayPal"]
        },
        {
          id: "deposit",
          question: "Kapora oranı ve ödeme planı nasıl?",
          answer: "Rezervasyon onayı için toplam tutarın %30'u kapora olarak ödenir. Kalan %70 çekim gününden 1 hafta önce tamamlanır. Büyük paketlerde esnek ödeme planları sunuyoruz. Kapora ödemesi rezervasyonunuzu garanti altına alır.",
          keywords: ["kapora", "ödeme planı", "%30 kapora", "rezervasyon garantisi"]
        },
        {
          id: "discounts",
          question: "İndirim ve kampanya fırsatları nelerdir?",
          answer: "Erken rezervasyon indirimi (%10-15), çoklu paket indirimi (%15-20), öğrenci indirimi (%10), sezon dışı indirimi (%20), referans indirimi (%10) sunuyoruz. Özel gün kampanyalarımızı sosyal medya hesaplarımızdan duyuruyoruz.",
          keywords: ["erken rezervasyon indirimi", "öğrenci indirimi", "kampanya"]
        }
      ]
    },
    {
      id: "delivery",
      title: "Teslimat ve Galeri",
      description: "Fotoğraf teslimati, online galeri, baskı hizmetleri",
      icon: Star,
      color: "bg-pink-500",
      questions: [
        {
          id: "delivery-time",
          question: "Düzenlenmiş fotoğraflar ne kadar sürede hazır olur?",
          answer: "Düğün fotoğrafları 3-4 hafta, nişan ve diğer etkinlik fotoğrafları 2-3 hafta içinde teslim edilir. Acil durumlar için ek ücret karşılığında 1 hafta içinde ekspres teslimat yapılabilir. Çekim sonrası 48 saat içinde ön izleme fotoğrafları paylaşılır.",
          keywords: ["teslimat süresi", "düzenlenmiş fotoğraf", "ekspres teslimat"]
        },
        {
          id: "photo-count",
          question: "Kaç adet düzenlenmiş fotoğraf teslim edilir?",
          answer: "Düğün paketlerinde 400-800, nişan çekimlerinde 150-250, doğum günü partilerinde 100-200, aile portföy çekimlerinde 50-100 düzenlenmiş fotoğraf teslim edilir. Ham fotoğraflar ayrıca talep edilebilir.",
          keywords: ["fotoğraf adedi", "düzenlenmiş fotoğraf", "ham fotoğraf"]
        },
        {
          id: "online-gallery",
          question: "Online galeri sistemi nasıl çalışır?",
          answer: "Özel şifre korumalı online galeriniz 1 yıl boyunca aktif kalır. Galeride fotoğrafları HD kalitede indirebilir, sosyal medyada paylaşabilir, beğendiğiniz fotoğrafları favorilere ekleyebilir, baskı siparişi verebilirsiniz.",
          keywords: ["online galeri", "fotoğraf indirme", "şifre korumalı galeri"]
        },
        {
          id: "printing",
          question: "Fotoğraf baskısı ve albüm hizmetleriniz nelerdir?",
          answer: "Premium düğün albümleri, canvas tablolar, poster baskılar, magnet fotoğraflar, fotoğraf kitapları ve dijital çerçeveler sunuyoruz. Tüm baskılar profesyonel laboratuvarlarda en kaliteli kağıtlarla yapılır. Özel tasarım albümleri mevcuttur.",
          keywords: ["düğün albümü", "canvas tablo", "fotoğraf baskısı", "özel tasarım"]
        }
      ]
    },
    {
      id: "location",
      title: "Lokasyon ve Mekan",
      description: "Çekim lokasyonları, mekan seçimi ve ulaşım bilgileri",
      icon: MapPin,
      color: "bg-teal-500",
      questions: [
        {
          id: "shooting-locations",
          question: "Hangi lokasyonlarda fotoğraf çekimi yapıyorsunuz?",
          answer: "Boğaz manzaralı açık alanlar, tarihi yapılar, parklar, sahil şeritleri, düğün salonları, restoranlar, oteller, kır düğünü mekanları ve stüdyomuzda çekim yapıyoruz. İstanbul'un en güzel lokasyonları için önerilerde bulunuyoruz.",
          keywords: ["çekim lokasyonu", "Boğaz manzarası", "tarihi mekanlar", "stüdyo"]
        },
        {
          id: "location-scouting",
          question: "Lokasyon keşfi ve ön hazırlık yapıyor musunuz?",
          answer: "Evet, çekim öncesi lokasyon keşfi yaparak en iyi açıları, ışık koşullarını ve çekim noktalarını belirliyoruz. Özel mekanlar için izin alma süreçlerini yönetir, backup lokasyon önerilerimizi paylaşırız. Bu hizmet paket fiyatına dahildir.",
          keywords: ["lokasyon keşfi", "ışık analizi", "izin alma", "backup plan"]
        },
        {
          id: "travel-costs",
          question: "Şehir dışı çekimler için ek ücretler nelerdir?",
          answer: "İstanbul çevre illeri (100 km yarıçap) için ek ücret yoktur. Daha uzak mesafeler için km başına 3 TL ulaşım ücreti alınır. Geceleme gereken uzak lokasyonlar için konaklama masrafları müşteri tarafından karşılanır.",
          keywords: ["şehir dışı çekim", "ulaşım ücreti", "konaklama", "mesafe"]
        }
      ]
    }
  ];

  // Tüm FAQ'leri tek listede topla
  const allFAQs = faqCategories.flatMap(category =>
    category.questions.map(q => ({ ...q, category: category.id, categoryTitle: category.title }))
  );

  // Filtreleme ve arama
  const filteredFAQs = allFAQs.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // JSON-LD Structured Data for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData)
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"></div>

          <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-8 shadow-lg">
                  <HelpCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Sıkça Sorulan
                  <span className="text-gradient bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Sorular</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Fotomandalin profesyonel fotoğrafçılık hizmetleri hakkında merak ettiklerinizin yanıtlarını burada bulabilirsiniz.
                  Aradığınızı bulamadıysanız bizimle iletişime geçmekten çekinmeyin.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Bize Sorun
                  </Link>
                  <Link
                    href="/rezervasyon"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Rezervasyon Yap
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Sorularınızı arayın... (örn: düğün fiyatları, rezervasyon)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <div className="relative">
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 appearance-none bg-white"
                    >
                      <option value="all">Tüm Kategoriler</option>
                      {faqCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Category Buttons */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "all"
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tümü
                </button>
                {faqCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeCategory === category.id
                          ? `${category.color} text-white shadow-md`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Results */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFAQs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aradığınız soru bulunamadı
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Farklı arama terimleri deneyebilir veya bizimle doğrudan iletişime geçebilirsiniz.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/iletisim"
                      className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      E-posta Gönder
                    </Link>
                    <Link
                      href="tel:+905551234567"
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Hemen Ara
                    </Link>
                  </div>
                </motion.div>
              ) : (
                filteredFAQs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <button
                      onClick={() => toggleExpanded(faq.id)}
                      className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset"
                      aria-expanded={expandedItems.includes(faq.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-3">
                              {faqCategories.find(cat => cat.id === faq.category)?.title}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 pr-8 leading-tight">
                            {faq.question}
                          </h3>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedItems.includes(faq.id) ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedItems.includes(faq.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 border-t border-gray-100">
                            <div className="pt-4">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {faq.answer}
                              </p>

                              {/* Keywords */}
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">İlgili konular:</p>
                                <div className="flex flex-wrap gap-2">
                                  {faq.keywords.map((keyword) => (
                                    <span
                                      key={keyword}
                                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                <strong>{filteredFAQs.length}</strong> soru "{searchTerm}" ile ilgili bulundu
              </p>
            </div>
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Hala sorunuz mu var?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Aradığınız cevabı bulamadıysanız, uzman ekibimiz sizinle birebir görüşmeye hazır.
                7/24 destek hattımızdan bize ulaşabilirsiniz.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Telefon</h3>
                  <p className="text-gray-300">+90 (555) 123-4567</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">E-posta</h3>
                  <p className="text-gray-300">info@fotomandalin.com</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">WhatsApp</h3>
                  <p className="text-gray-300">Hızlı cevap alın</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  İletişim Formu
                </Link>
                <Link
                  href="/rezervasyon"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Hemen Rezervasyon Yap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
