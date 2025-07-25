"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  TextareaField,
  SelectField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  Filter,
  Download,
} from "lucide-react";

// Validation schemas
const bookingCreateSchema = z.object({
  packageId: z.string().min(1, "Paket seçimi gereklidir"),
  customerName: z.string().min(1, "Müşteri adı gereklidir"),
  customerEmail: z.string().email("Geçerli email adresi gereklidir"),
  customerPhone: z.string().min(1, "Telefon numarası gereklidir"),
  startTime: z.string().min(1, "Başlangıç tarihi gereklidir"),
  endTime: z.string().min(1, "Bitiş tarihi gereklidir"),
  locationId: z.string().optional(),
  staffId: z.string().optional(),
  specialNotes: z.string().optional(),
});

const bookingUpdateSchema = bookingCreateSchema.extend({
  id: z.string(),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "RESCHEDULED",
    ])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIAL"])
    .optional(),
});

type BookingFormData = z.infer<typeof bookingCreateSchema>;
type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;

const CalendarContainer = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = trpc.booking.list.useQuery({
    limit: pageSize,
    cursor: undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    sortBy: "startTime",
    sortOrder: "desc",
  });

  const { data: packagesData } = trpc.package.list.useQuery({
    limit: 100,
    includeInactive: false,
  });

  const { data: locationsData } = trpc.location.getAll.useQuery({
    limit: 100,
    includeInactive: false,
  });

  const { data: staffData } = trpc.staff.getAll.useQuery({
    limit: 100,
    isActive: true,
  });

  // Mutations
  const createMutation = trpc.booking.create.useMutation();
  const updateMutation = trpc.booking.update.useMutation();
  const deleteMutation = trpc.booking.cancel.useMutation();

  // Filtered data
  const filteredData = useMemo(() => {
    if (!bookingsData?.items) return [];
    return bookingsData.items;
  }, [bookingsData?.items]);

  // Handle form submission for create
  const handleCreate = async (data: BookingFormData) => {
    try {
      // Validate and convert dates properly
      if (!data.startTime || !data.endTime) {
        throw new Error("Başlangıç ve bitiş tarihi gereklidir");
      }

      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);

      // Validate dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Geçersiz tarih formatı");
      }

      if (startTime >= endTime) {
        throw new Error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      }

      if (startTime < new Date()) {
        throw new Error("Rezervasyon tarihi geçmiş bir tarih olamaz");
      }

      // Calculate total amount based on package
      const selectedPackage = packagesData?.items?.find(
        (p: any) => p.id === data.packageId
      );
      const totalAmount = selectedPackage?.basePrice || 0;

      // Prepare the data for API
      const reservationData = {
        packageId: data.packageId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        startTime,
        endTime,
        totalAmount: Number(totalAmount),
        locationId: data.locationId || undefined,
        staffId: data.staffId || undefined,
        specialNotes: data.specialNotes || undefined,
      };

      await createMutation.mutateAsync(reservationData);

      addToast({
        type: "success",
        title: "Rezervasyon Oluşturuldu!",
        message: "Yeni rezervasyon başarıyla sisteme eklendi",
        duration: 4000,
      });

      setIsCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Rezervasyon Hatası!",
        message: error.message || "Rezervasyon oluşturulurken bir hata oluştu",
        duration: 6000,
      });
    }
  };

  // Handle form submission for update
  const handleUpdate = async (data: BookingUpdateData) => {
    try {
      const updateData: any = { ...data };

      if (data.startTime) {
        updateData.startTime = new Date(data.startTime);
      }
      if (data.endTime) {
        updateData.endTime = new Date(data.endTime);
      }

      await updateMutation.mutateAsync(updateData);

      addToast({
        message: "Rezervasyon başarıyla güncellendi",
        type: "success",
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Rezervasyon güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedBooking) {
        await deleteMutation.mutateAsync({
          id: selectedBooking.id,
          reason: "Admin tarafından silindi",
        });
        addToast({
          message: "Rezervasyon başarıyla iptal edildi",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        refetch();
      }
    } catch (error: any) {
      addToast({
        message: error.message || "Rezervasyon iptal edilirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
        text: "Bekliyor",
      },
      CONFIRMED: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Onaylandı",
      },
      IN_PROGRESS: {
        color: "bg-purple-100 text-purple-800",
        icon: Clock,
        text: "Devam Ediyor",
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Tamamlandı",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "İptal Edildi",
      },
      RESCHEDULED: {
        color: "bg-orange-100 text-orange-800",
        icon: Calendar,
        text: "Ertelendi",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{config.text}</span>
      </span>
    );
  };

  // Payment status badge component
  const PaymentStatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      PENDING: { color: "bg-gray-100 text-gray-800", text: "Bekliyor" },
      PAID: { color: "bg-green-100 text-green-800", text: "Ödendi" },
      FAILED: { color: "bg-red-100 text-red-800", text: "Başarısız" },
      REFUNDED: { color: "bg-blue-100 text-blue-800", text: "İade Edildi" },
      PARTIAL: { color: "bg-yellow-100 text-yellow-800", text: "Kısmi" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <CreditCard className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{config.text}</span>
      </span>
    );
  };

  // DataTable columns
  const columns = [
    {
      key: "bookingCode",
      title: "Kod",
      dataIndex: "bookingCode",
      sortable: true,
      width: "120px",
      render: (value: string) => (
        <span className="font-mono text-xs sm:text-sm font-medium text-gray-900 break-all">
          {value}
        </span>
      ),
    },
    {
      key: "customer",
      title: "Müşteri",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-xs sm:text-sm text-gray-900 truncate">
              {record.customerName}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">
              {record.customerEmail}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {record.customerPhone}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "package",
      title: "Paket",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-2">
          <Package className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-700 truncate">
            {record.package?.name}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      title: "Tarih",
      width: "140px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700">
              {new Date(record.startTime).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-700">
              {new Date(record.startTime).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "staff",
      title: "Personel",
      width: "100px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-1">
          <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-700 truncate">
            {record.staff?.name || "Yok"}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      title: "Lokasyon",
      width: "100px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-700 truncate">
            {record.location?.name || "Yok"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Tutar",
      width: "80px",
      render: (value: any, record: any) => (
        <span className="font-medium text-xs sm:text-sm text-gray-900">
          ₺{Number(record.totalAmount).toLocaleString("tr-TR")}
        </span>
      ),
    },
    {
      key: "status",
      title: "Durum",
      width: "100px",
      render: (value: any, record: any) => (
        <StatusBadge status={record.status} />
      ),
    },
    {
      key: "paymentStatus",
      title: "Ödeme",
      width: "90px",
      render: (value: any, record: any) => (
        <PaymentStatusBadge status={record.paymentStatus} />
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      key: "view",
      label: "Detay",
      icon: <Eye className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedBooking(record);
        setIsDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedBooking(record);
        setIsEditModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedBooking(record);
        setIsDeleteModalOpen(true);
      },
      className: "text-red-600 hover:text-red-700",
    },
  ];

  // Package options
  const packageOptions = useMemo(() => {
    return (
      packagesData?.items?.map((pkg: any) => ({
        value: pkg.id,
        label: `${pkg.name} - ₺${Number(pkg.basePrice).toLocaleString(
          "tr-TR"
        )}`,
      })) || []
    );
  }, [packagesData]);

  // Location options
  const locationOptions = useMemo(() => {
    return (
      locationsData?.locations?.map((location: any) => ({
        value: location.id,
        label: location.name,
      })) || []
    );
  }, [locationsData]);

  // Staff options
  const staffOptions = useMemo(() => {
    return (
      staffData?.staff?.map((staff: any) => ({
        value: staff.id,
        label: `${staff.name} - ${staff.title || "Personel"}`,
      })) || []
    );
  }, [staffData]);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Rezervasyon Yönetimi
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Rezervasyonları görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-2 sm:space-x-3">
            <button
              onClick={() => refetch()}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Yenile</span>
            </button>
            <button className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Rezervasyon</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filtreler:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="PENDING">Bekliyor</option>
              <option value="CONFIRMED">Onaylandı</option>
              <option value="IN_PROGRESS">Devam Ediyor</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Lokasyonlar</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Rezervasyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
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
            emptyText="Henüz rezervasyon bulunmuyor"
            className="min-w-full"
          />
        </div>
      </div>

      {/* Create Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Yeni Rezervasyon Ekle"
        description="Sisteme yeni bir rezervasyon ekleyin"
        size="lg"
      >
        <Form
          schema={bookingCreateSchema}
          defaultValues={{
            packageId: "",
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            startTime: "",
            endTime: "",
            locationId: "",
            staffId: "",
            specialNotes: "",
          }}
          onSubmit={handleCreate}
        >
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <TextField
                name="customerName"
                label="Müşteri Adı"
                placeholder="Örn: Ahmet Yılmaz"
                required
              />

              <TextField
                name="customerEmail"
                label="Email Adresi"
                placeholder="ahmet@example.com"
                type="email"
                required
              />

              <TextField
                name="customerPhone"
                label="Telefon"
                placeholder="0532 123 45 67"
                required
              />

              <SelectField
                name="packageId"
                label="Paket"
                placeholder="Paket seçin"
                options={[
                  { value: "", label: "Paket seçin" },
                  ...packageOptions,
                ]}
                required
              />
            </div>

            <div className="space-y-4">
              <TextField
                name="startTime"
                label="Başlangıç Tarihi ve Saati"
                type="datetime-local"
                required
              />

              <TextField
                name="endTime"
                label="Bitiş Tarihi ve Saati"
                type="datetime-local"
                required
              />

              <SelectField
                name="locationId"
                label="Lokasyon"
                placeholder="Lokasyon seçin"
                options={[
                  { value: "", label: "Lokasyon seçin" },
                  ...locationOptions,
                ]}
              />

              <SelectField
                name="staffId"
                label="Personel"
                placeholder="Personel seçin (opsiyonel)"
                options={[
                  { value: "", label: "Otomatik atama" },
                  ...staffOptions,
                ]}
              />

              <TextareaField
                name="specialNotes"
                label="Özel Notlar"
                placeholder="Özel istekler, notlar..."
                rows={3}
              />
            </div>

            {/* Submit Button Section */}
            <div className="flex flex-col sm:flex-row justify-end pt-6 border-t space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full sm:w-auto px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {createMutation.isPending ? (
                  <div className="flex items-center justify-center">
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
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    <span className="text-sm sm:text-base">
                      Oluşturuluyor...
                    </span>
                  </div>
                ) : (
                  "Rezervasyon Oluştur"
                )}
              </button>
            </div>
          </div>
        </Form>
      </Dialog>

      {/* Edit Modal */}
      {selectedBooking && (
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Rezervasyon Düzenle"
          description="Rezervasyon bilgilerini güncelleyin"
          size="lg"
        >
          <Form
            schema={bookingUpdateSchema}
            defaultValues={{
              id: selectedBooking.id,
              packageId: selectedBooking.packageId,
              customerName: selectedBooking.customerName,
              customerEmail: selectedBooking.customerEmail,
              customerPhone: selectedBooking.customerPhone,
              startTime: new Date(selectedBooking.startTime)
                .toISOString()
                .slice(0, 16),
              endTime: new Date(selectedBooking.endTime)
                .toISOString()
                .slice(0, 16),
              locationId: selectedBooking.locationId || "",
              staffId: selectedBooking.staffId || "",
              specialNotes: selectedBooking.specialNotes || "",
              status: selectedBooking.status,
              paymentStatus: selectedBooking.paymentStatus,
            }}
            onSubmit={handleUpdate}
          >
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <TextField
                  name="customerName"
                  label="Müşteri Adı"
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />

                <TextField
                  name="customerEmail"
                  label="Email Adresi"
                  placeholder="ahmet@example.com"
                  type="email"
                  required
                />

                <TextField
                  name="customerPhone"
                  label="Telefon"
                  placeholder="0532 123 45 67"
                  required
                />

                <SelectField
                  name="packageId"
                  label="Paket"
                  placeholder="Paket seçin"
                  options={[
                    { value: "", label: "Paket seçin" },
                    ...packageOptions,
                  ]}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    name="status"
                    label="Rezervasyon Durumu"
                    options={[
                      { value: "PENDING", label: "Bekliyor" },
                      { value: "CONFIRMED", label: "Onaylandı" },
                      { value: "IN_PROGRESS", label: "Devam Ediyor" },
                      { value: "COMPLETED", label: "Tamamlandı" },
                      { value: "CANCELLED", label: "İptal Edildi" },
                      { value: "RESCHEDULED", label: "Ertelendi" },
                    ]}
                  />

                  <SelectField
                    name="paymentStatus"
                    label="Ödeme Durumu"
                    options={[
                      { value: "PENDING", label: "Bekliyor" },
                      { value: "PAID", label: "Ödendi" },
                      { value: "FAILED", label: "Başarısız" },
                      { value: "REFUNDED", label: "İade Edildi" },
                      { value: "PARTIAL", label: "Kısmi" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <TextField
                  name="startTime"
                  label="Başlangıç Tarihi ve Saati"
                  type="datetime-local"
                  required
                />

                <TextField
                  name="endTime"
                  label="Bitiş Tarihi ve Saati"
                  type="datetime-local"
                  required
                />

                <SelectField
                  name="locationId"
                  label="Lokasyon"
                  placeholder="Lokasyon seçin"
                  options={[
                    { value: "", label: "Lokasyon seçin" },
                    ...locationOptions,
                  ]}
                />

                <SelectField
                  name="staffId"
                  label="Personel"
                  placeholder="Personel seçin"
                  options={[
                    { value: "", label: "Personel seçin" },
                    ...staffOptions,
                  ]}
                />

                <TextareaField
                  name="specialNotes"
                  label="Özel Notlar"
                  placeholder="Özel istekler, notlar..."
                  rows={3}
                />
              </div>

              {/* Submit Button Section */}
              <div className="flex flex-col sm:flex-row justify-end pt-6 border-t space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {updateMutation.isPending ? (
                    <div className="flex items-center justify-center">
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
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span className="text-sm sm:text-base">
                        Güncelleniyor...
                      </span>
                    </div>
                  ) : (
                    "Güncelle"
                  )}
                </button>
              </div>
            </div>
          </Form>
        </Dialog>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <Dialog
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Rezervasyon Detayları"
          description={`Rezervasyon Kodu: ${selectedBooking.bookingCode}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Müşteri Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium break-words">
                      {selectedBooking.customerName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm break-all">
                      {selectedBooking.customerEmail}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm">
                      {selectedBooking.customerPhone}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-6">
                  Rezervasyon Bilgileri
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm break-words">
                      {selectedBooking.package?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm">
                      {selectedBooking.location?.name || "Belirtilmemiş"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">
                      {selectedBooking.staff?.name || "Atanmamış"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Tarih ve Saat
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(selectedBooking.startTime).toLocaleDateString(
                        "tr-TR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(selectedBooking.startTime).toLocaleTimeString(
                        "tr-TR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(selectedBooking.endTime).toLocaleTimeString(
                        "tr-TR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-6">
                  Durum Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Rezervasyon Durumu:
                    </span>
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ödeme Durumu:</span>
                    <PaymentStatusBadge
                      status={selectedBooking.paymentStatus}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Toplam Tutar:</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      ₺
                      {Number(selectedBooking.totalAmount).toLocaleString(
                        "tr-TR"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedBooking.specialNotes && (
              <div className="mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Özel Notlar
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md break-words">
                  {selectedBooking.specialNotes}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
              >
                Düzenle
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Rezervasyonu Sil"
        description={`"${selectedBooking?.bookingCode}" kodlu rezervasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CalendarContainer;
