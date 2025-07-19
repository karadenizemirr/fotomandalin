"use client";

import Link from "next/link";
import {
  HelpCircle,
  Camera,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  title: string;
  icon: any;
  questions: FAQItem[];
}

export default function FaqContainer() {
  const faqData: FAQItem[] = [
    {
      q: "Fotoğraf çekimi fiyatları nasıl belirleniyor?",
      a: "Fiyatlarımız çekim türü, süre ve lokasyona göre değişmektedir. Düğün fotoğrafçılığı, nişan çekimi ve diğer özel etkinlikler için farklı paketlerimiz bulunmaktadır. Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
    },
    {
      q: "Rezervasyon nasıl yapılır?",
      a: "Online rezervasyon formumuzu doldurarak veya telefon ile bizimle iletişime geçerek rezervasyon yapabilirsiniz. Rezervasyon için %30 kapora gerekmektedir.",
    },
    {
      q: "Düğün paketlerinizde neler var?",
      a: "Düğün paketlerimizde düğün öncesi ve sonrası çekimler, düğün günü tam gün çekim, düşük çözünürlüklü tüm fotoğraflar, yüksek çözünürlüklü seçili fotoğraflar ve özel düzenlemeler bulunmaktadır.",
    },
    {
      q: "Fotoğraflar ne zaman teslim edilir?",
      a: "Düğün fotoğrafları 2-3 hafta içinde, diğer etkinlik fotoğrafları ise 1-2 hafta içinde teslim edilmektedir. Acil durumlar için hızlı teslim seçeneği de mevcuttur.",
    },
    {
      q: "Hangi bölgelerde hizmet veriyorsunuz?",
      a: "Öncelikli olarak İstanbul ve çevre illerde hizmet vermekteyiz. Diğer şehirler için ulaşım ve konaklama masrafları ayrıca hesaplanmaktadır.",
    },
  ];

  const faqCategories: FAQCategory[] = [
    {
      title: "Genel Sorular",
      icon: HelpCircle,
      questions: [
        {
          q: "Fotomandalin hangi hizmetleri sunuyor?",
          a: "Profesyonel düğün fotoğrafçılığı, nişan çekimleri, doğum günü partileri, kurumsal etkinlikler, bireysel portföy çekimleri ve özel organizasyon fotoğrafçılığı hizmetleri sunuyoruz.",
        },
        {
          q: "Hangi şehirlerde hizmet veriyorsunuz?",
          a: "Öncelikli olarak İstanbul ve çevresinde hizmet vermekteyiz. Diğer şehirler için özel talepleri değerlendiriyoruz.",
        },
        {
          q: "Ekibinizde kaç kişi var?",
          a: "Profesyonel fotoğrafçılardan oluşan 5 kişilik deneyimli ekibimizle hizmet veriyoruz. Her etkinlik için uygun ekip büyüklüğünü belirliyoruz.",
        },
      ],
    },
    {
      title: "Rezervasyon ve Planlama",
      icon: Calendar,
      questions: [
        {
          q: "Rezervasyon nasıl yapılır?",
          a: "Web sitemiz üzerinden online rezervasyon yapabilir, telefon ile arayabilir veya WhatsApp hattımızdan iletişime geçebilirsiniz. Rezervasyon onayı için %30 kapora gereklidir.",
        },
        {
          q: "Ne kadar önceden rezervasyon yapmalıyım?",
          a: "Özellikle düğün sezonu (Mayıs-Ekim) için en az 3-6 ay önceden rezervasyon yapmanızı öneriyoruz. Diğer etkinlikler için 2-4 hafta yeterli olabilir.",
        },
        {
          q: "Rezervasyonu iptal edebilir miyim?",
          a: "Etkinlikten 30 gün öncesine kadar ücretsiz iptal hakkınız bulunmaktadır. Daha geç iptallerde kapora iadesi yapılmaz.",
        },
        {
          q: "Çekim tarihi değiştirilebilir mi?",
          a: "Müsait tarihler dahilinde ve etkinlikten en az 15 gün önce haber vermeniz durumunda tarih değişikliği mümkündür.",
        },
      ],
    },
    {
      title: "Fotoğraf Çekimi",
      icon: Camera,
      questions: [
        {
          q: "Çekim ne kadar sürer?",
          a: "Düğünler için 8-12 saat, nişan çekimleri 3-4 saat, doğum günü partileri 2-4 saat sürmektedir. Paketinize göre süre değişiklik gösterebilir.",
        },
        {
          q: "Hangi ekipmanları kullanıyorsunuz?",
          a: "Canon ve Nikon marka profesyonel fotoğraf makineleri, çeşitli lens seçenekleri, stüdyo aydınlatma ekipmanları ve yedek ekipmanlarımız mevcuttur.",
        },
        {
          q: "Fotoğraflar ne zaman hazır olur?",
          a: "Düzenlenmiş fotoğraflar 2-3 hafta içinde, ham fotoğraflar ise 1 hafta içinde teslim edilir. Acil durumlar için ek ücret karşılığında hızlandırılmış teslimat yapılabilir.",
        },
        {
          q: "Kaç fotoğraf teslim edilir?",
          a: "Paketinize göre değişmekle birlikte, düğünler için 300-800, nişan çekimleri için 100-200, diğer etkinlikler için 50-150 düzenlenmiş fotoğraf teslim edilir.",
        },
        {
          q: "Ham fotoğrafları alabilir miyim?",
          a: "Evet, talep etmeniz durumunda tüm ham fotoğrafları da teslim ediyoruz. Bu hizmet ek ücret gerektirebilir.",
        },
      ],
    },
    {
      title: "Ödeme ve Fiyatlandırma",
      icon: CreditCard,
      questions: [
        {
          q: "Ödeme seçenekleri nelerdir?",
          a: "Nakit, kredi kartı, havale/EFT ve taksitli ödeme seçenekleri mevcuttur. Kredi kartı ile 12 aya kadar taksit yapabilirsiniz.",
        },
        {
          q: "Kapora ne kadar ve ne zaman ödenir?",
          a: "Rezervasyon onayı için toplam tutarın %30'u kapora olarak ödenir. Kalan tutar çekim günü öncesinde tamamlanmalıdır.",
        },
        {
          q: "Fiyatlar neleri içeriyor?",
          a: "Fiyatlarımız fotoğraf çekimi, temel düzenleme, online galeri, CD/USB teslimat ve vergi dahildir. Ek hizmetler (albüm, baskı vb.) ayrıca ücretlendirilir.",
        },
        {
          q: "İndirim ve promosyon var mı?",
          a: "Erken rezervasyon indirimleri, çoklu paket indirimleri ve özel gün kampanyalarımız bulunmaktadır. Güncel kampanyalar için iletişime geçin.",
        },
      ],
    },
    {
      title: "Teslimat ve Galeri",
      icon: Star,
      questions: [
        {
          q: "Fotoğraflar nasıl teslim edilir?",
          a: "Online galeri linkini e-posta ile gönderiyoruz. Ayrıca USB veya CD ile fiziksel teslimat da yapabiliyoruz.",
        },
        {
          q: "Online galeri ne kadar süre açık kalır?",
          a: "Online galeri 1 yıl boyunca aktif kalır. Bu süre sonunda fotoğraflarınızı indirmeyi unutmayın.",
        },
        {
          q: "Fotoğrafları sosyal medyada paylaşabilir miyim?",
          a: "Evet, kişisel kullanım için sosyal medyada paylaşabilirsiniz. Ticari kullanım için izin alınması gerekir.",
        },
        {
          q: "Albüm ve baskı hizmetiniz var mı?",
          a: "Evet, premium albüm tasarımı, canvas baskılar, duvar tabloları ve fotoğraf kitapları hizmetlerimiz mevcuttur.",
        },
      ],
    },
    {
      title: "Lokasyon ve Ulaşım",
      icon: MapPin,
      questions: [
        {
          q: "Hangi mekanlarda çekim yapıyorsunuz?",
          a: "Açık hava lokasyonları, düğün salonları, restoranlar, oteller, plajlar, tarihi mekanlar ve stüdyomuzda çekim yapıyoruz.",
        },
        {
          q: "Lokasyon keşfi yapıyor musunuz?",
          a: "Evet, çekim öncesi lokasyon keşfi yaparak en iyi açıları ve zamanları belirliyoruz. Bu hizmet paketinize dahil olabilir.",
        },
        {
          q: "Şehir dışı çekimler için ek ücret var mı?",
          a: "İstanbul dışı çekimler için ulaşım ve konaklama giderleri ek olarak tahsil edilir. Detaylı bilgi için iletişime geçin.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Fotomandalin hakkında merak ettikleriniz burada
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Quick Navigation */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {faqCategories.map((category, index) => (
              <a
                key={index}
                href={`#category-${index}`}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <category.icon className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-black">{category.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqCategories.map((category, categoryIndex) => (
            <section key={categoryIndex} id={`category-${categoryIndex}`}>
              <div className="flex items-center gap-3 mb-8">
                <category.icon className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-black">
                  {category.title}
                </h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <summary className="cursor-pointer p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-black pr-4">
                          {faq.q}
                        </h3>
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full border-2 border-purple-300 flex items-center justify-center group-open:bg-purple-500 group-open:border-purple-500 transition-colors">
                            <span className="text-purple-600 group-open:text-white text-sm font-bold group-open:rotate-45 transition-transform">
                              +
                            </span>
                          </div>
                        </div>
                      </div>
                    </summary>

                    <div className="p-6 bg-white border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Sorunuzun cevabını bulamadınız mı?
          </h2>
          <p className="text-purple-100 mb-6">
            7/24 müşteri hizmetlerimiz size yardımcı olmaya hazır. Hemen
            iletişime geçin ve uzman ekibimizden destek alın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              İletişime Geçin
            </Link>
            <a
              href="tel:+905XXXXXXXXX"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors border-2 border-white"
            >
              Hemen Arayın
            </a>
          </div>
        </div>

        {/* Popular Questions */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-black mb-8 text-center">
            En Popüler Sorular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">
                💰 Fiyatlar nasıl belirleniyor?
              </h3>
              <p className="text-green-700 text-sm">
                Çekim süresi, lokasyon, ekip büyüklüğü ve teslim edilecek
                fotoğraf sayısına göre paketlerimiz belirlenmektedir.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                📱 Fotoğrafları nasıl alacağım?
              </h3>
              <p className="text-blue-700 text-sm">
                Online galeri linki e-posta ile gönderilir. USB/CD teslimat da
                yapılabilir.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-800 mb-2">
                🎭 Hangi tarzda çekim yapıyorsunuz?
              </h3>
              <p className="text-orange-700 text-sm">
                Klasik, modern, vintage, candid, sanatsal ve özel isteklerinize
                göre tarzlar sunuyoruz.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-800 mb-2">
                ⏱️ Son dakika rezervasyon yapılır mı?
              </h3>
              <p className="text-purple-700 text-sm">
                Müsaitlik durumuna göre son dakika rezervasyonları kabul
                edilebilir. En kısa sürede iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { type FAQItem, type FAQCategory };
