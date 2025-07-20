"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/organisms/dialog";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  SelectField,
  TextareaField,
} from "@/components/organisms/form/FormField";
import { z } from "zod";
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  User,
  Eye,
  Star,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3,
  Camera,
  ChevronRight,
  Filter,
  Search,
  Download,
  MoreVertical,
  Edit3,
  Trash2,
  MessageSquare,
  X,
  Plus,
} from "lucide-react";

// Types
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

interface BookingFilters {
  status?: BookingStatus;
  dateRange?: "upcoming" | "past" | "all";
  search?: string;
}

// Review form schema
const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Lütfen bir puan verin")
    .max(5, "Maksimum 5 puan verilebilir"),
  content: z
    .string()
    .min(10, "Değerlendirme en az 10 karakter olmalıdır")
    .max(500, "Değerlendirme en fazla 500 karakter olabilir"),
});

export default function UserBookingContainer() {
  const { addToast } = useToast();
  const [filters, setFilters] = useState<BookingFilters>({
    status: undefined,
    dateRange: "all",
    search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<string | null>(null);

  // Data fetching
  const {
    data: bookings = [],
    isLoading,
    refetch,
  } = trpc.user.getMyBookings.useQuery();

  // Cancel booking mutation
  const cancelBookingMutation = trpc.booking.cancel.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Rezervasyon iptal edildi",
        type: "success",
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  // Review booking mutation
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Değerlendirmeniz kaydedildi",
        type: "success",
      });
      setReviewBooking(null);
      refetch();
    },
    onError: (error) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  // Status badge component
  const StatusBadge = ({
    status,
    paymentStatus,
  }: {
    status: BookingStatus;
    paymentStatus: PaymentStatus;
  }) => {
    const statusConfig = {
      PENDING: {
        icon: Clock3,
        text: "Onay Bekliyor",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      CONFIRMED: {
        icon: CheckCircle2,
        text: "Onaylandı",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      CANCELLED: {
        icon: XCircle,
        text: "İptal Edildi",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      COMPLETED: {
        icon: Camera,
        text: "Tamamlandı",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    const paymentConfig = {
      PENDING: { text: "Ödeme Bekliyor", className: "text-yellow-600" },
      PAID: { text: "Ödendi", className: "text-green-600" },
      REFUNDED: { text: "İade Edildi", className: "text-blue-600" },
      FAILED: { text: "Ödeme Başarısız", className: "text-red-600" },
    };

    const StatusIcon = statusConfig[status].icon;

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[status].className}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig[status].text}
        </span>
        <span className={`text-xs ${paymentConfig[paymentStatus].className}`}>
          {paymentConfig[paymentStatus].text}
        </span>
      </div>
    );
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !filters.status || booking.status === filters.status;
    const matchesSearch =
      !filters.search ||
      booking.customerName
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      booking.bookingCode?.toLowerCase().includes(filters.search.toLowerCase());

    const bookingDate = new Date(booking.startTime);
    const now = new Date();

    let matchesDateRange = true;
    if (filters.dateRange === "upcoming") {
      matchesDateRange = bookingDate > now;
    } else if (filters.dateRange === "past") {
      matchesDateRange = bookingDate < now;
    }

    return matchesStatus && matchesSearch && matchesDateRange;
  });

  // Handle cancel booking
  const handleCancelBooking = (bookingId: string) => {
    if (
      window.confirm("Rezervasyonu iptal etmek istediğinizden emin misiniz?")
    ) {
      cancelBookingMutation.mutate({ id: bookingId });
    }
  };

  // Handle review submit
  const handleReviewSubmit = (data: z.infer<typeof reviewSchema>) => {
    if (reviewBooking) {
      createReviewMutation.mutate({
        bookingId: reviewBooking,
        ...data,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg h-32"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Rezervasyonlarım
          </h1>
          <p className="text-gray-600">
            Tüm rezervasyonlarınızı görüntüleyin ve yönetin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam</p>
                <p className="text-2xl font-bold text-black">
                  {bookings.length}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Package className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylı</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "CONFIRMED").length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.status === "PENDING").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bookings.filter((b) => b.status === "COMPLETED").length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rezervasyon kodu veya adınızla ara..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (e.target.value as BookingStatus) || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Onay Bekliyor</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: e.target.value as "upcoming" | "past" | "all",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="all">Tüm Tarihler</option>
                <option value="upcoming">Yaklaşan</option>
                <option value="past">Geçmiş</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              Rezervasyon Bulunamadı
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.status || filters.search
                ? "Filtrelere uygun rezervasyon bulunamadı."
                : "Henüz hiç rezervasyonunuz bulunmuyor."}
            </p>
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
              Yeni Rezervasyon Yap
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-lg hover:border-orange-200 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Section - Booking Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div>
                            <h3 className="text-lg font-semibold text-black">
                              {booking.bookingCode ||
                                booking.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <StatusBadge
                              status={booking.status as BookingStatus}
                              paymentStatus={
                                booking.paymentStatus as PaymentStatus
                              }
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            Oluşturulma:{" "}
                            {new Date(booking.createdAt).toLocaleDateString(
                              "tr-TR"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Booking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-black">
                              {new Date(booking.startTime).toLocaleDateString(
                                "tr-TR"
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Çekim Tarihi
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-black">
                              {new Date(booking.startTime).toLocaleTimeString(
                                "tr-TR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Başlangıç Saati
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-black">
                              {booking.location?.name || "Belirtilmemiş"}
                            </p>
                            <p className="text-xs text-gray-500">Lokasyon</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-black">
                              {booking.totalAmount
                                ? `${Number(booking.totalAmount).toLocaleString(
                                    "tr-TR"
                                  )} ₺`
                                : "Belirtilmemiş"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Toplam Tutar
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Package Info */}
                      {booking.package && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <Package className="w-5 h-5 text-orange-500" />
                          <div>
                            <p className="font-medium text-black">
                              {booking.package.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {booking.package.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Special Notes */}
                      {booking.specialNotes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            {booking.specialNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                      <button
                        onClick={() => setSelectedBooking(booking.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-black rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Detay</span>
                      </button>

                      {booking.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancelBookingMutation.isPending}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-200 hover:border-red-300 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">İptal Et</span>
                        </button>
                      )}

                      {booking.status === "COMPLETED" && !booking.review && (
                        <button
                          onClick={() => setReviewBooking(booking.id)}
                          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 hover:border-yellow-300 text-yellow-700 rounded-lg transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          <span className="text-sm">Değerlendir</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <BookingDetailModal
            bookingId={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancel={handleCancelBooking}
          />
        )}

        {/* Review Modal */}
        <Dialog
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          title="Değerlendirme Yap"
          size="md"
          type="default"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Rezervasyonunuz hakkında değerlendirmenizi bekliyoruz.
              Görüşleriniz hizmet kalitemizi artırmamıza yardımcı olur.
            </p>

            <Form
              schema={reviewSchema}
              onSubmit={handleReviewSubmit}
              className="space-y-4"
            >
              <SelectField
                name="rating"
                label="Puanınız"
                required
                options={[
                  { label: "⭐ 1 - Çok Kötü", value: 1 },
                  { label: "⭐⭐ 2 - Kötü", value: 2 },
                  { label: "⭐⭐⭐ 3 - Orta", value: 3 },
                  { label: "⭐⭐⭐⭐ 4 - İyi", value: 4 },
                  { label: "⭐⭐⭐⭐⭐ 5 - Mükemmel", value: 5 },
                ]}
                placeholder="Puanınızı seçin"
              />

              <TextareaField
                name="content"
                label="Değerlendirmeniz"
                required
                placeholder="Deneyiminizi bizimle paylaşın..."
                rows={4}
                helperText="En az 10, en fazla 500 karakter"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createReviewMutation.isPending}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {createReviewMutation.isPending
                    ? "Kaydediliyor..."
                    : "Değerlendirmeyi Kaydet"}
                </button>
              </div>
            </Form>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

// Booking Detail Modal Component
const BookingDetailModal = ({
  bookingId,
  onClose,
  onCancel,
}: {
  bookingId: string;
  onClose: () => void;
  onCancel: (id: string) => void;
}) => {
  const { data: booking, isLoading } = trpc.booking.getById.useQuery({
    id: bookingId,
  });

  // Status badge component for modal
  const StatusBadge = ({
    status,
    paymentStatus,
  }: {
    status: BookingStatus;
    paymentStatus: PaymentStatus;
  }) => {
    const statusConfig = {
      PENDING: {
        icon: Clock3,
        text: "Onay Bekliyor",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      CONFIRMED: {
        icon: CheckCircle2,
        text: "Onaylandı",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      CANCELLED: {
        icon: XCircle,
        text: "İptal Edildi",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      COMPLETED: {
        icon: Camera,
        text: "Tamamlandı",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    const paymentConfig = {
      PENDING: { text: "Ödeme Bekliyor", className: "text-yellow-600" },
      PAID: { text: "Ödendi", className: "text-green-600" },
      REFUNDED: { text: "İade Edildi", className: "text-blue-600" },
      FAILED: { text: "Ödeme Başarısız", className: "text-red-600" },
    };

    const StatusIcon = statusConfig[status].icon;

    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[status].className}`}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConfig[status].text}
        </span>
        <span className={`text-xs ${paymentConfig[paymentStatus].className}`}>
          {paymentConfig[paymentStatus].text}
        </span>
      </div>
    );
  };

  if (!booking && !isLoading) {
    return (
      <Dialog
        isOpen={true}
        onClose={onClose}
        title="Rezervasyon Bulunamadı"
        size="sm"
        type="error"
      >
        <div className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Bu rezervasyon artık mevcut değil.
          </p>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Kapat
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Rezervasyon Detayları"
      size="xl"
      type="default"
      footer={
        booking && (
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
            >
              Kapat
            </button>

            <div className="flex gap-2">
              {booking.status === "PENDING" && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Rezervasyonu iptal etmek istediğinizden emin misiniz?"
                      )
                    ) {
                      onCancel(booking.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rezervasyonu İptal Et
                </button>
              )}

              {booking.status === "COMPLETED" && !booking.review && (
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  Değerlendirme Yap
                </button>
              )}

              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                PDF İndir
              </button>
            </div>
          </div>
        )
      }
    >
      {isLoading ? (
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ) : booking ? (
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Genel Bilgiler
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rezervasyon Kodu:</span>
                  <span className="font-medium text-black">
                    {booking.bookingCode ||
                      booking.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Durum:</span>
                  <StatusBadge
                    status={booking.status as BookingStatus}
                    paymentStatus={booking.paymentStatus as PaymentStatus}
                  />
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Müşteri:</span>
                  <span className="font-medium text-black">
                    {booking.customerName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">E-posta:</span>
                  <span className="font-medium text-black">
                    {booking.customerEmail}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Telefon:</span>
                  <span className="font-medium text-black">
                    {booking.customerPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">
                Çekim Bilgileri
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih:</span>
                  <span className="font-medium text-black">
                    {new Date(booking.startTime).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Saat:</span>
                  <span className="font-medium text-black">
                    {new Date(booking.startTime).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -
                    {new Date(booking.endTime).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Lokasyon:</span>
                  <span className="font-medium text-black">
                    {booking.location?.name || "Belirtilmemiş"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Fotoğrafçı:</span>
                  <span className="font-medium text-black">
                    {booking.staff?.name || "Atanmamış"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Tutar:</span>
                  <span className="font-bold text-lg text-black">
                    {Number(booking.totalAmount).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          {booking.package && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Paket Bilgileri
              </h3>
              <div className="flex items-start gap-4">
                <Package className="w-8 h-8 text-orange-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-black">
                    {booking.package.name}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {booking.package.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Kategori: {booking.package.category?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add-ons */}
          {booking.addOns && booking.addOns.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Ek Hizmetler
              </h3>
              <div className="space-y-2">
                {booking.addOns.map((bookingAddOn) => (
                  <div
                    key={bookingAddOn.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-500" />
                      <span className="text-black">
                        {bookingAddOn.addOn.name}
                      </span>
                      {bookingAddOn.quantity > 1 && (
                        <span className="text-gray-500">
                          x{bookingAddOn.quantity}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-black">
                      {Number(bookingAddOn.price).toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Notes */}
          {booking.specialNotes && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Özel Notlar
              </h3>
              <p className="text-gray-700">{booking.specialNotes}</p>
            </div>
          )}

          {/* Payment Information */}
          {booking.payments && booking.payments.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Ödeme Bilgileri
              </h3>
              <div className="space-y-2">
                {booking.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span>{payment.method}</span>
                      <span className="text-xs text-gray-500">
                        (
                        {new Date(payment.createdAt).toLocaleDateString(
                          "tr-TR"
                        )}
                        )
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-black">
                        {Number(payment.amount).toLocaleString("tr-TR")} ₺
                      </span>
                      <div
                        className={`text-xs ${
                          payment.status === "PAID"
                            ? "text-green-600"
                            : payment.status === "PENDING"
                            ? "text-yellow-600"
                            : payment.status === "REFUNDED"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status === "PAID"
                          ? "Ödendi"
                          : payment.status === "PENDING"
                          ? "Bekliyor"
                          : payment.status === "REFUNDED"
                          ? "İade Edildi"
                          : "Başarısız"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {booking.timeline && booking.timeline.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black mb-3">
                Rezervasyon Geçmişi
              </h3>
              <div className="space-y-3">
                {booking.timeline.map((entry: any, index: number) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      {index < booking.timeline!.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-black">
                        {entry.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Dialog>
  );
};
