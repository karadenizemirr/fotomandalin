"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  TextareaField,
  EmailField,
} from "@/components/organisms/form/FormField";
import { z } from "zod";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Instagram,
  Facebook,
  Twitter,
  Camera,
  MessageCircle,
  Building,
  Globe,
} from "lucide-react";

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır"),
  message: z.string().min(20, "Mesaj en az 20 karakter olmalıdır"),
});

export default function ContactContainer() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch site settings from system settings
  const { data: siteSettings, isLoading } =
    trpc.systemSettings.getSiteSettings.useQuery();

  // Contact form submission mutation
  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: (result) => {
      addToast({
        title: "Mesajınız Gönderildi",
        message: result.message,
        type: "success",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      addToast({
        title: "Hata",
        message: error.message || "Mesaj gönderilirken bir hata oluştu.",
        type: "error",
      });
      setIsSubmitting(false);
    },
  });

  const handleContactSubmit = async (
    data: z.infer<typeof contactFormSchema>
  ) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-12"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const socialMedia = {
    instagram: siteSettings?.instagramUrl,
    facebook: siteSettings?.facebookUrl,
    twitter: siteSettings?.twitterUrl,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {siteSettings?.description ||
                "Profesyonel fotoğrafçılık hizmetleri hakkında merak ettiklerinizi öğrenmek için bize ulaşın"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <Camera className="w-6 h-6 text-orange-500" />
              <span className="text-lg font-medium text-gray-800">
                {siteSettings?.siteName || "FotoMandalin"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">
                İletişim Bilgileri
              </h2>
              <p className="text-gray-600 mb-8">
                Size en iyi hizmeti verebilmek için buradayız. Sorularınızı
                yanıtlamaktan mutluluk duyarız.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Email */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black mb-2">E-posta</h3>
                    <p className="text-gray-600 mb-2">
                      7/24 e-posta desteği ile size yardımcı olmaya hazırız
                    </p>
                    <a
                      href={`mailto:${siteSettings?.contactEmail}`}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {siteSettings?.contactEmail || "info@fotomandalin.com"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black mb-2">Telefon</h3>
                    <p className="text-gray-600 mb-2">
                      Doğrudan konuşmak için bizi arayabilirsiniz
                    </p>
                    <a
                      href={`tel:${siteSettings?.contactPhone}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {siteSettings?.contactPhone || "+90 (555) 123 45 67"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-black mb-2">
                      Çalışma Saatleri
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                      <p>Cumartesi: 10:00 - 16:00</p>
                      <p className="text-sm text-gray-500">Pazar: Kapalı</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Sosyal Medya
              </h3>
              <p className="text-gray-600 mb-4">
                Güncel çalışmalarımızı ve duyurularımızı takip edin
              </p>
              <div className="flex gap-4">
                {socialMedia?.instagram && (
                  <a
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                )}
                {socialMedia?.facebook && (
                  <a
                    href={socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                )}
                {socialMedia?.twitter && (
                  <a
                    href={socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-orange-500" />
                Mesaj Gönderin
              </h2>
              <p className="text-gray-600">
                Aşağıdaki formu kullanarak bize mesaj gönderebilirsiniz. En kısa
                sürede size dönüş yapacağız.
              </p>
            </div>

            <Form
              schema={contactFormSchema}
              onSubmit={handleContactSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  name="name"
                  label="Ad Soyad"
                  placeholder="Adınızı ve soyadınızı girin"
                  required
                />

                <EmailField
                  name="email"
                  label="E-posta"
                  placeholder="E-posta adresinizi girin"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  name="phone"
                  label="Telefon"
                  placeholder="Telefon numaranızı girin"
                  required
                />

                <TextField
                  name="subject"
                  label="Konu"
                  placeholder="Mesajınızın konusunu girin"
                  required
                />
              </div>

              <TextareaField
                name="message"
                label="Mesajınız"
                placeholder="Mesajınızı buraya yazın..."
                rows={6}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Gizlilik Garantisi
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Kişisel bilgileriniz güvende. Verilerinizi asla üçüncü
                      taraflarla paylaşmayız.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Mesaj Gönder
                  </>
                )}
              </button>
            </Form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">
              Profesyonel Hizmet
            </h3>
            <p className="text-gray-600 text-sm">
              Yılların deneyimi ile size en kaliteli fotoğrafçılık hizmetini
              sunuyoruz
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">Hızlı Yanıt</h3>
            <p className="text-gray-600 text-sm">
              Tüm sorularınızı 24 saat içinde yanıtlıyoruz
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-black mb-2">
              Güvenilir İşbirliği
            </h3>
            <p className="text-gray-600 text-sm">
              Müşteri memnuniyeti önceliğimiz, kaliteli hizmet garantimiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
