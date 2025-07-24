"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Form from "@/components/organisms/form/Form";
import FormInput from "@/components/molecules/FormInput";
import FormCheckbox from "@/components/molecules/FormCheckbox";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import { useSettingsData } from "@/hooks/useSettings";

// Zod validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "İsim en az 2 karakter olmalıdır")
      .max(50, "İsim en fazla 50 karakter olabilir"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase(),
    phone: z
      .string()
      .regex(/^(\+90|0)?[5][0-9]{9}$/, "Geçerli bir telefon numarası giriniz"),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Kullanım koşullarını kabul etmelisiniz",
    }),
    marketingEmails: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  // Get settings data for logo
  const { siteSettings, siteLoading } = useSettingsData();

  // tRPC mutation
  const registerMutation = trpc.user.register.useMutation({
    onSuccess: (data) => {
      addToast({
        type: "success",
        title: "Başarılı!",
        message:
          data.message ||
          "Hesabınız başarıyla oluşturuldu. Hemen giriş yapabilirsiniz.",
        duration: 5000,
      });

      // Başarılı kayıt sonrası login sayfasına yönlendir
      router.push("/giris-yap");
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Hata!",
        message: error.message || "Kayıt işlemi başarısız oldu",
        duration: 7000,
      });
    },
  });

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
    } catch (error) {
      // Error handling is done in onError callback
      console.error("Register error:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white relative">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
            title="Anasayfaya dön"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:min-w-lg">
          {/* Header */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              {siteSettings?.logo && !siteLoading ? (
                <Image
                  src={siteSettings.logo}
                  alt="Fotomandalin Logo"
                  width={40}
                  height={40}
                  className="rounded-sm object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
              )}
              <span className="text-2xl font-semibold text-black font-mono">
                {siteSettings?.siteName || "Fotomandalin"}
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 font-mono">
              Hesap Oluşturun
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Özel anlarınızı ölümsüzleştirmek için{" "}
              <span className="font-medium text-amber-600">ücretsiz hesap</span>{" "}
              oluşturun
            </p>
          </div>

          {/* Form Container */}
          <div className="mt-8">
            {/* Registration Form */}
            <Form
              schema={registerSchema}
              onSubmit={handleRegister}
              className="space-y-6"
            >
              {/* Name Field */}
              <FormInput
                name="name"
                label="Ad Soyad"
                type="text"
                autoComplete="name"
                required
                placeholder="Adınız ve soyadınız"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              {/* Email Field */}
              <FormInput
                name="email"
                label="E-posta Adresi"
                type="email"
                autoComplete="email"
                required
                placeholder="ornek@email.com"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              {/* Phone Field */}
              <FormInput
                name="phone"
                label="Telefon Numarası"
                type="tel"
                autoComplete="tel"
                required
                placeholder="0555 123 45 67"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
              {/* Password Field */}
              <div className="relative">
                <FormInput
                  name="password"
                  label="Şifre"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="En az 8 karakter"
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir
                </p>
              </div>
              {/* Confirm Password Field */}
              <div className="relative">
                <FormInput
                  name="confirmPassword"
                  label="Şifre Tekrar"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Şifrenizi tekrar giriniz"
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {/* Terms Checkbox */}
              <FormCheckbox
                name="acceptTerms"
                label={
                  <>
                    <Link
                      href="/terms"
                      className="text-amber-600 hover:text-amber-500"
                    >
                      Kullanım Koşulları
                    </Link>{" "}
                    ve{" "}
                    <Link
                      href="/privacy"
                      className="text-amber-600 hover:text-amber-500"
                    >
                      Gizlilik Politikası
                    </Link>
                    &rsquo;nı okudum ve kabul ediyorum *
                  </>
                }
              />
              {/* Marketing Emails Checkbox */}
              <FormCheckbox
                name="marketingEmails"
                label="Kampanya ve özel tekliflerden e-posta ile haberdar olmak istiyorum"
              />{" "}
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {registerMutation.isPending ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  {registerMutation.isPending
                    ? "Hesap Oluşturuluyor..."
                    : "Hesap Oluştur"}
                </button>
              </div>
            </Form>

            {/* Login Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Zaten hesabınız var mı?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/giris-yap"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 {siteSettings?.siteName || "Fotomandalin"}. Tüm hakları
                saklıdır.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual Mockup */}
      <div className="hidden lg:block relative flex-1 bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full flex flex-col items-center justify-center p-12">
            {/* Main Content */}
            <div className="relative w-full max-w-lg">
              {/* Testimonial Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <div className="flex items-start mb-6">
                  <div className="mr-4">
                    <svg
                      className="w-10 h-10 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                    </svg>
                  </div>
                  <blockquote>
                    <p className="text-lg font-medium text-white mb-2">
                      Fotomandalin ile düğün fotoğraflarımız hayal ettiğimizden
                      çok daha güzel oldu. Profesyonel ekip ve kaliteli hizmet
                      için teşekkürler!
                    </p>
                    <footer className="text-sm text-gray-300">
                      <span className="font-semibold">Ayşe & Mehmet</span> ·
                      Düğün Çekimi
                    </footer>
                  </blockquote>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-black overflow-hidden bg-amber-400"
                        >
                          <div className="h-full w-full bg-gradient-to-br from-amber-400 to-amber-600" />
                        </div>
                      ))}
                    </div>
                    <span className="ml-3 text-sm text-gray-300">
                      200+ mutlu müşteri
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-amber-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-300">
                      4.9/5 puan
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 aspect-[4/3] rounded-lg overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">
                        Düğün Fotoğrafçılığı
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10">
                    <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 relative">
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs font-medium">Aile</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-white/10">
                    <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 relative">
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs font-medium">Portre</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="mx-auto w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-medium">
                    Hızlı Randevu
                  </h3>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="mx-auto w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-medium">
                    Güvenli Ödeme
                  </h3>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="mx-auto w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-medium">
                    Kaliteli Çekim
                  </h3>
                </div>
              </div>
            </div>

            {/* Brand Footer */}
            <div className="mt-auto pt-8 text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                {siteSettings?.logo && !siteLoading ? (
                  <Image
                    src={siteSettings.logo}
                    alt="Fotomandalin Logo"
                    width={32}
                    height={32}
                    className="rounded-sm object-contain"
                  />
                ) : (
                  <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                )}
                <span className="text-xl font-semibold text-white">
                  {siteSettings?.siteName || "Fotomandalin"}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Profesyonel Fotoğrafçılık Hizmetleri
              </p>
            </div>
          </div>
        </div>

        {/* Animated Bokeh Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-400/20 blur-xl animate-float"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
        </div>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
      </div>
    </div>
  );
}
