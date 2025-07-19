"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import { TextField, SelectField } from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import {
  Users,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  User,
  Crown,
  Camera,
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Activity,
  TrendingUp,
} from "lucide-react";

// Validation schemas
const customerUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli email adresi gereklidir"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  role: z.enum(["CUSTOMER", "ADMIN", "PHOTOGRAPHER"]),
  image: z.string().optional(),
});

type CustomerUpdateData = z.infer<typeof customerUpdateSchema>;

const CustomerContainer = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const {
    data: customersData,
    isLoading,
    refetch,
  } = trpc.user.getAllUsers.useQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    role: roleFilter !== "all" ? (roleFilter as any) : undefined,
  });

  // User stats
  const { data: userStats } = trpc.user.getUserStats.useQuery();

  // Mutations
  const updateMutation = trpc.user.updateUser.useMutation();
  const deleteMutation = trpc.user.deleteUser.useMutation();

  // Filtered data
  const filteredData = useMemo(() => {
    if (!customersData?.users) return [];
    return customersData.users;
  }, [customersData?.users]);

  // Handle form submission for update
  const handleUpdate = async (data: CustomerUpdateData) => {
    try {
      await updateMutation.mutateAsync(data);

      addToast({
        message: "Müşteri bilgileri başarıyla güncellendi",
        type: "success",
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Müşteri güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedCustomer) {
        await deleteMutation.mutateAsync({ id: selectedCustomer.id });
        addToast({
          message: "Müşteri başarıyla silindi",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        refetch();
      }
    } catch (error: any) {
      addToast({
        message: error.message || "Müşteri silinirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Role badge component
  const RoleBadge = ({ role }: { role: string }) => {
    const roleConfig = {
      CUSTOMER: {
        color: "bg-blue-100 text-blue-800",
        icon: User,
        text: "Müşteri",
      },
      ADMIN: { color: "bg-red-100 text-red-800", icon: Shield, text: "Admin" },
      PHOTOGRAPHER: {
        color: "bg-purple-100 text-purple-800",
        icon: Camera,
        text: "Fotoğrafçı",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.CUSTOMER;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // Activity indicator component
  const ActivityIndicator = ({
    bookings,
    reviews,
  }: {
    bookings: number;
    reviews: number;
  }) => {
    const totalActivity = bookings + reviews;
    let color = "text-gray-400";
    let label = "Yeni";

    if (totalActivity > 10) {
      color = "text-green-500";
      label = "Aktif";
    } else if (totalActivity > 5) {
      color = "text-yellow-500";
      label = "Orta";
    } else if (totalActivity > 0) {
      color = "text-blue-500";
      label = "Az Aktif";
    }

    return (
      <div className="flex items-center space-x-1">
        <Activity className={`w-4 h-4 ${color}`} />
        <span className={`text-sm ${color}`}>{label}</span>
      </div>
    );
  };

  // DataTable columns
  const columns = [
    {
      key: "user",
      title: "Müşteri",
      width: "250px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden">
            {record.image ? (
              <Image
                src={record.image}
                alt={record.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              record.name?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              <span>{record.email}</span>
            </div>
            {record.phone && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Phone className="w-3 h-3" />
                <span>{record.phone}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Rol",
      width: "120px",
      render: (value: any, record: any) => <RoleBadge role={record.role} />,
    },
    {
      key: "activity",
      title: "Aktivite",
      width: "150px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <ActivityIndicator
            bookings={record._count?.bookings || 0}
            reviews={record._count?.reviews || 0}
          />
          <div className="text-xs text-gray-500">
            {record._count?.bookings || 0} rezervasyon,{" "}
            {record._count?.reviews || 0} yorum
          </div>
        </div>
      ),
    },
    {
      key: "stats",
      title: "İstatistikler",
      width: "180px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700">
              {record._count?.bookings || 0} rezervasyon
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700">
              {record._count?.reviews || 0} yorum
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "joinDate",
      title: "Kayıt Tarihi",
      width: "120px",
      render: (value: any, record: any) => (
        <div className="text-sm text-gray-700">
          {new Date(record.createdAt).toLocaleDateString("tr-TR")}
        </div>
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
        setSelectedCustomer(record);
        setIsDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedCustomer(record);
        setIsEditModalOpen(true);
      },
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedCustomer(record);
        setIsDeleteModalOpen(true);
      },
      className: "text-red-600 hover:text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
          <p className="text-gray-600">
            Müşterileri görüntüleyin, düzenleyin ve yönetin
          </p>
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
        </div>
      </div>

      {/* Stats Cards */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Müşteri
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bu Ay Yeni</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.recentUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Aktif Müşteri
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Admin Sayısı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalAdmins}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filtreler:
            </span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">Tüm Roller</option>
            <option value="CUSTOMER">Müşteri</option>
            <option value="PHOTOGRAPHER">Fotoğrafçı</option>
            <option value="ADMIN">Admin</option>
          </select>

          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Müşteri ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: customersData?.pagination?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
          }}
          emptyText="Henüz müşteri bulunmuyor"
        />
      </div>

      {/* Edit Modal */}
      {selectedCustomer && (
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Müşteri Düzenle"
          description="Müşteri bilgilerini güncelleyin"
          size="md"
        >
          <Form
            schema={customerUpdateSchema}
            defaultValues={{
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              email: selectedCustomer.email,
              phone: selectedCustomer.phone || "",
              role: selectedCustomer.role,
              image: selectedCustomer.image || "",
            }}
            onSubmit={handleUpdate}
          >
            <div className="space-y-4">
              <TextField
                name="name"
                label="Ad Soyad"
                placeholder="Örn: Ahmet Yılmaz"
                required
              />

              <TextField
                name="email"
                label="Email Adresi"
                placeholder="ahmet@example.com"
                type="email"
                required
              />

              <TextField
                name="phone"
                label="Telefon"
                placeholder="0532 123 45 67"
              />

              <SelectField
                name="role"
                label="Rol"
                options={[
                  { value: "CUSTOMER", label: "Müşteri" },
                  { value: "PHOTOGRAPHER", label: "Fotoğrafçı" },
                  { value: "ADMIN", label: "Admin" },
                ]}
                required
              />

              <TextField
                name="image"
                label="Profil Fotoğrafı URL"
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
            </div>
          </Form>
        </Dialog>
      )}

      {/* Detail Modal */}
      {selectedCustomer && (
        <Dialog
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Müşteri Detayları"
          description={selectedCustomer.name}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {selectedCustomer.image ? (
                  <Image
                    src={selectedCustomer.image}
                    alt={selectedCustomer.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCustomer.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <RoleBadge role={selectedCustomer.role} />
                  <ActivityIndicator
                    bookings={selectedCustomer._count?.bookings || 0}
                    reviews={selectedCustomer._count?.reviews || 0}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  İletişim Bilgileri
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {selectedCustomer.email}
                    </span>
                  </div>

                  {selectedCustomer.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Kayıt:{" "}
                      {new Date(selectedCustomer.createdAt).toLocaleDateString(
                        "tr-TR"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Aktivite Özeti
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-900">
                        Rezervasyonlar
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedCustomer._count?.bookings || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-900">
                        Yorumlar
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {selectedCustomer._count?.reviews || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
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
        title="Müşteriyi Sil"
        description={`"${selectedCustomer?.name}" adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm rezervasyonları da silinecektir.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CustomerContainer;
