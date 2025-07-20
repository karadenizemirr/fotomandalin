import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  FileText,
  Mail,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Fotomandalin",
  description:
    "Fotomandalin gizlilik politikası. Kişisel verilerinizin nasıl korunduğunu ve işlendiğini öğrenin.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-blue-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Gizlilik Politikası
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Kişisel verilerinizin korunması bizim için en önemli önceliktir
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
          {/* Giriş */}
          <section className="mb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Eye className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Önemli Bilgilendirme
                  </h3>
                  <p className="text-blue-700">
                    Bu gizlilik politikası, Fotomandalin olarak kişisel
                    verilerinizi nasıl topladığımız, kullandığımız, sakladığımız
                    ve koruduğumuz hakkında detaylı bilgi vermektedir. KVKK
                    (Kişisel Verilerin Korunması Kanunu) kapsamında
                    hazırlanmıştır.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Veri Sorumlusu */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                1. Veri Sorumlusu
              </h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                <strong>Fotomandalin</strong> olarak, kişisel verilerinizin
                işlenmesine ilişkin amaçları ve vasıtaları belirleyen, veri
                işleme sisteminin kurulmasından ve yönetilmesinden sorumlu olan
                veri sorumlusuyuz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <strong>Şirket:</strong> Fotomandalin
                </div>
                <div>
                  <strong>E-posta:</strong> kvkk@fotomandalin.com
                </div>
                <div>
                  <strong>Telefon:</strong> +90 (XXX) XXX XX XX
                </div>
                <div>
                  <strong>Adres:</strong> İstanbul, Türkiye
                </div>
              </div>
            </div>
          </section>

          {/* Toplanan Veriler */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                2. Toplanan Kişisel Veriler
              </h2>
            </div>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.1 Kimlik Verileri
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Ad, soyad</li>
              <li>• Doğum tarihi (yaş kontrolü için)</li>
              <li>• TC kimlik numarası (fatura kesimi için)</li>
              <li>• Fotoğraf (çekim sırasında)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.2 İletişim Verileri
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Telefon numarası</li>
              <li>• E-posta adresi</li>
              <li>• Posta adresi</li>
              <li>• Sosyal medya hesap bilgileri (isteğe bağlı)</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.3 Finansal Veriler
            </h3>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Kredi kartı bilgileri (güvenli ödeme sistemi ile)</li>
              <li>• Banka hesap bilgileri (havale ödemeleri için)</li>
              <li>• Fatura bilgileri</li>
            </ul>

            <h3 className="text-xl font-semibold text-black mb-4">
              2.4 Çekim Verileri
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Çekim tarihi ve saati</li>
              <li>• Lokasyon bilgileri</li>
              <li>• Özel istekler ve notlar</li>
              <li>• Çekilen fotoğraf ve videolar</li>
            </ul>
          </section>

          {/* Veri Toplama Yöntemleri */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              3. Veri Toplama Yöntemleri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Doğrudan Toplama
                </h3>
                <ul className="space-y-1 text-green-700 text-sm">
                  <li>• Online rezervasyon formu</li>
                  <li>• Telefon görüşmeleri</li>
                  <li>• E-posta iletişimi</li>
                  <li>• Yüz yüze görüşmeler</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">
                  Otomatik Toplama
                </h3>
                <ul className="space-y-1 text-purple-700 text-sm">
                  <li>• Web sitesi çerezleri</li>
                  <li>• IP adresi</li>
                  <li>• Tarayıcı bilgileri</li>
                  <li>• Sayfa görüntüleme verileri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veri İşleme Amaçları */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              4. Veri İşleme Amaçları ve Hukuki Dayanaklar
            </h2>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2">Hizmet Sunumu</h3>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Amaç:</strong> Fotoğrafçılık hizmetlerinin sunulması,
                  rezervasyon yönetimi
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Hukuki Dayanak:</strong> Sözleşmenin kurulması ve
                  ifası
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2">
                  İletişim ve Müşteri Hizmetleri
                </h3>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Amaç:</strong> Müşteri iletişimi, destek hizmetleri,
                  bilgilendirme
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Hukuki Dayanak:</strong> Meşru menfaat, açık rıza
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2">
                  Pazarlama ve Tanıtım
                </h3>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Amaç:</strong> Pazarlama faaliyetleri, yeni hizmet
                  tanıtımları
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Hukuki Dayanak:</strong> Açık rıza (isteğe bağlı)
                </p>
              </div>
            </div>
          </section>

          {/* Veri Paylaşımı */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                5. Veri Paylaşımı ve Aktarımı
              </h2>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Üçüncü Taraf Paylaşımları
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>
                  • <strong>Ödeme kuruluşları:</strong> Güvenli ödeme işlemleri
                  için
                </li>
                <li>
                  • <strong>Kargo şirketleri:</strong> Albüm ve ürün teslimatı
                  için
                </li>
                <li>
                  • <strong>Bulut depolama:</strong> Fotoğraf yedekleme ve
                  erişim için
                </li>
                <li>
                  • <strong>Hukuki yükümlülükler:</strong> Yasal zorunluluklar
                  durumunda
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              Kişisel verileriniz, yukarıda belirtilen durumlar dışında üçüncü
              taraflarla paylaşılmaz. Tüm paylaşımlar veri koruma anlaşmaları
              çerçevesinde gerçekleştirilir.
            </p>
          </section>

          {/* Veri Güvenliği */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-black m-0">
                6. Veri Güvenliği
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Teknik Önlemler</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• SSL şifreleme (HTTPS)</li>
                  <li>• Güvenlik duvarı koruması</li>
                  <li>• Düzenli güvenlik güncellemeleri</li>
                  <li>• Şifrelenmiş veri depolama</li>
                  <li>• Düzenli yedekleme</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-black">İdari Önlemler</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Erişim kontrolü ve yetkilendirme</li>
                  <li>• Personel eğitimleri</li>
                  <li>• Gizlilik sözleşmeleri</li>
                  <li>• Düzenli güvenlik denetimleri</li>
                  <li>• Olay müdahale planları</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veri Saklama */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              7. Veri Saklama Süreleri
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-black">
                  Müşteri iletişim bilgileri
                </span>
                <span className="text-orange-600 font-semibold">5 yıl</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-black">
                  Fotoğraflar ve çekim verileri
                </span>
                <span className="text-orange-600 font-semibold">10 yıl</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-black">
                  Finansal veriler (fatura vb.)
                </span>
                <span className="text-orange-600 font-semibold">10 yıl</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-black">
                  Web sitesi çerezleri
                </span>
                <span className="text-orange-600 font-semibold">1 yıl</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mt-4">
              * Saklama süreleri yasal yükümlülükler ve iş gereksinimlerine göre
              belirlenmektedir.
            </p>
          </section>

          {/* Veri Sahibi Hakları */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              8. Veri Sahibi Hakları
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-800 mb-4 font-semibold">
                KVKK kapsamında sahip olduğunuz haklar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-blue-700">
                  <li>• Bilgi talep etme</li>
                  <li>• Verilere erişim</li>
                  <li>• Düzeltme talebi</li>
                  <li>• Silme talebi</li>
                </ul>
                <ul className="space-y-2 text-blue-700">
                  <li>• İşlemeye itiraz</li>
                  <li>• Taşınabilirlik</li>
                  <li>• Otomatik karar vermeye itiraz</li>
                  <li>• Tazminat talebi</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Çerezler */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              9. Çerez Politikası
            </h2>

            <p className="text-gray-700 mb-4">
              Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler
              kullanılmaktadır. Çerez kullanımı hakkında detaylı bilgi için
              <Link
                href="/cookies"
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                Çerez Politikamızı
              </Link>{" "}
              inceleyebilirsiniz.
            </p>
          </section>

          {/* İletişim */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">
              10. İletişim ve Başvuru
            </h2>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Veri koruma haklarınızı kullanmak veya sorularınız için bizimle
                iletişime geçin:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-black">KVKK E-posta</p>
                      <p className="text-gray-600">kvkk@fotomandalin.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-black">Telefon</p>
                      <p className="text-gray-600">+90 (XXX) XXX XX XX</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href="/contact"
                    className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    İletişim Formu
                  </Link>
                  <p className="text-sm text-gray-600 mt-2">
                    Başvurularınız 30 gün içinde cevaplanır.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
