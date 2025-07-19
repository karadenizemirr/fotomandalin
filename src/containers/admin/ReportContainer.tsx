"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Camera,
  RefreshCw,
  Download,
  Filter,
  Search,
  Activity,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface ReportDateRange {
  startDate: string;
  endDate: string;
}

interface ReportFilters {
  dateRange: ReportDateRange;
  status?: string;
  serviceType?: string;
  location?: string;
}

const ReportContainer = () => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState<
    "overview" | "bookings" | "revenue" | "customers" | "performance"
  >("overview");
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
    },
    status: "all",
    serviceType: "all",
    location: "all",
  });

  // Toast hook
  const { addToast } = useToast();

  // Export functionality
  const handleExport = () => {
    try {
      let dataToExport: any[] = [];
      let filename = "";

      switch (reportType) {
        case "bookings":
          dataToExport =
            bookingsData?.items?.map((booking: any) => ({
              "Rezervasyon ID": booking.id.slice(-8),
              Müşteri:
                booking.customerName || booking.user?.name || "Bilinmiyor",
              "E-posta": booking.customerEmail || booking.user?.email || "",
              Telefon: booking.customerPhone || booking.user?.phone || "",
              Paket: booking.package?.title || "",
              Durum: booking.status,
              "Ödeme Durumu": booking.paymentStatus,
              Tutar: parseFloat(booking.totalAmount),
              "Para Birimi": booking.currency,
              Başlangıç: new Date(booking.startTime).toLocaleString("tr-TR"),
              Bitiş: new Date(booking.endTime).toLocaleString("tr-TR"),
              Lokasyon: booking.location?.name || "Belirtilmemiş",
              Personel: booking.staff?.name || "Atanmamış",
              Oluşturulma: new Date(booking.createdAt).toLocaleString("tr-TR"),
            })) || [];
          filename = "rezervasyonlar_raporu";
          break;

        case "revenue":
          dataToExport = [
            {
              "Rapor Türü": "Gelir Özeti",
              "Bu Ay Gelir": bookingStats?.thisMonthRevenue || 0,
              "Geçen Ay Gelir": bookingStats?.lastMonthRevenue || 0,
              "Toplam Gelir": bookingStatsData?.totalRevenue || 0,
              "Ortalama Rezervasyon": bookingStats?.averageBookingValue || 0,
              "Toplam Rezervasyon": bookingStatsData?.total || 0,
              "Onaylanan Rezervasyon": bookingStatsData?.confirmed || 0,
              "Bekleyen Rezervasyon": bookingStatsData?.pending || 0,
              "Tamamlanan Rezervasyon": bookingStatsData?.completed || 0,
              "İptal Edilen Rezervasyon": bookingStatsData?.cancelled || 0,
            },
          ];
          filename = "gelir_raporu";
          break;

        case "customers":
          dataToExport = [
            {
              "Rapor Türü": "Müşteri İstatistikleri",
              "Toplam Müşteri": userStats?.totalUsers || 0,
              "Aktif Müşteri": userStats?.activeUsers || 0,
              "Bu Ay Yeni": userStats?.recentUsers || 0,
              "Normal Müşteri": userStats?.regularUsers || 0,
              "Admin Sayısı": userStats?.totalAdmins || 0,
            },
          ];
          filename = "musteri_raporu";
          break;

        case "performance":
          dataToExport = [
            {
              "Rapor Türü": "Performans Metrikleri",
              "Toplam Rezervasyon": bookingStats?.totalBookings || 0,
              Tamamlanan: bookingStats?.completedBookings || 0,
              Onaylanan: bookingStats?.confirmedBookings || 0,
              Bekleyen: bookingStats?.pendingBookings || 0,
              "İptal Edilen": bookingStats?.cancelledBookings || 0,
              "Aktif Lokasyon": locationStats?.active || 0,
              "Toplam Lokasyon": locationStats?.total || 0,
              "Lokasyon Rezervasyonları": locationStats?.totalBookings || 0,
            },
          ];
          filename = "performans_raporu";
          break;

        default:
          dataToExport = [
            {
              "Rapor Türü": "Genel Bakış",
              "Toplam Rezervasyon": bookingStats?.totalBookings || 0,
              "Bu Ay Rezervasyon": bookingStats?.thisMonthBookings || 0,
              "Toplam Gelir": bookingStats?.totalRevenue || 0,
              "Bu Ay Gelir": bookingStats?.thisMonthRevenue || 0,
              "Ortalama Rezervasyon Değeri":
                bookingStats?.averageBookingValue || 0,
              "Toplam Müşteri": userStats?.totalUsers || 0,
              "Aktif Lokasyon": locationStats?.active || 0,
              "Portfolio Sayısı": portfolioStats?.total || 0,
            },
          ];
          filename = "genel_rapor";
      }

      if (dataToExport.length === 0) {
        addToast({
          message: "Dışa aktarılacak veri bulunamadı",
          type: "error",
        });
        return;
      }

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escape commas and quotes in CSV
              if (
                typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        message: "Rapor başarıyla dışa aktarıldı",
        type: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      addToast({
        message: "Dışa aktarma sırasında bir hata oluştu",
        type: "error",
      });
    }
  }; // tRPC hooks - getting data for reports
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = trpc.booking.list.useQuery({
    limit: pageSize,
    cursor: undefined,
    sortBy: "created",
    sortOrder: "desc",
  });

  const { data: userStats } = trpc.user.getUserStats.useQuery();
  const { data: portfolioStats } = trpc.portfolio.stats.useQuery();
  // Payment stats endpoint yok, booking stats'tan gelir bilgisi alıyoruz
  const { data: bookingStatsData } = trpc.booking.stats.useQuery({});
  const { data: locationStats } = trpc.location.stats.useQuery();

  // Calculate revenue and booking statistics
  const bookingStats = useMemo(() => {
    if (!bookingsData?.items) return null;

    const bookings = bookingsData.items;
    const now = new Date();

    const thisMonthBookings = bookings.filter(
      (booking: any) =>
        new Date(booking.createdAt) >=
        new Date(now.getFullYear(), now.getMonth(), 1)
    );

    const lastMonthBookings = bookings.filter((booking: any) => {
      const bookingDate = new Date(booking.createdAt);
      return (
        bookingDate >= new Date(now.getFullYear(), now.getMonth() - 1, 1) &&
        bookingDate < new Date(now.getFullYear(), now.getMonth(), 1)
      );
    });

    const totalRevenue = bookings.reduce(
      (sum: number, booking: any) =>
        sum + (parseFloat(booking.totalAmount) || 0),
      0
    );
    const thisMonthRevenue = thisMonthBookings.reduce(
      (sum: number, booking: any) =>
        sum + (parseFloat(booking.totalAmount) || 0),
      0
    );
    const lastMonthRevenue = lastMonthBookings.reduce(
      (sum: number, booking: any) =>
        sum + (parseFloat(booking.totalAmount) || 0),
      0
    );

    return {
      totalBookings: bookings.length,
      thisMonthBookings: thisMonthBookings.length,
      lastMonthBookings: lastMonthBookings.length,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      averageBookingValue: totalRevenue / (bookings.length || 1),
      confirmedBookings: bookings.filter((b: any) => b.status === "CONFIRMED")
        .length,
      pendingBookings: bookings.filter((b: any) => b.status === "PENDING")
        .length,
      completedBookings: bookings.filter((b: any) => b.status === "COMPLETED")
        .length,
      cancelledBookings: bookings.filter((b: any) => b.status === "CANCELLED")
        .length,
    };
  }, [bookingsData?.items]);

  // Calculate percentage changes
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  // Get trend color class
  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  // DataTable columns for bookings report
  const bookingColumns = [
    {
      key: "booking",
      title: "Rezervasyon",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            #{record.id.slice(-8)}
          </div>
          <div className="text-sm text-gray-500">{record.customerName}</div>
        </div>
      ),
    },
    {
      key: "service",
      title: "Hizmet",
      width: "180px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {record.package?.name}
          </div>
          <div className="text-xs text-gray-500">
            {record.serviceCategory?.name}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      title: "Tarih",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="text-sm text-gray-700">
          {new Date(record.scheduledDate).toLocaleDateString("tr-TR")}
        </div>
      ),
    },
    {
      key: "status",
      title: "Durum",
      width: "100px",
      render: (value: any, record: any) => {
        const statusColors = {
          PENDING: "bg-yellow-100 text-yellow-800",
          CONFIRMED: "bg-blue-100 text-blue-800",
          COMPLETED: "bg-green-100 text-green-800",
          CANCELLED: "bg-red-100 text-red-800",
        };
        const statusLabels = {
          PENDING: "Bekliyor",
          CONFIRMED: "Onaylandı",
          COMPLETED: "Tamamlandı",
          CANCELLED: "İptal",
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[record.status as keyof typeof statusColors]
            }`}
          >
            {statusLabels[record.status as keyof typeof statusLabels]}
          </span>
        );
      },
    },
    {
      key: "price",
      title: "Tutar",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(parseFloat(record.totalAmount) || 0)}
        </div>
      ),
    },
    {
      key: "location",
      title: "Lokasyon",
      width: "150px",
      render: (value: any, record: any) => (
        <div className="text-sm text-gray-700">
          {record.location?.name || "-"}
        </div>
      ),
    },
  ];

  // Actions for booking table
  const bookingActions = [
    {
      key: "view",
      label: "Detay",
      icon: <Eye className="w-4 h-4" />,
      onClick: (_record: any) => {
        // Handle view details
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Raporlar & Analitik
          </h1>
          <p className="text-gray-600">
            İş performansınızı takip edin ve analiz edin
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              refetchBookings();
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex space-x-1">
          {[
            {
              key: "overview",
              label: "Genel Bakış",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              key: "bookings",
              label: "Rezervasyonlar",
              icon: <Calendar className="w-4 h-4" />,
            },
            {
              key: "revenue",
              label: "Gelir",
              icon: <DollarSign className="w-4 h-4" />,
            },
            {
              key: "customers",
              label: "Müşteriler",
              icon: <Users className="w-4 h-4" />,
            },
            {
              key: "performance",
              label: "Performans",
              icon: <TrendingUp className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                reportType === tab.key
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Tarih Aralığı:
              </span>
            </div>

            <input
              type="date"
              value={filters.dateRange.startDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, startDate: e.target.value },
                }))
              }
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <span className="text-gray-500">-</span>

            <input
              type="date"
              value={filters.dateRange.endDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, endDate: e.target.value },
                }))
              }
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="PENDING">Bekliyor</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rezervasyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Overview Tab Content */}
      {reportType === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Bookings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Rezervasyon
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingStats?.totalBookings || 0}
                  </p>
                  {bookingStats && (
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(
                        getPercentageChange(
                          bookingStats.thisMonthBookings,
                          bookingStats.lastMonthBookings
                        )
                      )}
                      <span
                        className={`text-xs ${getTrendColor(
                          getPercentageChange(
                            bookingStats.thisMonthBookings,
                            bookingStats.lastMonthBookings
                          )
                        )}`}
                      >
                        {formatPercentage(
                          getPercentageChange(
                            bookingStats.thisMonthBookings,
                            bookingStats.lastMonthBookings
                          )
                        )}
                      </span>
                      <span className="text-xs text-gray-500">bu ay</span>
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Gelir
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingStats
                      ? formatCurrency(bookingStats.totalRevenue)
                      : formatCurrency(0)}
                  </p>
                  {bookingStats && (
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(
                        getPercentageChange(
                          bookingStats.thisMonthRevenue,
                          bookingStats.lastMonthRevenue
                        )
                      )}
                      <span
                        className={`text-xs ${getTrendColor(
                          getPercentageChange(
                            bookingStats.thisMonthRevenue,
                            bookingStats.lastMonthRevenue
                          )
                        )}`}
                      >
                        {formatPercentage(
                          getPercentageChange(
                            bookingStats.thisMonthRevenue,
                            bookingStats.lastMonthRevenue
                          )
                        )}
                      </span>
                      <span className="text-xs text-gray-500">bu ay</span>
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Müşteri
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.totalUsers || 0}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {userStats?.activeUsers || 0} aktif
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Portfolio Works */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Portfolio Çalışması
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolioStats?.total || 0}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {portfolioStats?.published || 0} yayında
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Booking Value */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ortalama Rezervasyon Değeri
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {bookingStats
                      ? formatCurrency(bookingStats.averageBookingValue)
                      : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Rezervasyon Durumları
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tamamlandı</span>
                  <span className="text-sm font-medium text-green-600">
                    {bookingStats?.completedBookings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Onaylandı</span>
                  <span className="text-sm font-medium text-blue-600">
                    {bookingStats?.confirmedBookings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bekliyor</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {bookingStats?.pendingBookings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">İptal</span>
                  <span className="text-sm font-medium text-red-600">
                    {bookingStats?.cancelledBookings || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Portfolio İstatistikleri
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam</span>
                  <span className="text-sm font-medium text-gray-900">
                    {portfolioStats?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Yayınlanan</span>
                  <span className="text-sm font-medium text-green-600">
                    {portfolioStats?.published || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taslak</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {portfolioStats?.unpublished || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Öne Çıkan</span>
                  <span className="text-sm font-medium text-blue-600">
                    {portfolioStats?.featured || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Location Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Aktif Lokasyonlar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {locationStats?.active || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    Toplam {locationStats?.total || 0} lokasyon
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Rezervasyon
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingStatsData?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {bookingStatsData?.confirmed || 0} onaylanmış
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Kullanıcılar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userStats?.activeUsers || 0} aktif
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ortalama Rezervasyon
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(bookingStatsData?.total || 0) > 0
                      ? formatCurrency(
                          (bookingStatsData?.totalRevenue || 0) /
                            (bookingStatsData?.total || 1)
                        )
                      : formatCurrency(0)}
                  </p>
                  <p className="text-xs text-gray-500">Son 30 gün</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab Content */}
      {reportType === "bookings" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={bookingsData?.items || []}
            columns={bookingColumns}
            actions={bookingActions}
            loading={bookingsLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: bookingsData?.items?.length || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
            }}
            emptyText="Henüz rezervasyon bulunmuyor"
          />
        </div>
      )}

      {/* Revenue Tab Content */}
      {reportType === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bu Ay
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {bookingStats
                  ? formatCurrency(bookingStats.thisMonthRevenue)
                  : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {bookingStats?.thisMonthBookings || 0} rezervasyon
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Geçen Ay
              </h3>
              <p className="text-3xl font-bold text-gray-700">
                {bookingStats
                  ? formatCurrency(bookingStats.lastMonthRevenue)
                  : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {bookingStats?.lastMonthBookings || 0} rezervasyon
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Toplam
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {bookingStats
                  ? formatCurrency(bookingStats.totalRevenue)
                  : formatCurrency(0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {bookingStats?.totalBookings || 0} rezervasyon
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rezervasyon Detayları
            </h3>
            {bookingStatsData ? (
              <div className="space-y-6">
                {/* Booking Status */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Rezervasyon Durumları
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {bookingStatsData.confirmed || 0}
                      </p>
                      <p className="text-sm text-gray-600">Onaylandı</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {bookingStatsData.pending || 0}
                      </p>
                      <p className="text-sm text-gray-600">Bekliyor</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {bookingStatsData.completed || 0}
                      </p>
                      <p className="text-sm text-gray-600">Tamamlandı</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {bookingStatsData.cancelled || 0}
                      </p>
                      <p className="text-sm text-gray-600">İptal</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Rezervasyon verileri yükleniyor...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customers Tab Content */}
      {reportType === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-600">Toplam Müşteri</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {userStats?.activeUsers || 0}
                </p>
                <p className="text-sm text-gray-600">Aktif Müşteri</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {userStats?.recentUsers || 0}
                </p>
                <p className="text-sm text-gray-600">Bu Ay Yeni</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {userStats?.regularUsers || 0}
                </p>
                <p className="text-sm text-gray-600">Normal Müşteri</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Müşteri Analizi
            </h3>
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Müşteri analiz grafiği yakında eklenecek</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab Content */}
      {reportType === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performans Metrikleri
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Rezervasyon Onay Oranı
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingStats
                      ? (
                          ((bookingStats.confirmedBookings +
                            bookingStats.completedBookings) /
                            bookingStats.totalBookings) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tamamlama Oranı</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingStats
                      ? (
                          (bookingStats.completedBookings /
                            bookingStats.totalBookings) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">İptal Oranı</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingStats
                      ? (
                          (bookingStats.cancelledBookings /
                            bookingStats.totalBookings) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                İş Büyümesi
              </h3>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {bookingStats
                    ? formatPercentage(
                        getPercentageChange(
                          bookingStats.thisMonthBookings,
                          bookingStats.lastMonthBookings
                        )
                      )
                    : "0%"}
                </div>
                <p className="text-sm text-gray-600">Aylık büyüme oranı</p>
              </div>
            </div>
          </div>

          {/* Location Performance */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lokasyon Performansı
            </h3>
            {locationStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {locationStats.active}
                    </p>
                    <p className="text-sm text-gray-600">Aktif Lokasyon</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {locationStats.totalBookings}
                    </p>
                    <p className="text-sm text-gray-600">Toplam Rezervasyon</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {locationStats.topLocations?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Popüler Lokasyon</p>
                  </div>
                </div>

                {/* Top Locations */}
                {locationStats.topLocations &&
                  locationStats.topLocations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        En Popüler Lokasyonlar
                      </h4>
                      <div className="space-y-3">
                        {locationStats.topLocations.map((location: any) => (
                          <div
                            key={location.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {location.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {location.bookingCount} rezervasyon
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Lokasyon verileri yükleniyor...</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performans Trendi
            </h3>
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Performans trend grafiği yakında eklenecek</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportContainer;
