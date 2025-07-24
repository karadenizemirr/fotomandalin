"use client";

import { useState, useMemo, useCallback } from "react";
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
  SelectField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Puzzle,
  Clock,
  DollarSign,
  Package,
  ToggleLeft,
  ToggleRight,
  Copy,
  TrendingUp,
} from "lucide-react";

// Memoized Icon Component - Performance optimizasyonu için
const AddonIcon = ({ isActive }: { isActive?: boolean }) => {
  return (
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center border border-gray-200 ${
        isActive
          ? "bg-gradient-to-br from-blue-100 to-blue-200"
          : "bg-gradient-to-br from-gray-100 to-gray-200"
      }`}
    >
      <Puzzle
        className={`w-6 h-6 ${isActive ? "text-blue-600" : "text-gray-400"}`}
      />
    </div>
  );
};

// Validation schemas
const addOnCreateSchema = z.object({
  name: z.string().min(1, "Eklenti adı gereklidir"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Fiyat 0'dan büyük olmalıdır"), // Use coerce to convert string to number
  currency: z.string().default("TRY"),
  isActive: z.boolean().default(true),
  durationInMinutes: z.coerce.number().int().min(1).optional(), // Use coerce to convert string to number
});

const addOnUpdateSchema = addOnCreateSchema.partial().extend({
  id: z.string(),
});

type AddOnFormData = z.infer<typeof addOnCreateSchema>;
type AddOnUpdateData = z.infer<typeof addOnUpdateSchema>;

interface AddOnTableData {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  currency: string;
  isActive: boolean;
  durationInMinutes?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  packages: Array<{
    package: {
      id: string;
      name: string;
      slug: string;
      isActive: boolean;
    };
  }>;
}

export default function AddonsContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOnTableData | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    addOnId: string;
    addOnName: string;
  }>({ isOpen: false, addOnId: "", addOnName: "" });
  const [filters, setFilters] = useState({
    includeInactive: false,
    limit: 50,
  });

  // Toast hook
  const { addToast } = useToast();

  // tRPC queries
  const {
    data: addOnsData,
    isLoading,
    refetch,
  } = trpc.addOn.list.useQuery(filters);

  const { data: addOnStats } = trpc.addOn.stats.useQuery();

  // tRPC mutations
  const createAddOnMutation = trpc.addOn.create.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Ek hizmet başarıyla oluşturuldu",
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

  const updateAddOnMutation = trpc.addOn.update.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Ek hizmet başarıyla güncellendi",
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

  const deleteAddOnMutation = trpc.addOn.delete.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Ek hizmet başarıyla silindi",
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

  const duplicateAddOnMutation = trpc.addOn.duplicate.useMutation({
    onSuccess: () => {
      addToast({
        title: "Başarılı",
        message: "Ek hizmet başarıyla kopyalandı",
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
  const handleDeleteAddOn = async (addOnId: string) => {
    await deleteAddOnMutation.mutateAsync({ id: addOnId });
    setDeleteConfirm({ isOpen: false, addOnId: "", addOnName: "" });
  };

  const handleDuplicateAddOn = async (addOnId: string) => {
    await duplicateAddOnMutation.mutateAsync({ id: addOnId });
  };

  const openDeleteConfirm = (addOnId: string, addOnName: string) => {
    setDeleteConfirm({ isOpen: true, addOnId, addOnName });
  };

  // Form submit handler
  const handleFormSubmit = async (data: any) => {
    console.log("DEBUG: AddOn form submit triggered with data:", data);
    console.log("DEBUG: Editing addon:", editingAddOn);

    try {
      // Add id for update operations
      if (editingAddOn) {
        data.id = editingAddOn.id;
      }

      // Convert string values to numbers where needed and clean up empty strings
      const formData = {
        ...data,
        price: Number(data.price) || 0,
        durationInMinutes: data.durationInMinutes
          ? Number(data.durationInMinutes)
          : undefined,
        description:
          data.description && data.description.trim()
            ? data.description.trim()
            : undefined,
      };

      console.log("DEBUG: AddOn payload to submit:", formData);

      if (editingAddOn) {
        // Update existing addon
        await updateAddOnMutation.mutateAsync(formData);
        console.log("DEBUG: AddOn updated successfully");
      } else {
        // Create new addon
        await createAddOnMutation.mutateAsync(formData);
        console.log("DEBUG: AddOn created successfully");
      }

      // Reset state after successful operation
      setIsModalOpen(false);
      setEditingAddOn(null);
    } catch (error: any) {
      console.error("DEBUG: AddOn form submit failed:", error);
      // Error will be handled by the mutation's onError callback
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddOn(null);
  };

  // Form default values
  const getDefaultValues = () => {
    if (editingAddOn) {
      console.log(
        "DEBUG: Getting default values for editingAddOn:",
        editingAddOn
      );
      return {
        name: editingAddOn.name,
        description: editingAddOn.description || "",
        price:
          typeof editingAddOn.price === "string"
            ? parseFloat(editingAddOn.price)
            : editingAddOn.price,
        currency: editingAddOn.currency,
        isActive: editingAddOn.isActive,
        durationInMinutes: editingAddOn.durationInMinutes || undefined,
      };
    }
    return {
      name: "",
      description: "",
      price: 0,
      currency: "TRY",
      isActive: true,
      durationInMinutes: undefined,
    };
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        key: "icon",
        title: "",
        width: 60,
        render: (_value: any, record: AddOnTableData) => (
          <AddonIcon isActive={record.isActive} />
        ),
      },
      {
        key: "name",
        title: "Ek Hizmet Bilgileri",
        dataIndex: "name",
        sortable: true,
        render: (value: string, record: AddOnTableData) => (
          <div>
            <div className="font-medium text-black">{value}</div>
            {record.description && (
              <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                {record.description}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "price",
        title: "Fiyat & Süre",
        render: (value: any, record: AddOnTableData) => {
          const price =
            typeof record.price === "string"
              ? parseFloat(record.price)
              : record.price;

          return (
            <div>
              <div className="font-medium text-black flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                {price} {record.currency}
              </div>
              {record.durationInMinutes && (
                <div className="text-sm text-gray-600 flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {record.durationInMinutes} dakika
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "packages",
        title: "Paketler",
        render: (value: any, record: AddOnTableData) => (
          <div>
            <div className="font-medium text-black flex items-center">
              <Package className="w-4 h-4 mr-1 text-orange-400" />
              {record.packages.length} Paket
            </div>
            {record.packages.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {record.packages.slice(0, 2).map((pkg) => (
                  <div key={pkg.package.id} className="text-xs">
                    {pkg.package.name}
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
        render: (value: any, record: AddOnTableData) => (
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
      onClick: (_record: AddOnTableData) => {
        // TODO: Implement view addon details
      },
      variant: "secondary" as const,
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: AddOnTableData) => {
        console.log("DEBUG: Edit button clicked for addon:", record);
        setEditingAddOn(record);
        setIsModalOpen(true);
      },
      variant: "primary" as const,
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: AddOnTableData) => {
        openDeleteConfirm(record.id, record.name);
      },
      variant: "danger" as const,
      disabled: (record: AddOnTableData) => record.packages.length > 0,
    },
  ];

  // Currency options
  const currencyOptions = [
    { label: "TRY", value: "TRY" },
    { label: "USD", value: "USD" },
    { label: "EUR", value: "EUR" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Ek Hizmet Yönetimi
            </h1>
            <p className="text-black mt-1">
              Paketlere eklenebilecek ek hizmetleri görüntüleyin ve yönetin
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-orange-400 text-white text-sm font-medium rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ek Hizmet
            </button>
          </div>
        </div>

        {/* Stats */}
        {addOnStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Puzzle className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Toplam Ek Hizmet
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {addOnStats.total}
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
                      {addOnStats.active}
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
                      {addOnStats.inactive}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      Ort. Fiyat
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {addOnStats.averagePrice.toFixed(0)} ₺
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-black truncate">
                      En Popüler
                    </dt>
                    <dd className="text-lg font-medium text-black">
                      {addOnStats.mostUsed[0]?.name || "Yok"}
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
              Pasif ek hizmetleri göster
            </span>
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={addOnsData?.items || []}
          columns={columns}
          loading={isLoading}
          actions={actions}
          selection={{
            type: "checkbox",
            selectedRowKeys: selectedAddOns,
            onChange: (keys) => setSelectedAddOns(keys as string[]),
          }}
          rowKey="id"
          className="border-0"
          searchable={false}
        />
      </div>

      {/* Form Dialog for Create/Edit AddOn */}
      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAddOn ? "Ek Hizmet Düzenle" : "Yeni Ek Hizmet"}
        size="lg"
      >
        <Form
          key={editingAddOn?.id || "new"}
          schema={addOnCreateSchema}
          defaultValues={getDefaultValues()}
          onSubmit={(data) => {
            console.log("DEBUG: AddOn form onSubmit called with data:", data);
            console.log("DEBUG: Is editing addon:", !!editingAddOn);
            return handleFormSubmit(data);
          }}
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <TextField
                name="name"
                label="Ek Hizmet Adı"
                placeholder="Ek Fotoğraf Çekimi"
                required
              />
              <TextareaField
                name="description"
                label="Açıklama"
                placeholder="Ek hizmet hakkında detaylı bilgi..."
                rows={3}
              />
            </div>

            {/* Pricing & Duration */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">
                Fiyat ve Süre
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <NumberField
                  name="price"
                  label="Fiyat"
                  placeholder="0"
                  min={0}
                  step={0.01}
                  required
                />
                <SelectField
                  name="currency"
                  label="Para Birimi"
                  options={currencyOptions}
                  required
                />
                <NumberField
                  name="durationInMinutes"
                  label="Süre (Dakika)"
                  placeholder="30"
                  min={1}
                  step={1}
                />
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-black mb-4">Durum</h3>
              <CheckboxField name="isActive" label="Aktif" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={
                createAddOnMutation.isPending || updateAddOnMutation.isPending
              }
              className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={
                createAddOnMutation.isPending || updateAddOnMutation.isPending
              }
              className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
            >
              {createAddOnMutation.isPending || updateAddOnMutation.isPending
                ? "Kaydediliyor..."
                : editingAddOn
                ? "Güncelle"
                : "Oluştur"}
            </button>
          </div>
        </Form>
      </Dialog>

      {/* Confirm Dialog for Delete AddOn */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, addOnId: "", addOnName: "" })
        }
        onConfirm={() => handleDeleteAddOn(deleteConfirm.addOnId)}
        title="Ek Hizmet Sil"
        description={`"${deleteConfirm.addOnName}" ek hizmetini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteAddOnMutation.isPending}
      />
    </div>
  );
}
