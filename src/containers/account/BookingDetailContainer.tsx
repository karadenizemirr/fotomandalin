"use client";

import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Camera,
  Star,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function BookingDetailContainer({
  bookingId,
}: {
  bookingId: string;
}) {
  const { addToast } = useToast();

  // Fetch booking details
  const { data: booking, isLoading: bookingLoading } =
    trpc.booking.getById.useQuery({
      id: bookingId,
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Onaylandı";
      case "PENDING":
        return "Beklemede";
      case "CANCELLED":
        return "İptal Edildi";
      case "COMPLETED":
        return "Tamamlandı";
      default:
        return "Bilinmeyen";
    }
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-black mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Yükleniyor...
          </h2>
          <p className="text-gray-600">Rezervasyon detayları getiriliyor</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Rezervasyon Bulunamadı
          </h2>
          <p className="text-gray-600 mb-6">
            Aradığınız rezervasyon mevcut değil veya erişim yetkiniz bulunmuyor.
          </p>
          <Link
            href="/account/bookings"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Rezervasyonlarıma Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/account/bookings"
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Rezervasyon Detayı
                </h1>
                <p className="text-gray-600 text-sm">
                  #{booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getStatusColor(
                booking.status
              )}`}
            >
              {getStatusIcon(booking.status)}
              <span className="font-medium">
                {getStatusText(booking.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {booking.package?.name || "Paket Bilgisi"}
                  </h2>
                  <p className="text-gray-600">
                    {booking.package?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Çekim Tarihi</p>
                      <p className="font-medium text-gray-900">
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleDateString(
                              "tr-TR",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Tarih belirlenmedi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Çekim Saati</p>
                      <p className="font-medium text-gray-900">
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleTimeString(
                              "tr-TR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Saat belirlenmedi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lokasyon</p>
                      <p className="font-medium text-gray-900">
                        {booking.location?.name || "Belirlenmedi"}
                      </p>
                      {booking.location?.address && (
                        <p className="text-sm text-gray-600">
                          {booking.location.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Müşteri</p>
                      <p className="font-medium text-gray-900">
                        {booking.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p className="font-medium text-gray-900">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium text-gray-900">
                        {booking.customerPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {booking.specialNotes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Özel Notlar
                      </p>
                      <p className="text-gray-700">{booking.specialNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add-ons */}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Ek Hizmetler
                </h3>
                <div className="space-y-3">
                  {booking.addOns.map((addOn: any) => (
                    <div
                      key={addOn.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {addOn.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addOn.description}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₺{parseFloat(addOn.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Ödeme Bilgileri
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Paket Ücreti</span>
                  <span className="font-medium">
                    ₺
                    {parseFloat(
                      booking.package?.basePrice || "0"
                    ).toLocaleString()}
                  </span>
                </div>

                {booking.addOns && booking.addOns.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ek Hizmetler</span>
                    <span className="font-medium">
                      ₺
                      {booking.addOns
                        .reduce(
                          (total: number, addOn: any) =>
                            total + parseFloat(addOn.price),
                          0
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Toplam Tutar
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₺{parseFloat(booking.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Ödeme güvenli olarak alınmıştır</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Rezervasyon Geçmişi
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Rezervasyon Oluşturuldu
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ödeme Alındı</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>

                {booking.status === "CONFIRMED" && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Rezervasyon Onaylandı
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.updatedAt).toLocaleDateString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">
                Yardıma mı ihtiyacınız var?
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Rezervasyonunuzla ilgili sorularınız için bizimle iletişime
                geçin.
              </p>
              <button className="w-full bg-white text-black py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Destek Ekibi ile İletişim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
