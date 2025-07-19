import { Metadata } from "next";
import Link from "next/link";
import {
  Cookie,
  Settings,
  Eye,
  Shield,
  BarChart3,
  Target,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Çerez Politikası | Fotomandalin",
  description:
    "Fotomandalin çerez politikası. Web sitemizde kullanılan çerezler ve gizlilik ayarları hakkında bilgi.",
};

export default function CookiesPage() {
  const cookieTypes = [
    {
      type: "Gerekli Çerezler",
      icon: Shield,
      color: "green",
      required: true,
      description: "Web sitesinin temel fonksiyonları için zorunlu çerezler",
      examples: [
        "Oturum yönetimi",
        "Güvenlik koruması",
        "Form verilerinin saklanması",
        "Dil tercihleri",
      ],
    },
    {
      type: "Performans Çerezleri",
      icon: BarChart3,
      color: "blue",
      required: false,
      description: "Web sitesi performansını analiz etmek için kullanılır",
      examples: [
        "Sayfa yükleme süreleri",
        "Hata raporlama",
        "Site kullanım istatistikleri",
        "A/B test verileri",
      ],
    },
    {
      type: "Analitik Çerezler",
      icon: Eye,
      color: "purple",
      required: false,
      description: "Ziyaretçi davranışlarını anlamak için kullanılır",
      examples: [
        "Google Analytics",
        "Sayfa görüntüleme sayıları",
        "Ziyaretçi demografik verileri",
        "İçerik popülerlik analizi",
      ],
    },
    {
      type: "Pazarlama Çerezleri",
      icon: Target,
      color: "orange",
      required: false,
      description: "Kişiselleştirilmiş reklamlar için kullanılır",
      examples: [
        "Facebook Pixel",
        "Google Ads çerezleri",
        "Retargeting verileri",
        "İlgi alanı bazlı reklamlar",
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: "bg-green-50 border-green-200 text-green-800",
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Cookie className="w-16 h-16 mx-auto mb-6 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Çerez Politikası
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Web sitemizde kullanılan çerezler ve gizlilik ayarları hakkında
              bilgi
            </p>
            <div className="text-sm text-gray-500">
              Son güncelleme: 18 Temmuz 2025
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Çerez Nedir */}
        <section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <Cookie className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Çerez Nedir?
                </h3>
                <p className="text-amber-700">
                  Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza
                  kaydedilen küçük metin dosyalarıdır. Bu dosyalar, web
                  sitesinin daha iyi çalışmasını sağlar ve size daha iyi bir
                  deneyim sunar. Çerezler kişisel olarak sizi tanımlamaz, ancak
                  cihazınızı tanıyabilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Çerez Türleri */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-8">
            Kullandığımız Çerez Türleri
          </h2>

          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <div
                key={index}
                className={`border rounded-lg p-6 ${getColorClasses(
                  cookie.color
                )}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <cookie.icon className="w-6 h-6" />
                    <h3 className="text-xl font-semibold">{cookie.type}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {cookie.required ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">
                        Zorunlu
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                        İsteğe Bağlı
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-4 opacity-90">{cookie.description}</p>

                <div>
                  <h4 className="font-medium mb-2">Örnekler:</h4>
                  <ul className="space-y-1 opacity-80">
                    {cookie.examples.map((example, exampleIndex) => (
                      <li
                        key={exampleIndex}
                        className="flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-current rounded-full"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Çerez Tablosu */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">
            Detaylı Çerez Listesi
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-black">
                    Çerez Adı
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-black">
                    Tür
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-black">
                    Süre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-black">
                    Amaç
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-mono text-sm">session_id</td>
                  <td className="px-4 py-3 text-sm">Gerekli</td>
                  <td className="px-4 py-3 text-sm">Oturum</td>
                  <td className="px-4 py-3 text-sm">
                    Kullanıcı oturumu yönetimi
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">csrf_token</td>
                  <td className="px-4 py-3 text-sm">Gerekli</td>
                  <td className="px-4 py-3 text-sm">Oturum</td>
                  <td className="px-4 py-3 text-sm">Güvenlik koruması</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-sm">
                    lang_preference
                  </td>
                  <td className="px-4 py-3 text-sm">Gerekli</td>
                  <td className="px-4 py-3 text-sm">1 yıl</td>
                  <td className="px-4 py-3 text-sm">Dil tercihi</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">_ga</td>
                  <td className="px-4 py-3 text-sm">Analitik</td>
                  <td className="px-4 py-3 text-sm">2 yıl</td>
                  <td className="px-4 py-3 text-sm">
                    Google Analytics - Ziyaretçi tanımlama
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-sm">_gid</td>
                  <td className="px-4 py-3 text-sm">Analitik</td>
                  <td className="px-4 py-3 text-sm">1 gün</td>
                  <td className="px-4 py-3 text-sm">
                    Google Analytics - Günlük istatistik
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">_fbp</td>
                  <td className="px-4 py-3 text-sm">Pazarlama</td>
                  <td className="px-4 py-3 text-sm">3 ay</td>
                  <td className="px-4 py-3 text-sm">
                    Facebook Pixel - Reklam takibi
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-sm">
                    cookie_consent
                  </td>
                  <td className="px-4 py-3 text-sm">Gerekli</td>
                  <td className="px-4 py-3 text-sm">1 yıl</td>
                  <td className="px-4 py-3 text-sm">Çerez onay tercihleri</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Çerez Yönetimi */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-black m-0">
              Çerez Ayarları
            </h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-800 mb-4">
              Çerez Tercihlerinizi Yönetme
            </h3>
            <p className="text-blue-700 mb-4">
              Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
              Gerekli çerezler web sitesinin temel fonksiyonları için zorunludur
              ve devre dışı bırakılamaz.
            </p>

            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
              Çerez Ayarlarını Aç
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-black">Tarayıcı Ayarları</h3>
              <p className="text-gray-700 text-sm">
                Çoğu tarayıcı çerezleri otomatik olarak kabul eder, ancak
                tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilir veya
                belirli türdeki çerezleri engelleyebilirsiniz.
              </p>

              <div className="space-y-2 text-sm">
                <div>
                  <strong>Chrome:</strong> Ayarlar {`>`} Gizlilik ve güvenlik{" "}
                  {`>`} Çerezler
                </div>
                <div>
                  <strong>Firefox:</strong> Ayarlar {`>`} Gizlilik ve Güvenlik
                </div>
                <div>
                  <strong>Safari:</strong> Ayarlar {`>`} Gizlilik {`>`}{" "}
                  Çerezleri yönet
                </div>
                <div>
                  <strong>Edge:</strong> Ayarlar {`>`} Çerezler ve site izinleri
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-black">Mobil Cihazlar</h3>
              <p className="text-gray-700 text-sm">
                Mobil cihazlarda çerez ayarları tarayıcı uygulamasının ayarlar
                menüsünden yapılabilir.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-black mb-2">Önemli Not</h4>
                <p className="text-gray-600 text-sm">
                  Çerezleri devre dışı bırakmanız durumunda web sitesinin bazı
                  özellikleri düzgün çalışmayabilir veya hiç çalışmayabilir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Üçüncü Taraf Hizmetleri */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-black m-0">
              Üçüncü Taraf Hizmetleri
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-2">
                Google Analytics
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Web sitesi trafiğini ve kullanıcı davranışlarını analiz etmek
                için kullanılır.
              </p>
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Google Analytics'i Devre Dışı Bırak →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-2">Facebook Pixel</h3>
              <p className="text-gray-700 text-sm mb-3">
                Sosyal medya reklamlarının etkinliğini ölçmek için kullanılır.
              </p>
              <a
                href="https://www.facebook.com/privacy/explanation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Facebook Gizlilik Ayarları →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-2">Google Ads</h3>
              <p className="text-gray-700 text-sm mb-3">
                Kişiselleştirilmiş reklamlar sunmak için kullanılır.
              </p>
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Google Reklam Ayarları →
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-black mb-2">YouTube</h3>
              <p className="text-gray-700 text-sm mb-3">
                Video içeriklerinin görüntülenmesi için gerekli çerezler.
              </p>
              <a
                href="https://support.google.com/youtube/answer/171780"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                YouTube Gizlilik Politikası →
              </a>
            </div>
          </div>
        </section>

        {/* İletişim */}
        <section className="mb-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-black mb-4">
              Sorularınız için
            </h2>
            <p className="text-gray-700 mb-4">
              Çerez politikamız hakkında sorularınız varsa bizimle iletişime
              geçebilirsiniz:
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-center"
              >
                İletişim Formu
              </Link>
              <Link
                href="/privacy"
                className="px-6 py-3 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium text-center"
              >
                Gizlilik Politikası
              </Link>
            </div>
          </div>
        </section>

        {/* Güncelleme Bilgisi */}
        <section className="text-center text-gray-600 text-sm">
          <p>
            Bu çerez politikası düzenli olarak gözden geçirilir ve gerektiğinde
            güncellenir. Değişiklikler bu sayfada yayınlanacaktır.
          </p>
        </section>
      </div>
    </div>
  );
}
