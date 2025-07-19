"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  EmailField,
  CheckboxField,
} from "@/components/organisms/form/FormField";
import { useToast } from "@/components/ui/toast/toast";

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase(),
  password: z.string().min(1, "Şifre gereklidir"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams: any = useSearchParams();
  const { addToast } = useToast();

  // Get callbackUrl from query parameters or default to dashboard
  const callbackUrl = searchParams.get("callbackUrl") || "/panel";

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use NextAuth signIn function
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(result.error || "Giriş işlemi başarısız oldu");
      }

      // Success - show toast and redirect
      addToast({
        type: "success",
        title: "Başarılı!",
        message: "Giriş işlemi başarılı. Yönlendiriliyorsunuz...",
        duration: 3000,
      });

      // Redirect to callbackUrl or dashboard
      router.push(result?.url || callbackUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Giriş bilgileri hatalı veya bir sorun oluştu"
      );

      addToast({
        type: "error",
        title: "Hata!",
        message:
          err instanceof Error
            ? err.message
            : "Giriş bilgileri hatalı veya bir sorun oluştu",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
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
              <div className="w-10 h-10 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-2xl font-semibold text-black font-mono">
                Fotomandalin
              </span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 font-mono">
              Giriş Yapın
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hesabınıza giriş yaparak{" "}
              <span className="font-medium text-amber-600">
                özel anlarınızı
              </span>{" "}
              yönetmeye devam edin
            </p>
          </div>

          {/* Form Container */}
          <div className="mt-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <Form
              schema={loginSchema}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              {/* Email Field */}
              <EmailField
                name="email"
                label="E-posta Adresi"
                placeholder="ornek@email.com"
                required
              />

              {/* Password Field */}
              <TextField
                name="password"
                label="Şifre"
                type="password"
                placeholder="Şifrenizi giriniz"
                required
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <CheckboxField name="rememberMe" label="Beni hatırla" />

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-amber-600 hover:text-amber-500"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
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
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
              </div>
            </Form>

            {/* Register Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Henüz hesabınız yok mu?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/kayit-ol"
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                >
                  Hesap Oluştur
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Fotomandalin. Tüm hakları saklıdır.
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
              {/* Welcome Back Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Tekrar Hoş Geldiniz
                </h3>
                <p className="text-gray-300 mb-6">
                  Hesabınıza giriş yaparak rezervasyonlarınızı yönetin, fotoğraf
                  galerilerinize erişin ve özel tekliflerden yararlanın.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-amber-400 mb-1">
                      7/24
                    </div>
                    <div className="text-xs text-gray-400">
                      Çevrimiçi Erişim
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                    <div className="text-2xl font-bold text-amber-400 mb-1">
                      %15
                    </div>
                    <div className="text-xs text-gray-400">Üye İndirimi</div>
                  </div>
                </div>
              </div>

              {/* Portfolio Preview */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-medium">
                        Galeri Erişimi
                      </p>
                    </div>
                  </div>
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-medium">
                        Rezervasyonlar
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 flex items-center">
                <div className="mr-4 text-amber-400">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">
                    Güvenli Giriş
                  </h4>
                  <p className="text-xs text-gray-400">
                    Tüm verileriniz SSL ile şifrelenir ve güvenle saklanır.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Footer */}
            <div className="mt-auto pt-8 text-center">
              <div className="inline-flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-amber-500 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span className="text-xl font-semibold text-white">
                  Fotomandalin
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

export default function LoginContainer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
