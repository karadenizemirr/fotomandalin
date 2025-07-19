import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  FileText,
  Calendar,
  Camera,
  CreditCard,
  Users,
  AlertTriangle,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Fotomandalin",
  description:
    "Fotomandalin fotoğrafçılık hizmetleri kullanım koşulları ve şartları. Hizmet şartlarımızı okuyun.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Scale className="w-16 h-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Kullanım Koşulları
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Fotomandalin fotoğrafçılık hizmetlerini kullanırken geçerli olan
              şart ve koşullar
            </p>
            <div className="text-sm text-gray-500">
              Son güncelleme: 18 Temmuz 2025
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          {/* Genel Bilgiler */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                1. Genel Bilgiler
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                Bu kullanım koşulları, Fotomandalin ("Şirket", "biz", "bizim")
                tarafından sunulan fotoğrafçılık hizmetlerinin kullanımına
                ilişkin şart ve koşulları belirler. Hizmetlerimizi kullanarak bu
                koşulları kabul etmiş sayılırsınız.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              1.1 Hizmet Kapsamı
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Profesyonel fotoğraf çekimi hizmetleri</li>
              <li>
                • Düğün, nişan, doğum günü ve özel etkinlik fotoğrafçılığı
              </li>
              <li>• Kurumsal ve portre fotoğrafçılık</li>
              <li>• Fotoğraf editleme ve albüm hazırlama</li>
            </ul>
          </section>

          {/* Rezervasyon Koşulları */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                2. Rezervasyon Koşulları
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.1 Rezervasyon Süreci
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>
                • Rezervasyonlar online platform üzerinden veya telefon ile
                yapılabilir
              </li>
              <li>• Rezervasyon kesinleşmesi için ön ödeme gereklidir</li>
              <li>
                • Tarih ve saat değişiklikleri mümkün olduğunca esnek şekilde
                değerlendirilir
              </li>
              <li>• Son dakika rezervasyonları ek ücrete tabi olabilir</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.2 İptal Koşulları
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-yellow-800">
                  <p className="font-semibold mb-2">İptal Politikası</p>
                  <ul className="space-y-1 text-sm">
                    <li>• 7 gün öncesine kadar: %100 iade</li>
                    <li>• 3-7 gün arası: %50 iade</li>
                    <li>• 3 günden az: İade yok</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Ödeme Koşulları */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                3. Ödeme Koşulları
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              3.1 Ödeme Yöntemleri
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Kredi kartı (Visa, Mastercard, American Express)</li>
              <li>• Banka havalesi</li>
              <li>• Nakit ödeme (önceden anlaşmalı durumlar)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              3.2 Ödeme Planı
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Rezervasyon sırasında: %30 ön ödeme</li>
              <li>• Çekim günü: Kalan tutarın ödenmesi</li>
              <li>• Paket dışı ek hizmetler çekim sonrası faturalandırılır</li>
            </ul>
          </section>

          {/* Çekim Koşulları */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                4. Çekim Koşulları
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              4.1 Çekim Süresi ve Kapsamı
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Çekim süresi seçilen pakete göre belirlenir</li>
              <li>• Overtime ücretlendirmesi saatlik bazda hesaplanır</li>
              <li>• Lokasyon değişiklikleri ek ücrete tabi olabilir</li>
              <li>
                • Hava koşulları nedeniyle iptal durumunda yeni tarih belirlenir
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              4.2 Müşteri Sorumlulukları
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Çekim saatine dakik gelme</li>
              <li>• Gerekli izinlerin alınması (özel mekanlar için)</li>
              <li>• Çekim için uygun giysi seçimi</li>
              <li>• Güvenlik ve hijyen kurallarına uyum</li>
            </ul>
          </section>

          {/* Telif Hakları */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                5. Telif Hakları ve Kullanım
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              5.1 Fotoğraf Hakları
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-blue-800">
                <li>
                  • Çekilen fotoğrafların telif hakları Fotomandalin'e aittir
                </li>
                <li>
                  • Müşteri, fotoğrafları kişisel kullanım için kullanabilir
                </li>
                <li>• Ticari kullanım için önceden yazılı izin gereklidir</li>
                <li>• Fotoğrafların kalitesinde değişiklik yapılamaz</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              5.2 Portfolio Kullanımı
            </h3>
            <p className="text-gray-700 mb-4">
              Fotomandalin, çekilen fotoğrafları portfolio, sosyal medya ve
              pazarlama materyallerinde kullanma hakkına sahiptir. Müşteri bu
              konuda farklı bir talebinde bulunursa, önceden belirtmelidir.
            </p>
          </section>

          {/* Sorumluluk Sınırlamaları */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                6. Sorumluluk Sınırlamaları
              </h2>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Önemli Bildirim
              </h3>
              <ul className="space-y-2 text-red-700">
                <li>
                  • Teknik arıza nedeniyle veri kaybında sorumluluk sınırlıdır
                </li>
                <li>
                  • Force majeure durumlarında (doğal afet, salgın vb.)
                  yükümlülükler askıya alınır
                </li>
                <li>
                  • Üçüncü şahısların neden olduğu zararlardan sorumlu değiliz
                </li>
                <li>
                  • Çekim sırasında oluşabilecek kaza ve yaralanmalardan sorumlu
                  değiliz
                </li>
              </ul>
            </div>
          </section>

          {/* Gizlilik */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                7. Gizlilik ve Veri Koruma
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Müşteri bilgileri ve çekilen fotoğraflar gizlilik ilkelerimize
              uygun şekilde saklanır ve işlenir. Detaylı bilgi için
              <Link
                href="/privacy"
                className="text-orange-600 hover:text-orange-700 ml-1"
              >
                Gizlilik Politikamızı
              </Link>{" "}
              inceleyebilirsiniz.
            </p>
          </section>

          {/* Değişiklikler */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">
              8. Koşullarda Değişiklik
            </h2>
            <p className="text-gray-700">
              Bu kullanım koşulları gerektiğinde güncellenebilir. Önemli
              değişiklikler müşterilerimize önceden bildirilir. Güncel koşullar
              her zaman web sitemizde yayınlanır.
            </p>
          </section>

          {/* İletişim */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-4">9. İletişim</h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Bu kullanım koşulları hakkında sorularınız için bizimle
                iletişime geçebilirsiniz:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>E-posta:</strong> info@fotomandalin.com
                </p>
                <p>
                  <strong>Telefon:</strong> +90 (XXX) XXX XX XX
                </p>
                <p>
                  <strong>Adres:</strong> İstanbul, Türkiye
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-block mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                İletişim Formu
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
