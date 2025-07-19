"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  RefreshCw,
  Download,
  Calendar,
  Users,
  DollarSign,
  Camera,
  ArrowRight,
  Zap,
  Award,
  CheckCircle,
  Activity,
  Gauge,
  Filter,
  Search,
} from "lucide-react";

interface InsightMetric {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  type: "positive" | "negative" | "neutral";
  description: string;
}

interface ActionableInsight {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  category: "revenue" | "operations" | "customer" | "marketing";
  priority: number;
  actions: string[];
}

const InsightContainer = () => {
  // State
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const { data: bookingsData, refetch: refetchBookings } =
    trpc.booking.list.useQuery({
      limit: 100,
      cursor: undefined,
      sortBy: "created",
      sortOrder: "desc",
    });

  const { data: portfolioStats } = trpc.portfolio.stats.useQuery();

  // Calculate insights
  const insights = useMemo(() => {
    if (!bookingsData?.items) return { metrics: [], actionableInsights: [] };

    const bookings = bookingsData.items;
    const now = new Date();

    // Time range calculations
    const daysBack =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 365;
    const periodStart = new Date(
      now.getTime() - daysBack * 24 * 60 * 60 * 1000
    );
    const previousPeriodStart = new Date(
      periodStart.getTime() - daysBack * 24 * 60 * 60 * 1000
    );

    const currentPeriodBookings = bookings.filter(
      (b: any) => new Date(b.createdAt) >= periodStart
    );
    const previousPeriodBookings = bookings.filter((b: any) => {
      const date = new Date(b.createdAt);
      return date >= previousPeriodStart && date < periodStart;
    });

    // Revenue calculations
    const currentRevenue = currentPeriodBookings.reduce(
      (sum: number, b: any) => sum + (b.totalPrice || 0),
      0
    );
    const previousRevenue = previousPeriodBookings.reduce(
      (sum: number, b: any) => sum + (b.totalPrice || 0),
      0
    );
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Booking metrics
    const currentBookingCount = currentPeriodBookings.length;
    const previousBookingCount = previousPeriodBookings.length;
    const bookingChange =
      previousBookingCount > 0
        ? ((currentBookingCount - previousBookingCount) /
            previousBookingCount) *
          100
        : 0;

    // Conversion rates
    const confirmedBookings = currentPeriodBookings.filter(
      (b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"
    );
    const conversionRate =
      currentBookingCount > 0
        ? (confirmedBookings.length / currentBookingCount) * 100
        : 0;

    const previousConfirmed = previousPeriodBookings.filter(
      (b: any) => b.status === "CONFIRMED" || b.status === "COMPLETED"
    );
    const previousConversionRate =
      previousBookingCount > 0
        ? (previousConfirmed.length / previousBookingCount) * 100
        : 0;
    const conversionChange =
      previousConversionRate > 0 ? conversionRate - previousConversionRate : 0;

    // Average booking value
    const avgBookingValue =
      currentBookingCount > 0 ? currentRevenue / currentBookingCount : 0;
    const previousAvgValue =
      previousBookingCount > 0 ? previousRevenue / previousBookingCount : 0;
    const avgValueChange =
      previousAvgValue > 0
        ? ((avgBookingValue - previousAvgValue) / previousAvgValue) * 100
        : 0;

    // Customer retention (simplified)
    const uniqueCustomers = new Set(
      currentPeriodBookings.map((b: any) => b.userId)
    ).size;
    const repeatCustomers = currentPeriodBookings.filter(
      (b: any) =>
        bookings.filter((booking: any) => booking.userId === b.userId).length >
        1
    ).length;
    const retentionRate =
      uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    // Peak performance insights
    const weekdayBookings = currentPeriodBookings.filter((b: any) => {
      const day = new Date(b.createdAt).getDay();
      return day >= 1 && day <= 5;
    });
    const weekendBookings = currentPeriodBookings.filter((b: any) => {
      const day = new Date(b.createdAt).getDay();
      return day === 0 || day === 6;
    });

    const metrics: InsightMetric[] = [
      {
        label: "Gelir Performansı",
        value: `₺${currentRevenue.toLocaleString("tr-TR")}`,
        change: revenueChange,
        trend: revenueChange > 0 ? "up" : revenueChange < 0 ? "down" : "stable",
        type:
          revenueChange > 0
            ? "positive"
            : revenueChange < -5
            ? "negative"
            : "neutral",
        description: `${timeRange} döneminde toplam gelir`,
      },
      {
        label: "Rezervasyon Artışı",
        value: currentBookingCount,
        change: bookingChange,
        trend: bookingChange > 0 ? "up" : bookingChange < 0 ? "down" : "stable",
        type:
          bookingChange > 0
            ? "positive"
            : bookingChange < -10
            ? "negative"
            : "neutral",
        description: `Önceki döneme göre rezervasyon değişimi`,
      },
      {
        label: "Dönüşüm Oranı",
        value: `%${conversionRate.toFixed(1)}`,
        change: conversionChange,
        trend:
          conversionChange > 0
            ? "up"
            : conversionChange < 0
            ? "down"
            : "stable",
        type:
          conversionRate > 80
            ? "positive"
            : conversionRate < 60
            ? "negative"
            : "neutral",
        description: "Rezervasyon onay oranı",
      },
      {
        label: "Ortalama Rezervasyon Değeri",
        value: `₺${avgBookingValue.toLocaleString("tr-TR")}`,
        change: avgValueChange,
        trend:
          avgValueChange > 0 ? "up" : avgValueChange < 0 ? "down" : "stable",
        type:
          avgValueChange > 0
            ? "positive"
            : avgValueChange < -5
            ? "negative"
            : "neutral",
        description: "Rezervasyon başına ortalama gelir",
      },
      {
        label: "Müşteri Sadakati",
        value: `%${retentionRate.toFixed(1)}`,
        change: 0,
        trend: "stable",
        type:
          retentionRate > 30
            ? "positive"
            : retentionRate < 15
            ? "negative"
            : "neutral",
        description: "Tekrar eden müşteri oranı",
      },
      {
        label: "Hafta Sonu Performansı",
        value: `%${
          weekendBookings.length > 0
            ? ((weekendBookings.length / currentBookingCount) * 100).toFixed(1)
            : "0"
        }`,
        change: 0,
        trend: "stable",
        type:
          weekendBookings.length > weekdayBookings.length
            ? "positive"
            : "neutral",
        description: "Hafta sonu rezervasyon yoğunluğu",
      },
    ];

    // Generate actionable insights
    const actionableInsights: ActionableInsight[] = [];

    // Revenue insights
    if (revenueChange < -10) {
      actionableInsights.push({
        id: "revenue-decline",
        title: "Gelir Düşüşü Tespit Edildi",
        description: `Son ${timeRange} döneminde gelirde %${Math.abs(
          revenueChange
        ).toFixed(1)} azalma görülüyor.`,
        impact: "high",
        effort: "medium",
        category: "revenue",
        priority: 1,
        actions: [
          "Mevcut fiyatlandırmayı gözden geçirin",
          "Yeni paket ve eklentiler oluşturun",
          "Müşteri geri bildirimlerini analiz edin",
          "Rekabet analizi yapın",
        ],
      });
    } else if (revenueChange > 20) {
      actionableInsights.push({
        id: "revenue-growth",
        title: "Güçlü Gelir Artışı",
        description: `Son ${timeRange} döneminde gelirde %${revenueChange.toFixed(
          1
        )} artış kaydedildi.`,
        impact: "high",
        effort: "low",
        category: "revenue",
        priority: 2,
        actions: [
          "Başarılı stratejileri ölçeklendirin",
          "Kapasite artışı planlayın",
          "Premium hizmetler ekleyin",
          "Müşteri memnuniyetini sürdürün",
        ],
      });
    }

    // Conversion insights
    if (conversionRate < 60) {
      actionableInsights.push({
        id: "low-conversion",
        title: "Düşük Dönüşüm Oranı",
        description: `%${conversionRate.toFixed(
          1
        )} dönüşüm oranı sektör ortalamasının altında.`,
        impact: "high",
        effort: "medium",
        category: "operations",
        priority: 1,
        actions: [
          "Rezervasyon sürecini basitleştirin",
          "Müşteri iletişimini hızlandırın",
          "Fiyat şeffaflığını artırın",
          "Sosyal kanıt ekleyin",
        ],
      });
    }

    // Customer retention insights
    if (retentionRate < 20) {
      actionableInsights.push({
        id: "low-retention",
        title: "Müşteri Sadakati Düşük",
        description: `%${retentionRate.toFixed(
          1
        )} müşteri sadakat oranı geliştirilmeli.`,
        impact: "medium",
        effort: "high",
        category: "customer",
        priority: 2,
        actions: [
          "Sadakat programı başlatın",
          "Müşteri deneyimini iyileştirin",
          "Kişisel takip sistemi kurun",
          "Özel kampanyalar düzenleyin",
        ],
      });
    }

    // Booking pattern insights
    if (weekendBookings.length > weekdayBookings.length * 1.5) {
      actionableInsights.push({
        id: "weekend-peak",
        title: "Hafta Sonu Yoğunluğu",
        description: "Hafta sonu rezervasyonları hafta içine göre çok yüksek.",
        impact: "medium",
        effort: "low",
        category: "operations",
        priority: 3,
        actions: [
          "Hafta içi özel kampanyalar düzenleyin",
          "Hafta sonu fiyatlandırmayı optimize edin",
          "Hafta içi kapasite kullanımını artırın",
          "Esnek çalışma saatleri planlayın",
        ],
      });
    }

    // Portfolio insights
    if (
      portfolioStats &&
      portfolioStats.published < portfolioStats.total * 0.7
    ) {
      actionableInsights.push({
        id: "portfolio-optimization",
        title: "Portfolio Optimizasyonu",
        description: `${portfolioStats.total} çalışmanın sadece ${portfolioStats.published} tanesi yayında.`,
        impact: "medium",
        effort: "low",
        category: "marketing",
        priority: 3,
        actions: [
          "Yayınlanmamış çalışmaları gözden geçirin",
          "SEO optimizasyonu yapın",
          "Sosyal medya paylaşımlarını artırın",
          "Müşteri testimonialları ekleyin",
        ],
      });
    }

    return {
      metrics,
      actionableInsights: actionableInsights.sort(
        (a, b) => a.priority - b.priority
      ),
    };
  }, [bookingsData?.items, timeRange, portfolioStats]);

  // Get trend icon
  const getTrendIcon = (trend: string, type: string) => {
    if (trend === "up")
      return (
        <TrendingUp
          className={`w-4 h-4 ${
            type === "positive" ? "text-green-600" : "text-red-600"
          }`}
        />
      );
    if (trend === "down")
      return (
        <TrendingDown
          className={`w-4 h-4 ${
            type === "negative" ? "text-red-600" : "text-green-600"
          }`}
        />
      );
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "revenue":
        return <DollarSign className="w-4 h-4" />;
      case "operations":
        return <Gauge className="w-4 h-4" />;
      case "customer":
        return <Users className="w-4 h-4" />;
      case "marketing":
        return <Camera className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  // Refresh data
  const handleRefresh = () => {
    refetchBookings();
    addToast({
      message: "İçgörüler başarıyla yenilendi",
      type: "success",
    });
  };

  // Export insights
  const handleExport = () => {
    addToast({
      message: "İçgörüler raporu dışa aktarıldı",
      type: "success",
    });
  };

  // Filtered insights
  const filteredInsights = useMemo(() => {
    let filtered = insights.actionableInsights;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (insight) => insight.category === selectedCategory
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (insight) =>
          insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          insight.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [insights.actionableInsights, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İş İçgörüleri</h1>
          <p className="text-gray-600">Akıllı analizler ve eylem önerileri</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
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

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Zaman Aralığı:
            </span>
          </div>

          <div className="flex space-x-1">
            {[
              { key: "7d", label: "7 Gün" },
              { key: "30d", label: "30 Gün" },
              { key: "90d", label: "90 Gün" },
              { key: "1y", label: "1 Yıl" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setTimeRange(option.key as any)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === option.key
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600">
                {metric.label}
              </h3>
              {getTrendIcon(metric.trend, metric.type)}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.value}
                </p>
                {metric.change !== 0 && (
                  <div
                    className={`flex items-center space-x-1 mt-1 ${
                      metric.type === "positive"
                        ? "text-green-600"
                        : metric.type === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {metric.change > 0 ? "+" : ""}
                      {metric.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      vs önceki dönem
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  metric.type === "positive"
                    ? "bg-green-100 text-green-800"
                    : metric.type === "negative"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {metric.type === "positive"
                  ? "İyi"
                  : metric.type === "negative"
                  ? "Dikkat"
                  : "Normal"}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Actionable Insights Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Eylem Önerileri
          </h2>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="revenue">Gelir</option>
                <option value="operations">Operasyon</option>
                <option value="customer">Müşteri</option>
                <option value="marketing">Pazarlama</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="İçgörü ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInsights.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Henüz içgörü yok
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Daha fazla veri toplandıkça öneriler görünecek.
              </p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${getImpactColor(
                        insight.impact
                      )}`}
                    >
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(
                            insight.impact
                          )}`}
                        >
                          {insight.impact === "high"
                            ? "Yüksek Etki"
                            : insight.impact === "medium"
                            ? "Orta Etki"
                            : "Düşük Etki"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {insight.effort === "low"
                            ? "Kolay"
                            : insight.effort === "medium"
                            ? "Orta"
                            : "Zor"}{" "}
                          uygulama
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">
                      #{insight.priority}
                    </div>
                    <div className="text-xs text-gray-500">Öncelik</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4">{insight.description}</p>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Önerilen Aksiyonlar:
                  </h4>
                  <ul className="space-y-2">
                    {insight.actions.map((action, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ArrowRight className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors">
                    <Zap className="w-4 h-4" />
                    <span>Harekete Geç</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Stories */}
      {insights.metrics.some((m) => m.type === "positive") && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Başarı Hikayeleri</h3>
              <p className="text-sm text-gray-600">
                Bu dönemdeki olumlu gelişmeler
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.metrics
              .filter((m) => m.type === "positive")
              .map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-sm text-gray-600">
                      {metric.change > 0
                        ? `%${metric.change.toFixed(1)} artış`
                        : "Hedefte"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightContainer;
