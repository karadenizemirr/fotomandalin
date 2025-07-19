"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  SelectField,
  TextareaField,
  CheckboxField,
  NumberField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import Upload, { UploadedFile } from "@/components/organisms/upload/Upload";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Package,
  Star,
  Camera,
  Filter,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Image from "next/image";

// Slug generation utility
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Validation schemas
const packageCreateSchema = z.object({
  name: z.string().min(1, "Paket adı gereklidir"),
  slug: z.string().optional(), // Make slug optional for auto-generation
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Fiyat 0'dan büyük olmalıdır"), // Use coerce
  discountPrice: z.coerce.number().min(0).optional(), // Use coerce
  currency: z.string().default("TRY"),
  durationInMinutes: z.coerce
    .number()
    .int()
    .min(1, "Süre en az 1 dakika olmalıdır"), // Use coerce
  photoCount: z.coerce.number().int().min(0).optional(), // Use coerce
  videoIncluded: z.boolean().default(false),
  albumIncluded: z.boolean().default(false),
  coverImage: z.string().optional(), // Remove .url() to allow empty strings
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0), // Use coerce
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  categoryId: z.string(),
});

const packageUpdateSchema = packageCreateSchema.partial().extend({
  id: z.string(),
});

type PackageFormData = z.infer<typeof packageCreateSchema>;
type PackageUpdateData = z.infer<typeof packageUpdateSchema>;

interface PackageTableData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDesc?: string | null;
  basePrice: string | number;
  discountPrice?: string | number | null;
  currency: string;
  durationInMinutes: number;
  photoCount?: number | null;
  videoIncluded: boolean;
  albumIncluded: boolean;
  coverImage?: string | null;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    bookings: number;
  };
}

export default function PackageContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageTableData | null>(
    null
  );
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    packageId: string;
    packageName: string;
  }>({ isOpen: false, packageId: "", packageName: "" });
  const [filters, setFilters] = useState({
    categoryId: "",
    includeInactive: false,
    featured: undefined as boolean | undefined,
    sortBy: "popularity" as "price" | "popularity" | "name" | "created",
    sortOrder: "asc" as "asc" | "desc",
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);

  // Toast hook
  const { addToast } = useToast();

  // tRPC queries
  const {
    data: packagesData,
    isLoading,
    refetch,
  } = trpc.package.list.useQuery(filters);

  const { data: packageStats } = trpc.package.stats.useQuery();
  const { data: categories } = trpc.serviceCategory.list.useQuery({
    includeInactive: false,
  });

  // tRPC mutations
  const createPackageMutation = trpc.package.create.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Paket başarıyla oluşturuldu",
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

  const updatePackageMutation = trpc.package.update.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Paket başarıyla güncellendi",
        type: "success",
      });
      setIsModalOpen(false);
      setEditingPackage(null);
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

  const deletePackageMutation = trpc.package.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Paket başarıyla silindi",
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

  const duplicatePackageMutation = trpc.package.duplicate.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Paket başarıyla kopyalandı",
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
  const handleCreatePackage = async (data: PackageFormData) => {
    // Ensure slug is always present
    const packageData = {
      ...data,
      slug: data.slug || generateSlug(data.name || ""),
    };
    await createPackageMutation.mutateAsync(packageData);
    setUploadedImage(null);
  };

  const handleUpdatePackage = async (data: PackageUpdateData) => {
    if (!editingPackage) return;
    // Ensure slug is always present
    const packageData = {
      ...data,
      slug: data.slug || generateSlug(data.name || ""),
    };
    await updatePackageMutation.mutateAsync({
      ...packageData,
      id: editingPackage.id,
    });
    setUploadedImage(null);
  };

  const handleDeletePackage = async (packageId: string) => {
    await deletePackageMutation.mutateAsync({ id: packageId });
    setDeleteConfirm({ isOpen: false, packageId: "", packageName: "" });
  };

  const openDeleteConfirm = (packageId: string, packageName: string) => {
    setDeleteConfirm({ isOpen: true, packageId, packageName });
  };

  const handleDuplicatePackage = async (packageId: string) => {
    await duplicatePackageMutation.mutateAsync({ id: packageId });
  };

  // Form submit handler
  const handleFormSubmit = async (data: any) => {
    // Auto-generate slug if not provided or empty
    const finalSlug =
      data.slug && data.slug.trim()
        ? data.slug.trim()
        : generateSlug(data.name || "");

    // Handle image: use uploaded image URL or existing image
    const imageUrl = uploadedImage?.url || data.coverImage || undefined;

    // Clean up form data and convert types
    const formData = {
      ...data,
      slug: finalSlug,
      coverImage: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined,
      basePrice: Number(data.basePrice) || 0,
      discountPrice: data.discountPrice
        ? Number(data.discountPrice)
        : undefined,
      durationInMinutes: Number(data.durationInMinutes) || 0,
      photoCount: data.photoCount ? Number(data.photoCount) : undefined,
      sortOrder: Number(data.sortOrder) || 0,
      description:
        data.description && data.description.trim()
          ? data.description.trim()
          : undefined,
      shortDesc:
        data.shortDesc && data.shortDesc.trim()
          ? data.shortDesc.trim()
          : undefined,
      metaTitle:
        data.metaTitle && data.metaTitle.trim()
          ? data.metaTitle.trim()
          : undefined,
      metaDescription:
        data.metaDescription && data.metaDescription.trim()
          ? data.metaDescription.trim()
          : undefined,
    };

    if (editingPackage) {
      await handleUpdatePackage(formData);
    } else {
      await handleCreatePackage(formData);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setUploadedImage(null);
  };

  // Form default values
  const getDefaultValues = () => {
    if (editingPackage) {
      return {
        name: editingPackage.name,
        slug: editingPackage.slug,
        description: editingPackage.description || "",
        shortDesc: editingPackage.shortDesc || "",
        basePrice:
          typeof editingPackage.basePrice === "string"
            ? parseFloat(editingPackage.basePrice)
            : editingPackage.basePrice,
        discountPrice: editingPackage.discountPrice
          ? typeof editingPackage.discountPrice === "string"
            ? parseFloat(editingPackage.discountPrice)
            : editingPackage.discountPrice
          : undefined,
        currency: editingPackage.currency,
        durationInMinutes: editingPackage.durationInMinutes,
        photoCount: editingPackage.photoCount || undefined,
        videoIncluded: editingPackage.videoIncluded,
        albumIncluded: editingPackage.albumIncluded,
        coverImage: editingPackage.coverImage || "",
        isActive: editingPackage.isActive,
        isPopular: editingPackage.isPopular,
        sortOrder: editingPackage.sortOrder,
        metaTitle: "",
        metaDescription: "",
        categoryId: editingPackage.category.id,
      };
    }
    return {
      name: "",
      slug: "",
      description: "",
      shortDesc: "",
      basePrice: 0,
      discountPrice: undefined,
      currency: "TRY",
      durationInMinutes: 60,
      photoCount: undefined,
      videoIncluded: false,
      albumIncluded: false,
      coverImage: "",
      isActive: true,
      isPopular: false,
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
      categoryId: "",
    };
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "coverImage",
        title: "",
        width: 80,
        render: (value: any, record: PackageTableData) => (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
            {record.coverImage ? (
              <Image
                src={record.coverImage}
                alt={record.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
        ),
      },
      {
        key: "name",
        title: "Paket Bilgileri",
        dataIndex: "name",
        sortable: true,
        render: (value: string, record: PackageTableData) => (
          <div>
            <div className="font-medium text-black">{value}</div>
            <div className="text-sm text-gray-600">{record.category.name}</div>
            <div className="text-xs text-gray-500">{record.slug}</div>
          </div>
        ),
      },
      {
        key: "price",
        title: "Fiyat",
        render: (value: any, record: PackageTableData) => {
          const basePrice =
            typeof record.basePrice === "string"
              ? parseFloat(record.basePrice)
              : record.basePrice;
          const discountPrice = record.discountPrice
            ? typeof record.discountPrice === "string"
              ? parseFloat(record.discountPrice)
              : record.discountPrice
            : null;

          return (
            <div>
              <div className="font-medium text-black">
                {discountPrice ? (
                  <>
                    <span className="text-orange-400">
                      {discountPrice} {record.currency}
                    </span>
                    <span className="line-through text-gray-400 ml-2">
                      {basePrice} {record.currency}
                    </span>
                  </>
                ) : (
                  `${basePrice} ${record.currency}`
                )}
              </div>
              <div className="text-sm text-gray-600">
                {Math.floor(record.durationInMinutes / 60)}s{" "}
                {record.durationInMinutes % 60}dk
              </div>
            </div>
          );
        },
      },
      {
        key: "features",
        title: "Özellikler",
        render: (value: any, record: PackageTableData) => (
          <div className="flex flex-wrap gap-1">
            {record.photoCount && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                <Camera className="w-3 h-3 mr-1" />
                {record.photoCount} Fotoğraf
              </span>
            )}
            {record.videoIncluded && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-200">
                Video
              </span>
            )}
            {record.albumIncluded && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-600 border border-green-200">
                Albüm
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Durum",
        render: (value: any, record: PackageTableData) => (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {record.isActive ? (
                <ToggleRight className="w-4 h-4 text-green-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={`text-sm ${
                  record.isActive ? "text-green-600" : "text-gray-500"
                }`}
              >
                {record.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            {record.isPopular && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-orange-400 fill-current" />
                <span className="text-xs text-orange-400">Popüler</span>
              </div>
            )}
          </div>
        ),
      },
      {
        key: "stats",
        title: "İstatistikler",
        render: (value: any, record: PackageTableData) => (
          <div className="text-sm text-black">
            <div>{record._count.bookings} Rezervasyon</div>
            <div className="text-xs text-gray-500">
              Sıra: {record.sortOrder}
            </div>
          </div>
        ),
      },
      {
        key: "createdAt",
        title: "Oluşturulma",
        dataIndex: "createdAt",
        sortable: true,
        render: (value: Date | string) => (
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
      onClick: (_record: PackageTableData) => {
        // TODO: Implement view package details
      },
      variant: "secondary" as const,
    },
    {
      key: "duplicate",
      label: "Kopyala",
      icon: <Copy className="w-4 h-4" />,
      onClick: (record: PackageTableData) => {
        handleDuplicatePackage(record.id);
      },
      variant: "secondary" as const,
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: PackageTableData) => {
        setEditingPackage(record);
        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: PackageTableData) => {
        openDeleteConfirm(record.id, record.name);
      },
      variant: "danger" as const,
      disabled: (record: PackageTableData) => record._count.bookings > 0,
    },
  ];

  // Category options for form
  const categoryOptions =
    categories?.items.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Paket Yönetimi
            </h1>
            <p className="text-black mt-1">
              Hizmet paketlerinizi görüntüleyin ve yönetin
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
              onClick={() => {
                setIsModalOpen(true);
                setEditingPackage(null);
                setUploadedImage(null);
              }}
              className="inline-flex items-center px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Paket
            </button>
          </div>
        </div>

        {/* Stats */}
        {packageStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Toplam Paket
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {packageStats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ToggleRight className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Aktif
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {packageStats.active}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Pasif
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {packageStats.inactive}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-orange-400 fill-current" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Popüler
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {packageStats.popular}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">₺</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Ort. Fiyat
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {packageStats.averagePrice.toFixed(0)} ₺
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Kategori
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters({ ...filters, categoryId: e.target.value })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value="">Tüm Kategoriler</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Durum
              </label>
              <select
                value={
                  filters.featured === undefined
                    ? ""
                    : filters.featured.toString()
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    featured:
                      e.target.value === ""
                        ? undefined
                        : e.target.value === "true",
                  })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value="">Tüm Paketler</option>
                <option value="true">Popüler</option>
                <option value="false">Normal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Sıralama
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as any,
                  })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value="popularity">Popülerlik</option>
                <option value="name">İsim</option>
                <option value="price">Fiyat</option>
                <option value="created">Oluşturulma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Sıra
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortOrder: e.target.value as any,
                  })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors duration-200"
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.includeInactive}
                onChange={(e) =>
                  setFilters({ ...filters, includeInactive: e.target.checked })
                }
                className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-200 rounded"
              />
              <span className="ml-2 text-sm text-black">
                Pasif paketleri göster
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={packagesData?.items || []}
          columns={columns}
          loading={isLoading}
          actions={actions}
          selection={{
            type: "checkbox",
            selectedRowKeys: selectedPackages,
            onChange: (keys) => setSelectedPackages(keys as string[]),
          }}
          rowKey="id"
          className="border-0"
          searchable={false}
        />
      </div>

      {/* Form Dialog for Create/Edit Package */}
      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPackage ? "Paket Düzenle" : "Yeni Paket"}
        size="lg"
      >
        <Form
          schema={editingPackage ? packageUpdateSchema : packageCreateSchema}
          defaultValues={getDefaultValues()}
          onSubmit={handleFormSubmit}
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                name="name"
                label="Paket Adı"
                placeholder="Düğün Fotoğraf Paketi"
                required
              />
              <TextField
                name="slug"
                label="Slug (Otomatik oluşturulur)"
                placeholder="dugun-fotograf-paketi"
                helperText="Boş bırakırsanız paket adından otomatik oluşturulur"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextareaField
                name="shortDesc"
                label="Kısa Açıklama"
                placeholder="Paket hakkında kısa bilgi..."
                rows={3}
              />
              <TextareaField
                name="description"
                label="Detaylı Açıklama"
                placeholder="Paket hakkında detaylı bilgi..."
                rows={3}
              />
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">
                Fiyatlandırma
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberField
                  name="basePrice"
                  label="Ana Fiyat"
                  placeholder="0"
                  min={0}
                  step={0.01}
                  required
                />
                <NumberField
                  name="discountPrice"
                  label="İndirimli Fiyat"
                  placeholder="0"
                  min={0}
                  step={0.01}
                />
                <SelectField
                  name="currency"
                  label="Para Birimi"
                  options={[
                    { label: "TRY", value: "TRY" },
                    { label: "USD", value: "USD" },
                    { label: "EUR", value: "EUR" },
                  ]}
                  required
                />
              </div>
            </div>

            {/* Package Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">
                Paket Detayları
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  name="durationInMinutes"
                  label="Süre (Dakika)"
                  placeholder="60"
                  min={1}
                  step={1}
                  required
                />
                <NumberField
                  name="photoCount"
                  label="Fotoğraf Sayısı"
                  placeholder="50"
                  min={0}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <CheckboxField name="videoIncluded" label="Video Dahil" />
                <CheckboxField name="albumIncluded" label="Albüm Dahil" />
                <NumberField
                  name="sortOrder"
                  label="Sıralama"
                  placeholder="0"
                  min={0}
                  step={1}
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">
                Kategori ve Durum
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="categoryId"
                  label="Kategori"
                  options={categoryOptions}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-black mb-4">
                  Kapak Resmi
                </h3>
                <div className="space-y-4">
                  <Upload
                    preset="image"
                    maxFiles={1}
                    initialFiles={
                      editingPackage?.coverImage
                        ? [
                            {
                              id: "existing-image",
                              name: "Kapak Resmi",
                              size: 0,
                              type: "image/jpeg",
                              url: editingPackage.coverImage,
                              uploadedAt: new Date(),
                              status: "success" as const,
                            },
                          ]
                        : []
                    }
                    onUpload={(files) => {
                      if (files.length > 0) {
                        setUploadedImage(files[0]);
                      }
                    }}
                    onRemove={() => {
                      setUploadedImage(null);
                    }}
                    className="mb-4"
                  />

                  {/* Image Preview */}
                  {(uploadedImage?.url || editingPackage?.coverImage) && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Önizleme
                      </label>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <Image
                          src={
                            uploadedImage?.url ||
                            editingPackage?.coverImage ||
                            ""
                          }
                          alt="Paket kapak resmi önizlemesi"
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CheckboxField name="isActive" label="Aktif" />
                <CheckboxField name="isPopular" label="Popüler" />
              </div>
            </div>

            {/* SEO */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">SEO</h3>
              <div className="space-y-4">
                <TextField
                  name="metaTitle"
                  label="Meta Başlık"
                  placeholder="SEO için sayfa başlığı"
                />
                <TextareaField
                  name="metaDescription"
                  label="Meta Açıklama"
                  placeholder="SEO için sayfa açıklaması"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={
                createPackageMutation.isPending ||
                updatePackageMutation.isPending
              }
              className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={
                createPackageMutation.isPending ||
                updatePackageMutation.isPending
              }
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              {createPackageMutation.isPending ||
              updatePackageMutation.isPending
                ? "Kaydediliyor..."
                : editingPackage
                ? "Güncelle"
                : "Oluştur"}
            </button>
          </div>
        </Form>
      </Dialog>

      {/* Confirm Dialog for Delete Package */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, packageId: "", packageName: "" })
        }
        onConfirm={() => handleDeletePackage(deleteConfirm.packageId)}
        title="Paket Sil"
        description={`"${deleteConfirm.packageName}" paketini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deletePackageMutation.isPending}
      />
    </div>
  );
}
