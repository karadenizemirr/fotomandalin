"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  SelectField,
  TextareaField,
} from "@/components/organisms/form/FormField";
import { Dialog } from "@/components/organisms/dialog";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Banknote,
  Building2,
  Bitcoin,
  Receipt,
  Minus,
  Plus,
} from "lucide-react";

// Validation schemas
const createPaymentSchema = z.object({
  bookingId: z.string().min(1, "Rezervasyon seçimi gereklidir"),
  amount: z.number().min(0.01, "Ödeme tutarı en az 0.01 olmalıdır"),
  method: z.enum(["CREDIT_CARD", "BANK_TRANSFER", "CASH", "CRYPTO"]),
  gateway: z.string().optional(),
  transactionId: z.string().optional(),
});

const updatePaymentSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIAL"]),
  gateway: z.string().optional(),
  transactionId: z.string().optional(),
});

const refundPaymentSchema = z.object({
  id: z.string(),
  amount: z.number().min(0.01, "İade tutarı en az 0.01 olmalıdır"),
  reason: z.string().min(1, "İade sebebi gereklidir"),
});

type CreatePaymentData = z.infer<typeof createPaymentSchema>;
type UpdatePaymentData = z.infer<typeof updatePaymentSchema>;
type RefundPaymentData = z.infer<typeof refundPaymentSchema>;

const PaymentContainer = () => {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks - Payment endpoint'leri mevcut değil, booking'den veri alıyoruz
  const {
    data: bookingsWithPayments,
    isLoading,
    refetch,
  } = trpc.booking.list.useQuery({
    limit: 100, // Daha fazla veri için
    sortBy: "created",
    sortOrder: "desc",
  });

  // Payment istatistikleri için booking stats kullanıyoruz
  const { data: bookingStats } = trpc.booking.stats.useQuery({});

  // Booking verisi için ayrı query - form için
  const { data: bookingsForForm } = trpc.booking.list.useQuery({
    limit: 100,
    cursor: undefined,
    sortBy: "created",
    sortOrder: "desc",
  });

  // Mutations - Payment CRUD endpoint'leri yok, placeholder olarak bırakıyoruz
  // const createMutation = trpc.payment.create.useMutation();
  // const updateMutation = trpc.payment.update.useMutation();
  // const refundMutation = trpc.payment.refund.useMutation();

  // Filtered data - booking'lerin payment bilgilerinden türetiriz
  const filteredData = useMemo(() => {
    if (!bookingsWithPayments?.items) return [];

    // Bookings'leri payment'lara çevir (sadece ödeme yapılmış olanlar)
    const paymentItems = bookingsWithPayments.items
      .filter((booking: any) => booking.totalAmount > 0) // Ödemesi olan rezervasyonlar
      .map((booking: any) => ({
        id: booking.id,
        amount: parseFloat(booking.totalAmount || "0"),
        status:
          booking.status === "CONFIRMED"
            ? "PAID"
            : booking.status === "PENDING"
            ? "PENDING"
            : booking.status === "CANCELLED"
            ? "FAILED"
            : "PENDING",
        method: "CREDIT_CARD", // Varsayılan
        gatewayProvider: "iyzico",
        gatewayPaymentId: booking.id.slice(-8),
        booking: booking,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      }));

    let filtered = [...paymentItems];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((payment) => {
        try {
          const gatewayMatch =
            payment.gatewayProvider?.toLowerCase?.()?.includes?.(searchLower) ||
            false;
          const userNameMatch =
            payment.booking?.user?.name
              ?.toLowerCase?.()
              ?.includes?.(searchLower) || false;
          const userEmailMatch =
            payment.booking?.user?.email
              ?.toLowerCase?.()
              ?.includes?.(searchLower) || false;
          return gatewayMatch || userNameMatch || userEmailMatch;
        } catch {
          return false;
        }
      });
    }

    return filtered;
  }, [bookingsWithPayments?.items, searchTerm]);

  // Handle form submission for create - Payment endpoint'leri yok, placeholder
  const handleCreate = async (data: CreatePaymentData) => {
    try {
      // await createMutation.mutateAsync(data);

      // Placeholder - Gerçek implementasyon için payment endpoint'leri gerekli
      throw new Error(
        "Payment oluşturma endpoint'i henüz implementasyonda yok"
      );

      addToast({
        message: "Ödeme başarıyla oluşturuldu",
        type: "success",
      });
      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Ödeme oluşturulurken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle form submission for update - Payment endpoint'leri yok, placeholder
  const handleUpdate = async (data: UpdatePaymentData) => {
    try {
      // await updateMutation.mutateAsync(data);

      // Placeholder - Gerçek implementasyon için payment endpoint'leri gerekli
      throw new Error(
        "Payment güncelleme endpoint'i henüz implementasyonda yok"
      );

      addToast({
        message: "Ödeme başarıyla güncellendi",
        type: "success",
      });
      setIsUpdateModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Ödeme güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle refund - Payment endpoint'leri yok, placeholder
  const handleRefund = async (data: RefundPaymentData) => {
    try {
      // await refundMutation.mutateAsync(data);

      // Placeholder - Gerçek implementasyon için payment endpoint'leri gerekli
      throw new Error("Payment iade endpoint'i henüz implementasyonda yok");

      addToast({
        message: "İade başarıyla işlendi",
        type: "success",
      });
      setIsRefundModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "İade işlenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  // Get status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      PENDING: {
        label: "Bekliyor",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-3 h-3" />,
      },
      PAID: {
        label: "Ödendi",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      FAILED: {
        label: "Başarısız",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3" />,
      },
      REFUNDED: {
        label: "İade",
        color: "bg-purple-100 text-purple-800",
        icon: <RotateCcw className="w-3 h-3" />,
      },
      PARTIAL: {
        label: "Kısmi",
        color: "bg-blue-100 text-blue-800",
        icon: <Minus className="w-3 h-3" />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  // Get method icon
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CREDIT_CARD":
        return <CreditCard className="w-4 h-4" />;
      case "BANK_TRANSFER":
        return <Building2 className="w-4 h-4" />;
      case "CASH":
        return <Banknote className="w-4 h-4" />;
      case "CRYPTO":
        return <Bitcoin className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  // Get method label
  const getMethodLabel = (method: string) => {
    switch (method) {
      case "CREDIT_CARD":
        return "Kredi Kartı";
      case "BANK_TRANSFER":
        return "Banka Transferi";
      case "CASH":
        return "Nakit";
      case "CRYPTO":
        return "Kripto Para";
      default:
        return method;
    }
  };

  // DataTable columns
  const columns = [
    {
      key: "payment",
      title: "Ödeme",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">
            {record.gatewayPaymentId || `#${record.id.slice(-8)}`}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(record.createdAt).toLocaleDateString("tr-TR")}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      title: "Müşteri",
      width: "180px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {record.booking?.user?.name || "Bilinmiyor"}
          </div>
          <div className="text-xs text-gray-500">
            {record.booking?.user?.email}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Tutar",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(record.amount)}
        </div>
      ),
    },
    {
      key: "method",
      title: "Yöntem",
      width: "140px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-2">
          {getMethodIcon(record.method)}
          <span className="text-sm text-gray-700">
            {getMethodLabel(record.method)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "Durum",
      width: "120px",
      render: (value: any, record: any) => (
        <StatusBadge status={record.status} />
      ),
    },
    {
      key: "booking",
      title: "Rezervasyon",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="text-sm text-gray-700">
          #{record.booking?.id?.slice(-8) || "Yok"}
        </div>
      ),
    },
  ];

  // Table actions
  const actions: any[] = [
    {
      key: "view",
      label: "Detay",
      icon: <Eye className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedPayment(record);
        setIsDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedPayment(record);
        setIsUpdateModalOpen(true);
      },
    },
    {
      key: "refund",
      label: "İade",
      icon: <RotateCcw className="w-4 h-4" />,
      onClick: (record: any) => {
        if (record.status === "PAID") {
          setSelectedPayment(record);
          setIsRefundModalOpen(true);
        }
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Yönetimi</h1>
          <p className="text-gray-600">Ödemeleri takip edin ve yönetin</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Dışa Aktar</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ödeme</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {bookingStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Gelir
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(bookingStats.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Rezervasyon
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookingStats.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Onaylanmış</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookingStats.confirmed || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ortalama Tutar
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    bookingStats.total > 0
                      ? (bookingStats.totalRevenue || 0) / bookingStats.total
                      : 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filtreler:
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="PENDING">Bekliyor</option>
              <option value="PAID">Ödendi</option>
              <option value="FAILED">Başarısız</option>
              <option value="REFUNDED">İade</option>
              <option value="PARTIAL">Kısmi</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Yöntemler</option>
              <option value="CREDIT_CARD">Kredi Kartı</option>
              <option value="BANK_TRANSFER">Banka Transferi</option>
              <option value="CASH">Nakit</option>
              <option value="CRYPTO">Kripto Para</option>
            </select>

            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Başlangıç tarihi"
            />

            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Bitiş tarihi"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Ödeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          emptyText="Henüz ödeme bulunmuyor"
        />
      </div>

      {/* Create Payment Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Ödeme"
        description="Rezervasyon için yeni ödeme oluşturun"
        size="md"
      >
        <Form
          schema={createPaymentSchema}
          defaultValues={{
            bookingId: "",
            amount: 0,
            method: "CREDIT_CARD",
            gateway: "",
            transactionId: "",
          }}
          onSubmit={handleCreate}
        >
          <div className="space-y-4">
            <SelectField
              name="bookingId"
              label="Rezervasyon"
              required
              options={
                bookingsForForm?.items?.map((booking: any) => ({
                  label: `#${booking.id.slice(-8)} - ${
                    booking.user?.name || "Bilinmiyor"
                  }`,
                  value: booking.id,
                })) || []
              }
            />

            <TextField
              name="amount"
              label="Tutar"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
            />

            <SelectField
              name="method"
              label="Ödeme Yöntemi"
              required
              options={[
                { label: "Kredi Kartı", value: "CREDIT_CARD" },
                { label: "Banka Transferi", value: "BANK_TRANSFER" },
                { label: "Nakit", value: "CASH" },
                { label: "Kripto Para", value: "CRYPTO" },
              ]}
            />

            <TextField
              name="gateway"
              label="Ödeme Sağlayıcısı"
              placeholder="Örn: iyzico, paytr, vb."
            />

            <TextField
              name="transactionId"
              label="İşlem ID"
              placeholder="Ödeme sağlayıcısından gelen işlem ID"
            />
          </div>
        </Form>
      </Dialog>

      {/* Update Payment Modal */}
      {selectedPayment && (
        <Dialog
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title="Ödeme Güncelle"
          description="Ödeme bilgilerini güncelleyin"
          size="md"
        >
          <Form
            schema={updatePaymentSchema}
            defaultValues={{
              id: selectedPayment.id,
              status: selectedPayment.status,
              gateway: selectedPayment.gatewayProvider || "",
              transactionId: selectedPayment.gatewayPaymentId || "",
            }}
            onSubmit={handleUpdate}
          >
            <div className="space-y-4">
              <SelectField
                name="status"
                label="Durum"
                required
                options={[
                  { label: "Bekliyor", value: "PENDING" },
                  { label: "Ödendi", value: "PAID" },
                  { label: "Başarısız", value: "FAILED" },
                  { label: "İade", value: "REFUNDED" },
                  { label: "Kısmi", value: "PARTIAL" },
                ]}
              />

              <TextField
                name="gateway"
                label="Ödeme Sağlayıcısı"
                placeholder="Örn: iyzico, paytr, vb."
              />

              <TextField
                name="transactionId"
                label="İşlem ID"
                placeholder="Ödeme sağlayıcısından gelen işlem ID"
              />
            </div>
          </Form>
        </Dialog>
      )}

      {/* Refund Payment Modal */}
      {selectedPayment && (
        <Dialog
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title="Ödeme İadesi"
          description="Ödeme iadesi işlemini gerçekleştirin"
          size="md"
        >
          <Form
            schema={refundPaymentSchema}
            defaultValues={{
              id: selectedPayment.id,
              amount: selectedPayment.amount,
              reason: "",
            }}
            onSubmit={handleRefund}
          >
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Bu işlem geri alınamaz. İade tutarını ve sebebini dikkatli
                    kontrol edin.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Ödeme Bilgileri
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orijinal Tutar:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedPayment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">İşlem ID:</span>
                    <span className="font-medium">
                      {selectedPayment.transactionId || "Yok"}
                    </span>
                  </div>
                </div>
              </div>

              <TextField
                name="amount"
                label="İade Tutarı"
                type="number"
                step="0.01"
                min="0.01"
                max={selectedPayment.amount}
                required
              />

              <TextareaField
                name="reason"
                label="İade Sebebi"
                placeholder="İade işleminin sebebini açıklayın..."
                rows={3}
                required
              />
            </div>
          </Form>
        </Dialog>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <Dialog
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Ödeme Detayları"
          description={`#${
            selectedPayment.gatewayPaymentId || selectedPayment.id.slice(-8)
          }`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ödeme Bilgileri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Tutar:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Durum:
                      </span>
                      <StatusBadge status={selectedPayment.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Yöntem:
                      </span>
                      <div className="flex items-center space-x-1">
                        {getMethodIcon(selectedPayment.method)}
                        <span className="text-sm text-gray-900">
                          {getMethodLabel(selectedPayment.method)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        İşlem ID:
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedPayment.gatewayPaymentId || "Yok"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Sağlayıcı:
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedPayment.gatewayProvider || "Yok"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedPayment.booking && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Rezervasyon Bilgileri
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Rezervasyon ID:
                        </span>
                        <span className="text-sm text-gray-900">
                          #{selectedPayment.booking.id.slice(-8)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Müşteri:
                        </span>
                        <span className="text-sm text-gray-900">
                          {selectedPayment.booking.user?.name || "Bilinmiyor"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          E-posta:
                        </span>
                        <span className="text-sm text-gray-900">
                          {selectedPayment.booking.user?.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          Rezervasyon Tarihi:
                        </span>
                        <span className="text-sm text-gray-900">
                          {new Date(
                            selectedPayment.booking.startTime
                          ).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Zaman Bilgileri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Rezervasyon ID:
                      </span>
                      <span className="text-sm text-gray-900">
                        #{selectedPayment.booking.id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Müşteri:
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedPayment.booking.user?.name || "Bilinmiyor"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        E-posta:
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedPayment.booking.user?.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Rezervasyon Tarihi:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(
                          selectedPayment.booking.startTime
                        ).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Zaman Bilgileri
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Oluşturulma:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedPayment.createdAt).toLocaleString(
                          "tr-TR"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Güncelleme:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(selectedPayment.updatedAt).toLocaleString(
                          "tr-TR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedPayment.status === "PAID" && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsRefundModalOpen(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>İade Et</span>
                </button>
              )}
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsUpdateModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentContainer;
