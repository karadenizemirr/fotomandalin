"use client";

import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
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
  FolderPlus,
  Package,
  Clock,
  ToggleLeft,
  ToggleRight,
  Hash,
} from "lucide-react";
import Image from "next/image";

// Validation schemas
const categoryCreateSchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(), // Remove .url() to allow empty strings
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0), // Use coerce to convert string to number
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string(),
});

type CategoryFormData = z.infer<typeof categoryCreateSchema>;
type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;

// Slug generation utility
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

interface CategoryTableData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  packages: Array<{
    id: string;
    name: string;
    basePrice: string | number;
    discountPrice?: string | number | null;
  }>;
  _count: {
    packages: number;
  };
}

export default function ServiceCategoryContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryTableData | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({ isOpen: false, categoryId: "", categoryName: "" });
  const [filters, setFilters] = useState({
    includeInactive: false,
    limit: 50,
  });
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  useEffect(() => {
    if (editingCategory?.image && !isImageRemoved) {
      setUploadedImage({
        id: "existing-image",
        name: "Kategori Resmi",
        size: 0,
        type: "image/jpeg",
        url: editingCategory.image,
        uploadedAt: new Date(),
        status: "success" as const,
      });
    } else {
      setUploadedImage(null);
    }
  }, [editingCategory, isImageRemoved]); // Toast hook
  const { addToast } = useToast();

  // tRPC queries
  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = trpc.serviceCategory.list.useQuery(filters);

  const { data: categoryStats } = trpc.serviceCategory.stats.useQuery();

  // tRPC mutations
  const createCategoryMutation = trpc.serviceCategory.create.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kategori başarıyla oluşturuldu",
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

  const updateCategoryMutation = trpc.serviceCategory.update.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kategori başarıyla güncellendi",
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

  const deleteCategoryMutation = trpc.serviceCategory.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Kategori başarıyla silindi",
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
  const handleDeleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation.mutateAsync({ id: categoryId });
    setDeleteConfirm({ isOpen: false, categoryId: "", categoryName: "" });
  };

  const openDeleteConfirm = (categoryId: string, categoryName: string) => {
    setDeleteConfirm({ isOpen: true, categoryId, categoryName });
  };

  // Form submit handler
  const handleFormSubmit = async (data: any) => {
    console.log("DEBUG: Category form submit triggered with data:", data);
    console.log("DEBUG: Editing category:", editingCategory);
    console.log("DEBUG: Uploaded image:", uploadedImage);
    console.log("DEBUG: Is image removed:", isImageRemoved);

    try {
      // Add id for update operations
      if (editingCategory) {
        data.id = editingCategory.id;
      }

      // Auto-generate slug if not provided or empty
      const finalSlug =
        data.slug && data.slug.trim()
          ? data.slug.trim()
          : generateSlug(data.name || "");

      // Handle image: if removed, set to undefined, otherwise use uploaded or existing image
      const imageUrl = isImageRemoved
        ? undefined
        : uploadedImage?.url || data.image || undefined;

      // Clean up empty strings by converting them to undefined
      const cleanFormData = {
        ...data,
        image: imageUrl && imageUrl.trim() ? imageUrl.trim() : undefined,
        slug: finalSlug, // Ensure slug is always a string
        sortOrder: Number(data.sortOrder) || 0, // Convert sortOrder to number
        description:
          data.description && data.description.trim()
            ? data.description.trim()
            : undefined,
        icon: data.icon && data.icon.trim() ? data.icon.trim() : undefined,
        metaTitle:
          data.metaTitle && data.metaTitle.trim()
            ? data.metaTitle.trim()
            : undefined,
        metaDescription:
          data.metaDescription && data.metaDescription.trim()
            ? data.metaDescription.trim()
            : undefined,
      };

      console.log("DEBUG: Category payload to submit:", cleanFormData);

      if (editingCategory) {
        // Update existing category
        await updateCategoryMutation.mutateAsync(cleanFormData);
        console.log("DEBUG: Category updated successfully");
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync(cleanFormData);
        console.log("DEBUG: Category created successfully");
      }

      // Reset state after successful operation
      setIsModalOpen(false);
      setEditingCategory(null);
      setUploadedImage(null);
      setIsImageRemoved(false);
    } catch (error: any) {
      console.error("DEBUG: Category form submit failed:", error);
      // Error will be handled by the mutation's onError callback
    }
  }; // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setUploadedImage(null);
    setIsImageRemoved(false);
  };

  // Form default values
  const getDefaultValues = () => {
    if (editingCategory) {
      console.log(
        "DEBUG: Getting default values for editingCategory:",
        editingCategory
      );
      return {
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || "",
        image: editingCategory.image || "",
        icon: editingCategory.icon || "",
        isActive: editingCategory.isActive,
        sortOrder: editingCategory.sortOrder,
        metaTitle: "",
        metaDescription: "",
      };
    }
    return {
      name: "",
      slug: "",
      description: "",
      image: "",
      icon: "",
      isActive: true,
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
    };
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "image",
        title: "",
        width: 80,
        render: (value: any, record: CategoryTableData) => (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
            {record.image ? (
              <Image
                src={record.image}
                alt={record.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : record.icon ? (
              <div className="text-2xl">{record.icon}</div>
            ) : (
              <FolderPlus className="w-6 h-6 text-gray-400" />
            )}
          </div>
        ),
      },
      {
        key: "name",
        title: "Kategori Bilgileri",
        dataIndex: "name",
        sortable: true,
        render: (value: string, record: CategoryTableData) => (
          <div>
            <div className="font-medium text-black">{value}</div>
            <div className="text-sm text-gray-600">{record.slug}</div>
            {record.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {record.description}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "packages",
        title: "Paketler",
        render: (value: any, record: CategoryTableData) => (
          <div>
            <div className="font-medium text-black flex items-center">
              <Package className="w-4 h-4 mr-1 text-orange-400" />
              {record._count.packages} Paket
            </div>
            {record.packages.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {record.packages.slice(0, 2).map((pkg) => (
                  <div key={pkg.id} className="text-xs">
                    {pkg.name} -{" "}
                    {typeof pkg.basePrice === "string"
                      ? parseFloat(pkg.basePrice)
                      : pkg.basePrice}{" "}
                    ₺
                  </div>
                ))}
                {record.packages.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{record.packages.length - 2} daha...
                  </div>
                )}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Durum",
        render: (value: any, record: CategoryTableData) => (
          <div className="flex items-center gap-2">
            {record.isActive ? (
              <ToggleRight className="w-5 h-5 text-green-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
            <span
              className={`text-sm font-medium ${
                record.isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {record.isActive ? "Aktif" : "Pasif"}
            </span>
          </div>
        ),
      },
      {
        key: "sortOrder",
        title: "Sıralama",
        dataIndex: "sortOrder",
        sortable: true,
        render: (value: number) => (
          <div className="flex items-center text-black">
            <Hash className="w-4 h-4 mr-1 text-gray-400" />
            {value}
          </div>
        ),
      },
      {
        key: "createdAt",
        title: "Oluşturulma",
        dataIndex: "createdAt",
        sortable: true,
        render: (value: Date | string) => (
          <div className="flex items-center text-black">
            <Clock className="w-4 h-4 mr-1 text-gray-400" />
            {new Date(value).toLocaleDateString("tr-TR")}
          </div>
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
      onClick: (_record: CategoryTableData) => {
        // TODO: Implement view category details
      },
      variant: "secondary" as const,
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: CategoryTableData) => {
        console.log("DEBUG: Edit button clicked for category:", record);
        setEditingCategory(record);
        setIsImageRemoved(false); // Reset image removed state

        // Set existing image if available
        if (record.image && record.image.trim() !== "") {
          console.log("DEBUG: Setting existing category image:", record.image);
          setUploadedImage({
            id: "existing-image",
            name: "Kategori Resmi",
            size: 0,
            type: "image/jpeg",
            url: record.image,
            uploadedAt: new Date(),
            status: "success" as const,
          });
        } else {
          console.log("DEBUG: No existing category image found");
          setUploadedImage(null);
        }

        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: CategoryTableData) => {
        openDeleteConfirm(record.id, record.name);
      },
      variant: "danger" as const,
      disabled: (record: CategoryTableData) => record._count.packages > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Kategori Yönetimi
            </h1>
            <p className="text-black mt-1">
              Hizmet kategorilerinizi görüntüleyin ve yönetin
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
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
                setEditingCategory(null);
                setUploadedImage(null);
                setIsImageRemoved(false);
              }}
              className="inline-flex items-center px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kategori
            </button>
          </div>
        </div>

        {/* Stats */}
        {categoryStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FolderPlus className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Toplam Kategori
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {categoryStats.total}
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
                      {categoryStats.active}
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
                      {categoryStats.inactive}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex items-center">
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
              Pasif kategorileri göster
            </span>
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={categoriesData?.items || []}
          columns={columns}
          loading={isLoading}
          actions={actions}
          selection={{
            type: "checkbox",
            selectedRowKeys: selectedCategories,
            onChange: (keys) => setSelectedCategories(keys as string[]),
          }}
          rowKey="id"
          className="border-0"
          searchable={false}
        />
      </div>

      {/* Form Dialog for Create/Edit Category */}
      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
        size="lg"
      >
        <Form
          key={editingCategory?.id || "new"}
          schema={categoryCreateSchema}
          defaultValues={getDefaultValues()}
          onSubmit={(data) => {
            console.log(
              "DEBUG: Category form onSubmit called with data:",
              data
            );
            console.log("DEBUG: Is editing category:", !!editingCategory);
            return handleFormSubmit(data);
          }}
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                name="name"
                label="Kategori Adı"
                placeholder="Düğün Fotoğrafçılığı"
                required
              />
              <TextField
                name="slug"
                label="Slug (Otomatik oluşturulur)"
                placeholder="dugun-fotografciligi"
                helperText="Boş bırakırsanız kategori adından otomatik oluşturulur"
              />
            </div>

            <TextareaField
              name="description"
              label="Açıklama"
              placeholder="Kategori hakkında detaylı bilgi..."
              rows={3}
            />

            {/* Visual */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">Görsel</h3>
              <div className="space-y-4">
                {/* Upload Component */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Resmi
                  </label>
                  <Upload
                    preset="image"
                    maxFiles={1}
                    initialFiles={
                      editingCategory?.image
                        ? [
                            {
                              id: "existing-image",
                              name: "Kategori Resmi",
                              size: 0,
                              type: "image/jpeg",
                              url: editingCategory.image,
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
                  {(uploadedImage?.url ||
                    (editingCategory?.image && !isImageRemoved)) && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Önizleme
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedImage(null);
                            setIsImageRemoved(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Resmi Kaldır
                        </button>
                      </div>
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                        <Image
                          src={
                            uploadedImage?.url || editingCategory?.image || ""
                          }
                          alt="Kategori resmi önizlemesi"
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <TextField name="icon" label="İkon (Emoji)" placeholder="📸" />
              </div>
            </div>

            {/* Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">Ayarlar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberField
                  name="sortOrder"
                  label="Sıralama"
                  placeholder="0"
                  min={0}
                  step={1}
                />
                <div className="flex items-center pt-8">
                  <CheckboxField name="isActive" label="Aktif" />
                </div>
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
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
              }
              className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
              }
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              {createCategoryMutation.isPending ||
              updateCategoryMutation.isPending
                ? "Kaydediliyor..."
                : editingCategory
                ? "Güncelle"
                : "Oluştur"}
            </button>
          </div>
        </Form>
      </Dialog>

      {/* Confirm Dialog for Delete Category */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, categoryId: "", categoryName: "" })
        }
        onConfirm={() => handleDeleteCategory(deleteConfirm.categoryId)}
        title="Kategori Sil"
        description={`"${deleteConfirm.categoryName}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
