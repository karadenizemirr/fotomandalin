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
  CheckboxField,
  NumberField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import Upload, { UploadedFile } from "@/components/organisms/upload/Upload";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Hash,
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

// Working hours utilities
const formatWorkingHours = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return undefined;
  return { start: startTime, end: endTime };
};

const parseWorkingHours = (workingHours: any) => {
  if (!workingHours || typeof workingHours !== "object") {
    return { start: "", end: "" };
  }
  return {
    start: workingHours.start || "",
    end: workingHours.end || "",
  };
};

const displayWorkingHours = (workingHours: any) => {
  if (!workingHours || typeof workingHours !== "object") {
    return "Belirtilmemiş";
  }
  const { start, end } = workingHours;
  if (!start || !end) return "Belirtilmemiş";
  return `${start} - ${end}`;
};

// Validation schemas
const locationCreateSchema = z.object({
  name: z.string().min(1, "Lokasyon adı gereklidir"),
  slug: z.string().optional(),
  description: z.string().optional(),
  address: z.string().min(1, "Adres gereklidir"),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  extraFee: z.coerce
    .number()
    .min(0, "Ek ücret 0'dan büyük olmalıdır")
    .default(0),
  maxBookingsPerDay: z.coerce
    .number()
    .min(1, "Günlük maksimum rezervasyon sayısı en az 1 olmalıdır")
    .default(10),
  sortOrder: z.coerce
    .number()
    .min(0, "Sıralama 0'dan büyük olmalıdır")
    .default(0),
  // Çalışma saatleri için ayrı alanlar
  workingStartTime: z.string().optional(),
  workingEndTime: z.string().optional(),
  isActive: z.boolean().default(true),
});

const locationUpdateSchema = locationCreateSchema.extend({
  id: z.string(),
});

type LocationFormData = z.infer<typeof locationCreateSchema>;
type LocationUpdateData = z.infer<typeof locationUpdateSchema> & {
  workingStartTime?: string;
  workingEndTime?: string;
};

const LocationContainer = () => {
  // State
  const [_searchTerm, _setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [uploadedCoverImage, setUploadedCoverImage] =
    useState<UploadedFile | null>(null);

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const {
    data: locationsData,
    isLoading,
    refetch,
  } = trpc.location.getAll.useQuery({
    page: currentPage,
    limit: pageSize,
  });

  // Create mutation
  const createMutation = trpc.location.create.useMutation();

  // Update mutation
  const updateMutation = trpc.location.update.useMutation();

  const deleteMutation = trpc.location.delete.useMutation();

  const toggleStatusMutation = trpc.location.toggleStatus.useMutation();

  // Reset form function
  const resetForm = () => {
    setSelectedLocation(null);
    setUploadedImages([]);
    setUploadedCoverImage(null);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    if (!locationsData?.locations) return [];

    return locationsData.locations.filter(
      (location: any) =>
        location.name.toLowerCase().includes(_searchTerm.toLowerCase()) ||
        location.address?.toLowerCase().includes(_searchTerm.toLowerCase())
    );
  }, [locationsData?.locations, _searchTerm]);

  // Handle form submission for create
  const handleCreate = async (data: LocationFormData) => {
    console.log("DEBUG: Location form submit triggered with data:", data);
    console.log("DEBUG: Uploaded cover:", uploadedCoverImage);
    console.log("DEBUG: Uploaded images:", uploadedImages);

    try {
      // Validate required fields
      if (!data.name) {
        console.log("DEBUG: No location name provided");
        addToast({
          message: "Lokasyon adı gereklidir",
          type: "error",
        });
        return;
      }

      // URL'lere BASE_URL ön eki ekle
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

      let coverImageUrl: string | undefined;
      if (uploadedCoverImage) {
        coverImageUrl = uploadedCoverImage.url.startsWith("http")
          ? uploadedCoverImage.url
          : `${baseUrl}${uploadedCoverImage.url}`;
      }

      const imageUrls = uploadedImages.map((img) =>
        img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`
      );

      // URL formatını kontrol et
      if (coverImageUrl) {
        try {
          new URL(coverImageUrl);
        } catch (urlError) {
          console.error("Invalid cover image URL format:", urlError);
          addToast({
            message:
              "Kapak görseli URL'i geçerli değil. Lütfen tekrar yükleyin.",
            type: "error",
          });
          return;
        }
      }

      if (imageUrls.length > 0) {
        try {
          imageUrls.forEach((url) => new URL(url));
        } catch (urlError) {
          console.error("Invalid image URL format:", urlError);
          addToast({
            message: "Görsel URL'leri geçerli değil. Lütfen tekrar yükleyin.",
            type: "error",
          });
          return;
        }
      }

      // Çalışma saatlerini JSON formatına dönüştür
      const workingHours = formatWorkingHours(
        data.workingStartTime,
        data.workingEndTime
      );

      const formattedData = {
        ...data,
        slug: data.slug || generateSlug(data.name || ""),
        images: imageUrls,
        coverImage: coverImageUrl,
        workingHours: workingHours,
      };

      // workingStartTime ve workingEndTime alanlarını kaldır (bunlar API'ye gönderilmemeli)
      const { workingStartTime, workingEndTime, ...apiData } = formattedData;

      console.log("DEBUG: Location payload to submit:", apiData);

      await createMutation.mutateAsync(apiData);

      console.log("DEBUG: Location created successfully");
      addToast({
        message: "Lokasyon başarıyla oluşturuldu",
        type: "success",
      });
      setIsCreateModalOpen(false);
      refetch();
      resetForm();
    } catch (error: any) {
      console.error("DEBUG: Location creation failed:", error);
      addToast({
        message: error.message || "Lokasyon oluşturulurken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle form submission for update
  const handleUpdate = async (data: LocationUpdateData) => {
    console.log("DEBUG: Location update triggered with data:", data);
    console.log("DEBUG: Uploaded cover:", uploadedCoverImage);
    console.log("DEBUG: Uploaded images:", uploadedImages);

    try {
      if (!selectedLocation?.id) {
        addToast({
          message: "Güncellenecek lokasyon bulunamadı",
          type: "error",
        });
        return;
      }

      // URL'lere BASE_URL ön eki ekle
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

      let coverImageUrl: string | undefined;
      if (uploadedCoverImage) {
        coverImageUrl = uploadedCoverImage.url.startsWith("http")
          ? uploadedCoverImage.url
          : `${baseUrl}${uploadedCoverImage.url}`;
      }

      const imageUrls = uploadedImages.map((img) =>
        img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`
      );

      // URL formatını kontrol et
      if (coverImageUrl) {
        try {
          new URL(coverImageUrl);
        } catch (urlError) {
          console.error("Invalid cover image URL format:", urlError);
          addToast({
            message:
              "Kapak görseli URL'i geçerli değil. Lütfen tekrar yükleyin.",
            type: "error",
          });
          return;
        }
      }

      if (imageUrls.length > 0) {
        try {
          imageUrls.forEach((url) => new URL(url));
        } catch (urlError) {
          console.error("Invalid image URL format:", urlError);
          addToast({
            message: "Görsel URL'leri geçerli değil. Lütfen tekrar yükleyin.",
            type: "error",
          });
          return;
        }
      }

      // Çalışma saatlerini JSON formatına dönüştür
      const workingHours = formatWorkingHours(
        data.workingStartTime,
        data.workingEndTime
      );

      const formattedData = {
        ...data,
        id: selectedLocation.id,
        slug: data.slug || generateSlug(data.name || ""),
        images: imageUrls,
        coverImage: coverImageUrl,
        workingHours: workingHours,
      };

      // workingStartTime ve workingEndTime alanlarını kaldır (bunlar API'ye gönderilmemeli)
      const { workingStartTime, workingEndTime, ...apiData } = formattedData;

      console.log("DEBUG: Location update payload:", apiData);

      await updateMutation.mutateAsync(apiData);

      console.log("DEBUG: Location updated successfully");
      addToast({
        message: "Lokasyon başarıyla güncellendi",
        type: "success",
      });
      setIsEditModalOpen(false);
      refetch();
      resetForm();
    } catch (error: any) {
      console.error("DEBUG: Location update failed:", error);
      addToast({
        message: error.message || "Lokasyon güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedLocation) {
        await deleteMutation.mutateAsync({ id: selectedLocation.id });
        addToast({
          message: "Lokasyon başarıyla silindi",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        refetch();
      }
    } catch (error: any) {
      addToast({
        message: error.message || "Lokasyon silinirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (location: any) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: location.id });
      addToast({
        message: "Lokasyon durumu güncellendi",
        type: "success",
      });
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Durum güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle edit
  const handleEdit = (location: any) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);

    // Set uploaded images if any
    if (location.images && location.images.length > 0) {
      setUploadedImages(
        location.images.map((url: string, index: number) => ({
          id: `existing-${index}`,
          name: `image-${index + 1}`,
          url,
          size: 0,
          type: "image/jpeg",
          uploadedAt: new Date(),
          status: "completed" as const,
        }))
      );
    }

    // Set cover image if exists
    if (location.coverImage) {
      setUploadedCoverImage({
        id: "existing-cover",
        name: "cover-image",
        url: location.coverImage,
        size: 0,
        type: "image/jpeg",
        uploadedAt: new Date(),
        status: "success" as const,
      });
    }
  };

  // DataTable columns
  const columns = [
    {
      key: "name",
      title: "Lokasyon Adı",
      dataIndex: "name",
      sortable: true,
      width: "200px",
      render: (value: string, record: any) => (
        <div className="flex items-center space-x-3">
          {record.coverImage && (
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={record.coverImage}
                alt={value}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">#{record.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      title: "Adres",
      dataIndex: "address",
      sortable: true,
      width: "250px",
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 truncate" title={value}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "extraFee",
      title: "Ek Ücret",
      dataIndex: "extraFee",
      sortable: true,
      width: "120px",
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-900">
            {value > 0 ? `${value} ₺` : "Ücretsiz"}
          </span>
        </div>
      ),
    },
    {
      key: "maxBookingsPerDay",
      title: "Günlük Kapasite",
      dataIndex: "maxBookingsPerDay",
      sortable: true,
      width: "120px",
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      key: "workingHours",
      title: "Çalışma Saatleri",
      dataIndex: "workingHours",
      width: "150px",
      render: (value: any) => (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            {displayWorkingHours(value)}
          </span>
        </div>
      ),
    },
    {
      key: "sortOrder",
      title: "Sıralama",
      dataIndex: "sortOrder",
      sortable: true,
      width: "100px",
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Durum",
      dataIndex: "isActive",
      width: "100px",
      render: (value: boolean, record: any) => (
        <button
          onClick={() => handleToggleStatus(record)}
          className="flex items-center space-x-1 p-1 rounded-md hover:bg-gray-50 transition-colors"
        >
          {value ? (
            <>
              <ToggleRight className="w-5 h-5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Aktif</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">Pasif</span>
            </>
          )}
        </button>
      ),
    },
  ];

  // Action buttons
  const actions = [
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => handleEdit(record),
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedLocation(record);
        setIsDeleteModalOpen(true);
      },
      className: "text-red-600 hover:text-red-700 hover:bg-red-50",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lokasyon Yönetimi
            </h1>
            <p className="text-sm text-gray-600">
              Rezervasyon yapılabilecek lokasyonları yönetin
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Lokasyon</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <DataTable
          data={filteredData}
          columns={columns}
          loading={isLoading}
          actions={actions}
          searchable
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: locationsData?.pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          emptyText="Henüz lokasyon bulunmuyor"
        />
      </div>

      {/* Create Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Yeni Lokasyon Oluştur"
        size="lg"
      >
        <Form schema={locationCreateSchema} onSubmit={handleCreate}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TextField
                name="name"
                label="Lokasyon Adı"
                placeholder="Örn: Merkez Lokasyon"
                required
              />

              <TextField
                name="slug"
                label="URL Slug"
                placeholder="Otomatik oluşturulacak"
                helperText="Boş bırakılırsa lokasyon adından otomatik oluşturulur"
              />

              <TextareaField
                name="description"
                label="Açıklama"
                placeholder="Lokasyon hakkında detaylar..."
                rows={3}
              />

              <TextField
                name="address"
                label="Adres"
                placeholder="Lokasyon adresi"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  name="latitude"
                  label="Enlem (Latitude)"
                  placeholder="41.0082"
                  step="any"
                  min={-90}
                  max={90}
                />

                <NumberField
                  name="longitude"
                  label="Boylam (Longitude)"
                  placeholder="28.9784"
                  step="any"
                  min={-180}
                  max={180}
                />
              </div>
            </div>

            <div className="space-y-4">
              <NumberField
                name="extraFee"
                label="Ek Ücret (₺)"
                placeholder="0"
                min={0}
                helperText="Bu lokasyon için ek ücret varsa belirtin"
              />

              <NumberField
                name="maxBookingsPerDay"
                label="Günlük Maksimum Rezervasyon"
                placeholder="10"
                min={1}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="workingStartTime"
                  label="Başlangıç Saati"
                  type="time"
                  placeholder="09:00"
                  helperText="Çalışmaya başlama saati"
                />

                <TextField
                  name="workingEndTime"
                  label="Bitiş Saati"
                  type="time"
                  placeholder="18:00"
                  helperText="Çalışmayı bitirme saati"
                />
              </div>

              <NumberField
                name="sortOrder"
                label="Sıralama"
                placeholder="0"
                min={0}
                helperText="Daha düşük değerler önce gösterilir"
              />

              <CheckboxField
                name="isActive"
                label="Aktif Durum"
                helperText="Lokasyonun rezervasyon için kullanılabilir olup olmadığını belirler"
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapak Görseli
                  </label>
                  <Upload
                    preset="image"
                    maxFiles={1}
                    initialFiles={
                      uploadedCoverImage ? [uploadedCoverImage] : []
                    }
                    onUpload={(files: UploadedFile[]) => {
                      if (files.length > 0) {
                        setUploadedCoverImage(files[0]);
                      }
                    }}
                    onRemove={() => setUploadedCoverImage(null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Galeri Görselleri
                  </label>
                  <Upload
                    preset="image"
                    multiple={true}
                    maxFiles={10}
                    initialFiles={uploadedImages}
                    onUpload={(files: UploadedFile[]) =>
                      setUploadedImages(files)
                    }
                    onRemove={(file) => {
                      setUploadedImages((prev) =>
                        prev.filter((f) => f.id !== file.id)
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {createMutation.isPending
                  ? "Oluşturuluyor..."
                  : "Lokasyon Oluştur"}
              </button>
            </div>
          </div>
        </Form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Lokasyon Düzenle"
      >
        {selectedLocation && (
          <Form
            schema={locationUpdateSchema}
            defaultValues={{
              id: selectedLocation.id,
              name: selectedLocation.name,
              slug: selectedLocation.slug,
              description: selectedLocation.description || "",
              address: selectedLocation.address,
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              extraFee: selectedLocation.extraFee,
              maxBookingsPerDay: selectedLocation.maxBookingsPerDay,
              sortOrder: selectedLocation.sortOrder,
              isActive: selectedLocation.isActive,
              workingStartTime: parseWorkingHours(selectedLocation.workingHours)
                .start,
              workingEndTime: parseWorkingHours(selectedLocation.workingHours)
                .end,
            }}
            onSubmit={handleUpdate}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextField
                  name="name"
                  label="Lokasyon Adı"
                  placeholder="Örn: Merkez Lokasyon"
                  required
                />

                <TextField
                  name="slug"
                  label="URL Slug"
                  placeholder="Otomatik oluşturulacak"
                  helperText="Boş bırakılırsa lokasyon adından otomatik oluşturulur"
                />

                <TextareaField
                  name="description"
                  label="Açıklama"
                  placeholder="Lokasyon hakkında detaylar..."
                  rows={3}
                />

                <TextField
                  name="address"
                  label="Adres"
                  placeholder="Lokasyon adresi"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    name="latitude"
                    label="Enlem (Latitude)"
                    placeholder="41.0082"
                    step="any"
                    min={-90}
                    max={90}
                  />

                  <NumberField
                    name="longitude"
                    label="Boylam (Longitude)"
                    placeholder="28.9784"
                    step="any"
                    min={-180}
                    max={180}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <NumberField
                  name="extraFee"
                  label="Ek Ücret (₺)"
                  placeholder="0"
                  min={0}
                  helperText="Bu lokasyon için ek ücret varsa belirtin"
                />

                <NumberField
                  name="maxBookingsPerDay"
                  label="Günlük Maksimum Rezervasyon"
                  placeholder="10"
                  min={1}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    name="workingStartTime"
                    label="Başlangıç Saati"
                    type="time"
                    placeholder="09:00"
                    helperText="Çalışmaya başlama saati"
                  />

                  <TextField
                    name="workingEndTime"
                    label="Bitiş Saati"
                    type="time"
                    placeholder="18:00"
                    helperText="Çalışmayı bitirme saati"
                  />
                </div>

                <NumberField
                  name="sortOrder"
                  label="Sıralama"
                  placeholder="0"
                  min={0}
                  helperText="Daha düşük değerler önce gösterilir"
                />

                <CheckboxField
                  name="isActive"
                  label="Aktif Durum"
                  helperText="Lokasyonun rezervasyon için kullanılabilir olup olmadığını belirler"
                />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Kapak Görseli
                    </label>
                    <Upload
                      multiple={false}
                      maxFiles={1}
                      onUpload={(files: UploadedFile[]) =>
                        setUploadedCoverImage(files[0] || null)
                      }
                      onRemove={() => setUploadedCoverImage(null)}
                      initialFiles={
                        uploadedCoverImage ? [uploadedCoverImage] : []
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Galeri Görselleri
                    </label>
                    <Upload
                      multiple={true}
                      maxFiles={10}
                      onUpload={(files: UploadedFile[]) =>
                        setUploadedImages([...uploadedImages, ...files])
                      }
                      onRemove={(fileToRemove: UploadedFile) =>
                        setUploadedImages(
                          uploadedImages.filter(
                            (file) => file.id !== fileToRemove.id
                          )
                        )
                      }
                      initialFiles={uploadedImages}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedLocation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {updateMutation.isPending
                    ? "Güncelleniyor..."
                    : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLocation(null);
        }}
        onConfirm={handleDelete}
        title="Lokasyon Sil"
        description={`"${selectedLocation?.name}" lokasyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LocationContainer;
