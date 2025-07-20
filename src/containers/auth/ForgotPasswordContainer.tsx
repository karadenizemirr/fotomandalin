"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { z } from "zod";
import Form from "@/components/organisms/form/Form";
import { EmailField } from "@/components/organisms/form/FormField";
import { Button } from "@/components/atoms/button";
import { useToast } from "@/components/ui/toast/toast";

// Zod validation schema for forgot password
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz")
    .toLowerCase()
    .min(1, "E-posta adresi gereklidir"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { addToast } = useToast();

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      // Şifre sıfırlama API çağrısı
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bir hata oluştu");
      }

      // Başarılı durumda
      setSentEmail(data.email);
      setEmailSent(true);

      addToast({
        type: "success",
        title: "E-posta Gönderildi!",
        message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        duration: 5000,
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Hata!",
        message:
          err instanceof Error
            ? err.message
            : "Şifre sıfırlama e-postası gönderilirken bir hata oluştu",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!sentEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: sentEmail }),
      });

      if (response.ok) {
        addToast({
          type: "success",
          title: "E-posta Tekrar Gönderildi!",
          message: "Şifre sıfırlama bağlantısı tekrar gönderildi.",
          duration: 3000,
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Hata!",
        message: "E-posta tekrar gönderilirken bir hata oluştu",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white relative">
          {/* Back to Login Button */}
          <div className="absolute top-6 left-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
              title="Giriş sayfasına dön"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Content */}
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                E-posta Gönderildi
              </h2>
              <p className="mt-4 text-sm text-gray-600 leading-6">
                <strong>{sentEmail}</strong> adresine şifre sıfırlama bağlantısı
                gönderildi. E-postanızı kontrol edin ve bağlantıya tıklayarak
                yeni şifrenizi oluşturun.
              </p>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? "Gönderiliyor..." : "E-postayı Tekrar Gönder"}
                </Button>

                <Link href="/auth/login">
                  <Button variant="ghost" size="lg" className="w-full">
                    Giriş Sayfasına Dön
                  </Button>
                </Link>
              </div>

              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-left">
                    <p className="text-sm text-amber-800 font-medium">
                      E-posta gelmedi mi?
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Spam klasörünüzü kontrol edin veya birkaç dakika bekleyip
                      tekrar deneyin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Image */}
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/heroImage.jpg"
            alt="Fotomandalin - Profesyonel Fotoğrafçılık"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h3 className="text-2xl font-bold mb-4">
                Güvenliğiniz Bizim Önceliğimiz
              </h3>
              <p className="text-lg opacity-90">
                Hesabınızın güvenliği için şifre sıfırlama işlemi e-posta
                doğrulaması ile gerçekleştirilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white relative">
        {/* Back to Login Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 group"
            title="Giriş sayfasına dön"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Şifremi Unuttum
            </h2>
            <p className="mt-4 text-sm text-gray-600 leading-6">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı
              gönderelim. Birkaç dakika içinde e-postanızı kontrol edin.
            </p>
          </div>

          {/* Form */}
          <div className="mt-8">
            <Form schema={forgotPasswordSchema} onSubmit={handleForgotPassword}>
              <div className="space-y-6">
                <EmailField
                  name="email"
                  label="E-posta Adresi"
                  placeholder="ornek@email.com"
                  required
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full bg-black hover:bg-black/90"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                      Gönderiliyor...
                    </div>
                  ) : (
                    "Şifre Sıfırlama Bağlantısı Gönder"
                  )}
                </Button>
              </div>
            </Form>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <Link
                href="/giris-yap"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Şifrenizi hatırladınız mı?{" "}
                <span className="font-medium text-black hover:underline">
                  Giriş Yapın
                </span>
              </Link>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium">
                    Güvenlik Bilgisi
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Şifre sıfırlama bağlantısı sadece 1 saat geçerlidir. Bu süre
                    sonunda yeni bir istek göndermeniz gerekecektir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/images/heroImage.jpg"
          alt="Fotomandalin - Profesyonel Fotoğrafçılık"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h3 className="text-2xl font-bold mb-4">
              Hesabınıza Güvenli Erişim
            </h3>
            <p className="text-lg opacity-90">
              Fotoğraf çekimi rezervasyonlarınız ve hesap bilgileriniz güvende.
              Şifrenizi sıfırlayarak hesabınıza tekrar erişim sağlayabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordContainer() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}