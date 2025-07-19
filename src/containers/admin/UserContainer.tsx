"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import { TextField, SelectField } from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  UserCheck,
  UserX,
  Search,
  Filter,
} from "lucide-react";
import Image from "next/image";

// Validation schemas
const userCreateSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  role: z.enum(["CUSTOMER", "ADMIN", "PHOTOGRAPHER"]),
});

const userUpdateSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi giriniz"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  role: z.enum(["CUSTOMER", "ADMIN", "PHOTOGRAPHER"]),
});

type UserFormData = z.infer<typeof userCreateSchema>;
type UserUpdateData = z.infer<typeof userUpdateSchema>;

interface UserTableData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN" | "PHOTOGRAPHER";
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count: {
    bookings: number;
    reviews: number;
  };
}

export default function UserContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserTableData | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: undefined as "CUSTOMER" | "ADMIN" | "PHOTOGRAPHER" | undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Toast hook
  const { addToast } = useToast();

  // tRPC queries
  const {
    data: usersData,
    isLoading,
    refetch,
  } = trpc.user.getAllUsers.useQuery(filters);

  const { data: userStats } = trpc.user.getUserStats.useQuery();

  // tRPC mutations
  const createUserMutation = trpc.user.register.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kullanıcı başarıyla oluşturuldu",
        type: "success",
      });
      setIsModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  const updateUserMutation = trpc.user.updateUser.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kullanıcı başarıyla güncellendi",
        type: "success",
      });
      setIsModalOpen(false);
      setEditingUser(null);
      refetch();
    },
    onError: (error: any) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  const deleteUserMutation = trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kullanıcı başarıyla silindi",
        type: "success",
      });
      refetch();
    },
    onError: (error: any) => {
      addToast({
        title: "Hata",
        message: error.message,
        type: "error",
      });
    },
  });

  // Form handlers
  const handleCreateUser = async (data: UserFormData) => {
    await createUserMutation.mutateAsync(data);
  };

  const handleUpdateUser = async (data: UserUpdateData) => {
    if (!editingUser) return;
    await updateUserMutation.mutateAsync({
      id: editingUser.id,
      ...data,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUserMutation.mutateAsync({ id: userId });
    setDeleteConfirm({ isOpen: false, userId: "", userName: "" });
  };

  const openDeleteConfirm = (userId: string, userName: string) => {
    setDeleteConfirm({ isOpen: true, userId, userName });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "avatar",
        title: "",
        width: 60,
        render: (value: any, record: UserTableData) => (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            {record.image ? (
              <Image
                src={record.image}
                alt={record.name || "User"}
                width={40}
                height={40}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-black">
                {(record.name || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "name",
        title: "İsim",
        dataIndex: "name",
        sortable: true,
        render: (value: string, record: UserTableData) => (
          <div>
            <div className="font-medium text-black">{value}</div>
            <div className="text-sm text-black">{record.email}</div>
          </div>
        ),
      },
      {
        key: "phone",
        title: "Telefon",
        dataIndex: "phone",
        render: (value: string) => <span className="text-black">{value}</span>,
      },
      {
        key: "role",
        title: "Rol",
        dataIndex: "role",
        render: (value: "CUSTOMER" | "ADMIN" | "PHOTOGRAPHER") => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              value === "ADMIN"
                ? "bg-orange-50 text-orange-400 border-orange-200"
                : value === "PHOTOGRAPHER"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-gray-50 text-black border-gray-200"
            }`}
          >
            {value === "ADMIN"
              ? "Yönetici"
              : value === "PHOTOGRAPHER"
              ? "Fotoğrafçı"
              : "Müşteri"}
          </span>
        ),
      },
      {
        key: "stats",
        title: "İstatistikler",
        render: (value: any, record: UserTableData) => (
          <div className="text-sm text-black">
            <div>{record._count.bookings} Rezervasyon</div>
            <div>{record._count.reviews} Yorum</div>
          </div>
        ),
      },
      {
        key: "createdAt",
        title: "Kayıt Tarihi",
        dataIndex: "createdAt",
        sortable: true,
        render: (value: Date) => (
          <span className="text-black">
            {new Date(value).toLocaleDateString("tr-TR")}
          </span>
        ),
      },
    ],
    []
  );

  // Table actions
  const actions = [
    {
      key: "view",
      label: "Görüntüle",
      icon: <Eye className="w-4 h-4" />,
      onClick: (_record: UserTableData) => {
        // TODO: Implement view user details
      },
      variant: "secondary" as const,
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: UserTableData) => {
        setEditingUser(record);
        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: UserTableData) => {
        openDeleteConfirm(record.id, record.name || record.email);
      },
      variant: "danger" as const,
      disabled: (record: UserTableData) => record.role === "ADMIN",
    },
  ];

  // Form submit handler
  const handleFormSubmit = async (data: any) => {
    if (editingUser) {
      await handleUpdateUser(data);
    } else {
      await handleCreateUser(data);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // Form default values
  const getDefaultValues = () => {
    if (editingUser) {
      return {
        name: editingUser.name || "",
        email: editingUser.email,
        phone: editingUser.phone || "",
        role: editingUser.role,
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "CUSTOMER" as const,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-black mt-1">
              Sistem kullanıcılarını görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
            </button>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kullanıcı
            </button>
          </div>
        </div>

        {/* Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Toplam Kullanıcı
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {userStats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserX className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Yöneticiler
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {userStats.totalAdmins}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Son 30 Gün
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {userStats.recentUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Aktif Kullanıcılar
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {userStats.activeUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
                <input
                  type="text"
                  placeholder="İsim, email veya telefon ile ara..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                  className="pl-10 w-full border border-gray-200 rounded-md px-3 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Rol
              </label>
              <select
                value={filters.role || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    role: e.target.value as any,
                    page: 1,
                  })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value="">Tüm Roller</option>
                <option value="CUSTOMER">Müşteri</option>
                <option value="ADMIN">Yönetici</option>
                <option value="PHOTOGRAPHER">Fotoğrafçı</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Sayfa Başına
              </label>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    limit: Number(e.target.value),
                    page: 1,
                  })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={usersData?.users || []}
          columns={columns}
          loading={isLoading}
          actions={actions}
          pagination={
            usersData?.pagination
              ? {
                  current: usersData.pagination.page,
                  pageSize: usersData.pagination.limit,
                  total: usersData.pagination.total,
                  onChange: (page, pageSize) =>
                    setFilters({ ...filters, page, limit: pageSize }),
                }
              : undefined
          }
          selection={{
            type: "checkbox",
            selectedRowKeys: selectedUsers,
            onChange: (keys) => setSelectedUsers(keys as string[]),
          }}
          rowKey="id"
          className="border-0"
          searchable={false} // We're handling search in filters
        />
      </div>

      {/* Form Dialog for Create/Edit User */}
      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı"}
        size="md"
      >
        <Form
          schema={editingUser ? userUpdateSchema : userCreateSchema}
          defaultValues={getDefaultValues()}
          onSubmit={handleFormSubmit}
        >
          <div className="space-y-4">
            <TextField
              name="name"
              label="İsim"
              placeholder="Kullanıcı adını giriniz"
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="Email adresini giriniz"
              required
            />
            <TextField
              name="phone"
              label="Telefon"
              placeholder="Telefon numarasını giriniz"
              required
            />
            {!editingUser && (
              <TextField
                name="password"
                label="Şifre"
                type="password"
                placeholder="Şifre oluşturunuz"
                required
              />
            )}
            <SelectField
              name="role"
              label="Rol"
              required
              options={[
                { label: "Müşteri", value: "CUSTOMER" },
                { label: "Yönetici", value: "ADMIN" },
                { label: "Fotoğrafçı", value: "PHOTOGRAPHER" },
              ]}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={
                createUserMutation.isPending || updateUserMutation.isPending
              }
              className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={
                createUserMutation.isPending || updateUserMutation.isPending
              }
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              {createUserMutation.isPending || updateUserMutation.isPending
                ? "Kaydediliyor..."
                : editingUser
                ? "Güncelle"
                : "Oluştur"}
            </button>
          </div>
        </Form>
      </Dialog>

      {/* Confirm Dialog for Delete User */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, userId: "", userName: "" })
        }
        onConfirm={() => handleDeleteUser(deleteConfirm.userId)}
        title="Kullanıcı Sil"
        description={`"${deleteConfirm.userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
}
