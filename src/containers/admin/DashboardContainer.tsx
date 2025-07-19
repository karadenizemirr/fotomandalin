"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import {
  Activity,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Star,
  Clock,
  RefreshCw,
  Eye,
} from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalStaff: number;
  totalLocations: number;
  averageRating: number;
  pendingPayments: number;
  completedPayments: number;
}

interface _RecentActivity {
  id: string;
  type: "booking" | "payment" | "user" | "review";
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const DashboardContainer = () => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

  // Toast hook
  const { addToast } = useToast();

  // API Queries
  const {
    data: bookingStats,
    isLoading: loadingBookingStats,
    refetch: refetchBookingStats,
  } = trpc.booking.stats.useQuery({});

  const {
    data: userList,
    isLoading: loadingUserStats,
    refetch: refetchUserStats,
  } = trpc.user.getAllUsers.useQuery({ page: 1, limit: 1 });

  // Payment stats için booking stats'dan gelir bilgisi alıyoruz
  // Ayrı bir payment.stats endpoint'i yok

  const {
    data: portfolioStats,
    isLoading: loadingPortfolioStats,
    refetch: refetchPortfolioStats,
  } = trpc.portfolio.stats.useQuery();

  const {
    data: locationStats,
    isLoading: loadingLocationStats,
    refetch: refetchLocationStats,
  } = trpc.location.stats.useQuery();

  const {
    data: recentBookings,
    isLoading: loadingRecentBookings,
    refetch: refetchRecentBookings,
  } = trpc.booking.list.useQuery({
    limit: pageSize,
    sortBy: "created",
    sortOrder: "desc",
  });

  // Loading states
  const isLoading =
    loadingBookingStats ||
    loadingUserStats ||
    loadingPortfolioStats ||
    loadingLocationStats;

  // Calculate dashboard stats
  const dashboardStats: DashboardStats = useMemo(() => {
    return {
      totalBookings: bookingStats?.total || 0,
      activeBookings: bookingStats?.confirmed || 0,
      totalRevenue: bookingStats?.totalRevenue || 0,
      monthlyRevenue: bookingStats?.totalRevenue || 0,
      totalUsers: userList?.pagination?.total || 0,
      totalStaff: 0, // Staff sayısı için ayrı API çağrısı gerekebilir
      totalLocations: locationStats?.total || 0,
      averageRating: 4.5, // Portfolio stats'ta averageRating yok, placeholder kullanıyoruz
      pendingPayments: bookingStats?.pending || 0,
      completedPayments: bookingStats?.confirmed || 0,
    };
  }, [bookingStats, userList, locationStats, portfolioStats]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBookingStats(),
        refetchUserStats(),
        refetchPortfolioStats(),
        refetchLocationStats(),
        refetchRecentBookings(),
      ]);
      addToast({
        message: "Dashboard verileri güncellendi",
        type: "success",
      });
    } catch {
      addToast({
        message: "Veriler güncellenirken bir hata oluştu",
        type: "error",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Recent bookings table columns
  const recentBookingsColumns = [
    {
      key: "id",
      title: "Rezervasyon ID",
      label: "Rezervasyon ID",
      render: (booking: any) => (
        <div className="font-medium text-gray-900">
          #{booking?.id ? booking.id.slice(-8) : "N/A"}
        </div>
      ),
    },
    {
      key: "customer",
      title: "Müşteri",
      label: "Müşteri",
      render: (booking: any) => (
        <div>
          <div className="font-medium text-gray-900">
            {booking?.customerName || booking?.user?.name || "Bilinmiyor"}
          </div>
          <div className="text-sm text-gray-500">
            {booking?.customerEmail || booking?.user?.email || ""}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      title: "Hizmet",
      label: "Hizmet",
      render: (booking: any) => (
        <div>
          <div className="font-medium text-gray-900">
            {booking?.package?.title || "Paket Seçilmemiş"}
          </div>
          <div className="text-sm text-gray-500">
            {booking?.location?.name || "Lokasyon Belirtilmemiş"}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Tutar",
      label: "Tutar",
      render: (booking: any) => (
        <div className="font-medium text-gray-900">
          {booking?.totalAmount
            ? new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: booking.currency || "TRY",
              }).format(parseFloat(booking.totalAmount) || 0)
            : "0 ₺"}
        </div>
      ),
    },
    {
      key: "status",
      title: "Durum",
      label: "Durum",
      render: (booking: any) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            booking.status === "CONFIRMED"
              ? "bg-green-100 text-green-800"
              : booking.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800"
              : booking.status === "CANCELLED"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {booking.status === "CONFIRMED"
            ? "Onaylandı"
            : booking.status === "PENDING"
            ? "Bekliyor"
            : booking.status === "CANCELLED"
            ? "İptal Edildi"
            : booking.status || "Bilinmiyor"}
        </span>
      ),
    },
    {
      key: "date",
      title: "Tarih",
      label: "Tarih",
      render: (booking: any) => (
        <div className="text-sm text-gray-900">
          {booking?.createdAt
            ? new Date(booking.createdAt).toLocaleDateString("tr-TR")
            : "Tarih belirtilmemiş"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Sistem genel bakış ve önemli metrikler
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Güncelleniyor..." : "Yenile"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Toplam Rezervasyon
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.totalBookings.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Bu ay toplam rezervasyon sayısı
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Aktif Rezervasyon
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.activeBookings.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Toplam rezervasyonların %{" "}
              {dashboardStats.totalBookings > 0
                ? (
                    (dashboardStats.activeBookings /
                      dashboardStats.totalBookings) *
                    100
                  ).toFixed(1)
                : "0"}
              &apos;i aktif
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(dashboardStats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Tüm zamanların toplam geliri
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Toplam Kullanıcı
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.totalUsers.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              Kayıtlı toplam kullanıcı sayısı
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Staff Count */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Personel Sayısı
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.totalStaff.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Lokasyon Sayısı
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.totalLocations.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-2 bg-teal-100 rounded-lg">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading ? "..." : dashboardStats.averageRating.toFixed(1)}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Bekleyen Ödeme
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading
                  ? "..."
                  : dashboardStats.pendingPayments.toLocaleString("tr-TR")}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Son Rezervasyonlar
            </h2>
            <button className="inline-flex items-center px-3 py-1 text-sm font-medium text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors duration-200">
              <Eye className="w-4 h-4 mr-1" />
              Tümünü Gör
            </button>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            data={recentBookings?.items || []}
            columns={recentBookingsColumns}
            loading={loadingRecentBookings}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: recentBookings?.items?.length || 0,
              showSizeChanger: false,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            emptyText="Henüz rezervasyon bulunmuyor"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
