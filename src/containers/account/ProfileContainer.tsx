"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/organisms/dialog";
import Form from "@/components/organisms/form/Form";
import { TextField, PhoneField } from "@/components/organisms/form/FormField";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Camera,
  Shield,
  Edit3,
  Save,
  X,
  Clock,
  Package,
  Star,
  CreditCard,
  Activity,
  Lock,
  CheckCircle,
  Calendar,
  MapPin,
} from "lucide-react";

// Profile update schema
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
});

// Password change schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
    newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalıdır"),
    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export default function ProfileContainer() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "stats">(
    "profile"
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Data fetching
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = trpc.user.getProfile.useQuery();

  const { data: stats, isLoading: statsLoading } =
    trpc.user.getStats.useQuery();

  // Mutations
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Profil bilgileriniz güncellendi",
        type: "success",
      });
      setIsEditingProfile(false);
      refetchUser();
    },
    onError: (error) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Şifreniz başarıyla değiştirildi",
        type: "success",
      });
      setShowPasswordDialog(false);
    },
    onError: (error) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  const handleProfileUpdate = (data: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: z.infer<typeof passwordChangeSchema>) => {
    const { currentPassword, newPassword } = data;
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Kullanıcı bilgileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Hesap Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Profil bilgilerinizi düzenleyin, güvenlik ayarlarınızı yönetin ve
            hesap aktivitelerinizi görüntüleyin
          </p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-white border-2 border-orange-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-orange-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-black">
                {user.name || "İsimsiz Kullanıcı"}
              </h2>
              <p className="text-orange-700 font-medium">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Shield className="w-4 h-4" />
                  <span>Doğrulanmış Hesap</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Üye: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Hesap Türü</p>
              <p className="font-semibold text-black capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === "profile"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
              }`}
            >
              <User className="w-4 h-4" />
              Profil Bilgileri
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === "security"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
              }`}
            >
              <Lock className="w-4 h-4" />
              Güvenlik
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === "stats"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
              }`}
            >
              <Activity className="w-4 h-4" />
              İstatistikler
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-black">
                    Kişisel Bilgiler
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Profil bilgilerinizi görüntüleyin ve güncelleyin
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {isEditingProfile ? (
                    <>
                      <X className="w-4 h-4" />
                      İptal
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      Düzenle
                    </>
                  )}
                </button>
              </div>

              {isEditingProfile ? (
                <Form
                  schema={profileUpdateSchema}
                  onSubmit={handleProfileUpdate}
                  defaultValues={{
                    name: user.name || "",
                    phone: user.phone || "",
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <TextField
                        name="name"
                        label="Ad Soyad"
                        placeholder="Adınızı ve soyadınızı girin"
                        required
                      />

                      <PhoneField
                        name="phone"
                        label="Telefon Numarası"
                        placeholder="Telefon numaranızı girin"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-medium text-black mb-4 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-orange-500" />
                          Profil Fotoğrafı
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || "Profile"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <button
                              type="button"
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              Fotoğraf Yükle
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG veya GIF (max. 2MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-6 py-2 text-gray-600 hover:text-black transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateProfileMutation.isPending
                        ? "Kaydediliyor..."
                        : "Değişiklikleri Kaydet"}
                    </button>
                  </div>
                </Form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-black mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Temel Bilgiler
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Ad Soyad
                          </label>
                          <p className="text-black mt-1">
                            {user.name || "Belirtilmemiş"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            E-posta Adresi
                          </label>
                          <p className="text-black mt-1">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Telefon Numarası
                          </label>
                          <p className="text-black mt-1">
                            {user.phone || "Belirtilmemiş"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-medium text-black mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Hesap Durumu
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Hesap Türü
                          </label>
                          <p className="text-black mt-1 capitalize">
                            {user.role.toLowerCase()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Kayıt Tarihi
                          </label>
                          <p className="text-black mt-1">
                            {new Date(user.createdAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Son Güncelleme
                          </label>
                          <p className="text-black mt-1">
                            {new Date(user.updatedAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black">
                  Güvenlik Ayarları
                </h3>
                <p className="text-gray-600 mt-1">
                  Hesabınızın güvenliğini artırmak için şifrenizi yönetin
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-medium text-black mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-purple-500" />
                      Şifre Yönetimi
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Güvenliğiniz için düzenli olarak şifrenizi değiştirmenizi
                      öneririz.
                    </p>
                    <button
                      onClick={() => setShowPasswordDialog(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Şifre Değiştir
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-4">
                      Güvenlik İpuçları
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                        En az 8 karakter uzunluğunda olmalı
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                        Büyük ve küçük harfleri içermeli
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                        En az bir sayı ve özel karakter kullanın
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                        Kişisel bilgilerinizi kullanmayın
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-black">
                  Hesap İstatistikleri
                </h3>
                <p className="text-gray-600 mt-1">
                  Rezervasyon geçmişiniz ve hesap aktiviteleriniz hakkında
                  detaylı bilgiler
                </p>
              </div>

              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-600">
                          Toplam Rezervasyon
                        </p>
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-black">
                        {stats?.bookings.total || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Tüm zamanlar</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-600">
                          Tamamlanan
                        </p>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-black">
                        {stats?.bookings.completed || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Başarılı rezervasyonlar
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-600">
                          Bekleyen
                        </p>
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <p className="text-3xl font-bold text-black">
                        {stats?.bookings.pending || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Onay bekleyen
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-red-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-600">
                          İptal Edilen
                        </p>
                        <X className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-3xl font-bold text-black">
                        {stats?.bookings.cancelled || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        İptal edilmiş
                      </p>
                    </div>
                  </div>

                  {/* Financial & Review Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-black mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        Mali Bilgiler
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Toplam Harcama
                          </p>
                          <p className="text-2xl font-bold text-black">
                            {stats?.financial.totalSpent
                              ? `${Number(
                                  stats.financial.totalSpent
                                ).toLocaleString("tr-TR")} ₺`
                              : "0 ₺"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tamamlanan rezervasyonlardan
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Ortalama Rezervasyon Tutarı
                          </p>
                          <p className="text-xl font-semibold text-black">
                            {stats?.financial.averageBookingValue
                              ? `${Number(
                                  stats.financial.averageBookingValue
                                ).toLocaleString("tr-TR")} ₺`
                              : "0 ₺"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Rezervasyon başına
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-black mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Değerlendirmeler
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Toplam Değerlendirme
                          </p>
                          <p className="text-2xl font-bold text-black">
                            {stats?.reviews.count || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Yaptığınız değerlendirmeler
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Ortalama Puanınız
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-semibold text-black">
                              {stats?.reviews.averageRating
                                ? `${Number(
                                    stats.reviews.averageRating
                                  ).toFixed(1)}`
                                : "0"}
                            </p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (stats?.reviews.averageRating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            5 üzerinden
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Password Change Dialog */}
        <Dialog
          isOpen={showPasswordDialog}
          onClose={() => setShowPasswordDialog(false)}
          title="Şifre Değiştir"
          description="Hesabınızın güvenliği için mevcut şifrenizi girin ve yeni şifrenizi belirleyin."
        >
          <div className="pt-4">
            <Form
              schema={passwordChangeSchema}
              onSubmit={handlePasswordChange}
              className="space-y-6"
            >
              <TextField
                name="currentPassword"
                label="Mevcut Şifre"
                type="password"
                required
                placeholder="Mevcut şifrenizi girin"
              />

              <TextField
                name="newPassword"
                label="Yeni Şifre"
                type="password"
                required
                placeholder="Yeni şifrenizi girin"
                helperText="En az 8 karakter, büyük-küçük harf, sayı ve özel karakter içermeli"
              />

              <TextField
                name="confirmPassword"
                label="Yeni Şifre (Tekrar)"
                type="password"
                required
                placeholder="Yeni şifrenizi tekrar girin"
              />

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className="px-6 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-8 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {changePasswordMutation.isPending
                    ? "Değiştiriliyor..."
                    : "Şifre Değiştir"}
                </button>
              </div>
            </Form>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
