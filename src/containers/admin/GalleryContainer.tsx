"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import Image from "next/image";
import { trpc } from "@/components/providers/trpcProvider";
import { useToast } from "@/components/ui/toast/toast";
import DataTable from "@/components/organisms/datatable/Datatable";
import Form from "@/components/organisms/form/Form";
import {
  TextField,
  TextareaField,
  CheckboxField,
} from "@/components/organisms/form/FormField";
import { Dialog, ConfirmDialog } from "@/components/organisms/dialog";
import Upload, { UploadedFile } from "@/components/organisms/upload/Upload";
import {
  Images,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Star,
  Copy,
  Globe,
  EyeOff,
  Calendar,
  MapPin,
  Search,
  Filter,
  Download,
  Camera,
} from "lucide-react";
import { createSlug } from "@/lib/utils";

// Validation schemas - Upload state'ilerini de dahil ederek düzeltiyorum
const portfolioCreateSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  description: z.string().optional(),
  // coverImage'ı optional yapıp validation'ı handleCreate'de yapacağız
  coverImage: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const portfolioUpdateSchema = portfolioCreateSchema.extend({
  id: z.string(),
});

type PortfolioFormData = z.infer<typeof portfolioCreateSchema>;
type PortfolioUpdateData = z.infer<typeof portfolioUpdateSchema>;

const GalleryContainer = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [uploadedCover, setUploadedCover] = useState<UploadedFile | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Toast hook
  const { addToast } = useToast();

  // tRPC hooks
  const {
    data: portfolioData,
    isLoading,
    refetch,
  } = trpc.portfolio.adminList.useQuery({
    limit: pageSize,
    cursor: undefined,
    isPublished:
      publishFilter !== "all" ? publishFilter === "published" : undefined,
    isFeatured:
      featuredFilter !== "all" ? featuredFilter === "featured" : undefined,
    sortBy: "created",
    sortOrder: "desc",
  });

  const { data: portfolioStats } = trpc.portfolio.stats.useQuery();

  // Mutations
  const createMutation = trpc.portfolio.create.useMutation();
  const updateMutation = trpc.portfolio.update.useMutation();
  const deleteMutation = trpc.portfolio.delete.useMutation();
  const togglePublishMutation = trpc.portfolio.togglePublish.useMutation();
  const toggleFeaturedMutation = trpc.portfolio.toggleFeatured.useMutation();
  const duplicateMutation = trpc.portfolio.duplicate.useMutation();

  // Filtered data
  const filteredData = useMemo(() => {
    if (!portfolioData?.items) return [];
    let filtered = portfolioData.items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item: any) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag: any) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    return filtered;
  }, [portfolioData?.items, searchTerm]);

  // Reset upload states
  const resetUploadStates = () => {
    setUploadedCover(null);
    setUploadedImages([]);
    setTags([]);
    setTagInput("");
  };

  // Handle tag operations
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission for create - Backend schema'ya uygun veri formatı
  const handleCreate = async (data: PortfolioFormData) => {
    console.log("DEBUG: Form submit triggered with data:", data);
    console.log("DEBUG: Uploaded cover:", uploadedCover);
    console.log("DEBUG: Uploaded images:", uploadedImages);
    console.log("DEBUG: Tags:", tags);

    try {
      // Validate required fields
      if (!uploadedCover) {
        console.log("DEBUG: No cover image selected");
        addToast({
          message: "Kapak görseli seçmelisiniz",
          type: "error",
        });
        return;
      }

      // URL'lere BASE_URL ön eki ekle
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
      const coverImageUrl = uploadedCover.url.startsWith("http")
        ? uploadedCover.url
        : `${baseUrl}${uploadedCover.url}`;

      const galleryImageUrls = uploadedImages.map((img) =>
        img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`
      );

      // URL formatını kontrol et
      try {
        new URL(coverImageUrl);
        galleryImageUrls.forEach((url) => new URL(url));
      } catch (urlError) {
        console.error("Invalid URL format:", urlError);
        addToast({
          message: "Görsel URL'leri geçerli değil. Lütfen tekrar yükleyin.",
          type: "error",
        });
        return;
      }

      const slug = createSlug(data.title);
      console.log("DEBUG: Generated slug:", slug);

      // Backend schema'ya uygun veri formatı
      const portfolioPayload = {
        title: data.title,
        slug,
        description: data.description || undefined,
        coverImage: coverImageUrl,
        images: galleryImageUrls,
        tags,
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        location: data.location || undefined,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        // eventDate'i string olarak gönder, backend'de transform edilecek
        eventDate: data.eventDate || undefined,
      };

      console.log("DEBUG: Portfolio payload to submit:", portfolioPayload);

      await createMutation.mutateAsync(portfolioPayload);

      console.log("DEBUG: Portfolio created successfully");
      addToast({
        message: "Portfolio çalışması başarıyla oluşturuldu",
        type: "success",
      });
      setIsCreateModalOpen(false);
      resetUploadStates();
      refetch();
    } catch (error: any) {
      console.error("Error creating portfolio:", error);
      addToast({
        message: error.message || "Portfolio oluşturulurken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle form submission for update
  const handleUpdate = async (data: PortfolioUpdateData) => {
    try {
      // URL'lere BASE_URL ön eki ekle
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

      let coverImageUrl = data.coverImage;
      if (uploadedCover?.url) {
        coverImageUrl = uploadedCover.url.startsWith("http")
          ? uploadedCover.url
          : `${baseUrl}${uploadedCover.url}`;
      }

      let imageUrls = data.images;
      if (uploadedImages.length > 0) {
        imageUrls = uploadedImages.map((img) =>
          img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`
        );
      }

      await updateMutation.mutateAsync({
        ...data,
        coverImage: uploadedCover?.url || data.coverImage,
        images:
          uploadedImages.length > 0
            ? uploadedImages.map((img) => img.url)
            : data.images,
        tags: tags.length > 0 ? tags : data.tags,
        eventDate: data.eventDate || undefined,
      });

      addToast({
        message: "Portfolio çalışması başarıyla güncellendi",
        type: "success",
      });
      setIsEditModalOpen(false);
      resetUploadStates();
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Portfolio güncellenirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      if (selectedPortfolio) {
        await deleteMutation.mutateAsync({ id: selectedPortfolio.id });
        addToast({
          message: "Portfolio çalışması başarıyla silindi",
          type: "success",
        });
        setIsDeleteModalOpen(false);
        refetch();
      }
    } catch (error: any) {
      addToast({
        message: error.message || "Portfolio silinirken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (portfolio: any) => {
    try {
      await togglePublishMutation.mutateAsync({
        id: portfolio.id,
        isPublished: !portfolio.isPublished,
      });
      addToast({
        message: `Portfolio ${
          portfolio.isPublished ? "gizlendi" : "yayınlandı"
        }`,
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

  // Handle toggle featured
  const handleToggleFeatured = async (portfolio: any) => {
    try {
      await toggleFeaturedMutation.mutateAsync({
        id: portfolio.id,
        isFeatured: !portfolio.isFeatured,
      });
      addToast({
        message: `Portfolio ${
          portfolio.isFeatured ? "öne çıkarılmaktan çıkarıldı" : "öne çıkarıldı"
        }`,
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

  // Handle duplicate
  const handleDuplicate = async (portfolio: any) => {
    try {
      await duplicateMutation.mutateAsync({ id: portfolio.id });
      addToast({
        message: "Portfolio çalışması başarıyla kopyalandı",
        type: "success",
      });
      refetch();
    } catch (error: any) {
      addToast({
        message: error.message || "Portfolio kopyalanırken bir hata oluştu",
        type: "error",
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ isPublished }: { isPublished: boolean }) => {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isPublished
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isPublished ? (
          <>
            <Globe className="w-3 h-3 mr-1" />
            Yayında
          </>
        ) : (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            Taslak
          </>
        )}
      </span>
    );
  };

  // Featured badge component
  const FeaturedBadge = ({ isFeatured }: { isFeatured: boolean }) => {
    if (!isFeatured) return null;

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Star className="w-3 h-3 mr-1" />
        Öne Çıkan
      </span>
    );
  };

  // DataTable columns for list view
  const columns = [
    {
      key: "portfolio",
      title: "Çalışma",
      width: "300px",
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={record.coverImage || "/placeholder-image.jpg"}
              alt={record.title || "Portfolio görseli"}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
              onError={(e) => {
                console.error("Image failed to load:", record.coverImage);
                e.currentTarget.src = "/placeholder-image.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {record.title}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {record.description}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge isPublished={record.isPublished} />
              <FeaturedBadge isFeatured={record.isFeatured} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "details",
      title: "Detaylar",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="space-y-1">
          {record.eventDate && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(record.eventDate).toLocaleDateString("tr-TR")}
              </span>
            </div>
          )}
          {record.location && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{record.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Images className="w-3 h-3" />
            <span>{record.images?.length || 0} fotoğraf</span>
          </div>
        </div>
      ),
    },
    {
      key: "tags",
      title: "Etiketler",
      width: "200px",
      render: (value: any, record: any) => (
        <div className="flex flex-wrap gap-1">
          {record.tags?.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              #{tag}
            </span>
          ))}
          {record.tags?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{record.tags.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Oluşturulma",
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
        setSelectedPortfolio(record);
        setIsDetailModalOpen(true);
      },
    },
    {
      key: "edit",
      label: "Düzenle",
      icon: <Edit className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedPortfolio(record);
        setTags(record.tags || []);
        setIsEditModalOpen(true);
      },
    },
    {
      key: "publish",
      label: "Durum",
      icon: <Globe className="w-4 h-4" />,
      onClick: handleTogglePublish,
    },
    {
      key: "featured",
      label: "Öne Çıkar",
      icon: <Star className="w-4 h-4" />,
      onClick: handleToggleFeatured,
    },
    {
      key: "delete",
      label: "Sil",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record: any) => {
        setSelectedPortfolio(record);
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
          <h1 className="text-2xl font-bold text-gray-900">
            Portfolio & Galeri Yönetimi
          </h1>
          <p className="text-gray-600">Çalışmalarınızı paylaşın ve yönetin</p>
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
            <span>Yeni Çalışma</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {portfolioStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Çalışma
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yayında</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioStats.published}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Öne Çıkan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioStats.featured}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Görsel
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredData.reduce(
                    (total: any, item: any) =>
                      total + (item.images?.length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Images className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & View Toggle */}
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
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">Tümü</option>
              <option value="featured">Öne Çıkan</option>
              <option value="regular">Normal</option>
            </select>

            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Çalışma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
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
              setPageSize(size || 12);
            },
          }}
          emptyText="Henüz portfolio çalışması bulunmuyor"
        />
      </div>

      {/* Create Modal - Schema'yı düzeltiyorum */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetUploadStates();
        }}
        title="Yeni Portfolio Çalışması"
        description="Yeni bir çalışma ekleyin ve paylaşın"
        size="xl"
      >
        <Form
          schema={portfolioCreateSchema}
          defaultValues={{
            title: "",
            description: "",
            coverImage: "", // Bu alan artık optional
            images: [],
            tags: [],
            isPublished: false,
            isFeatured: false,
            eventDate: "",
            location: "",
            metaTitle: "",
            metaDescription: "",
          }}
          onSubmit={handleCreate}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextField
                  name="title"
                  label="Başlık"
                  placeholder="Örn: Düğün Çekimi - Ayşe & Mehmet"
                  required
                />

                <TextareaField
                  name="description"
                  label="Açıklama"
                  placeholder="Çalışma hakkında kısa açıklama..."
                  rows={3}
                />

                <TextField
                  name="location"
                  label="Lokasyon"
                  placeholder="Örn: İstanbul, Türkiye"
                />

                <TextField
                  name="eventDate"
                  label="Etkinlik Tarihi"
                  type="date"
                />

                <div className="flex space-x-6">
                  <CheckboxField name="isPublished" label="Yayınla" />
                  <CheckboxField name="isFeatured" label="Öne Çıkar" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapak Görseli *
                  </label>
                  <Upload
                    preset="image"
                    multiple={false}
                    initialFiles={uploadedCover ? [uploadedCover] : []}
                    onUpload={(files) => {
                      if (files.length > 0) {
                        setUploadedCover(files[0]);
                        console.log("Cover image uploaded:", files[0]);
                      }
                    }}
                    onRemove={() => {
                      setUploadedCover(null);
                      console.log("Cover image removed");
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                  />
                  {uploadedCover && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 flex items-center">
                        <span className="mr-2">✓</span>
                        Kapak görseli seçildi: {uploadedCover.name}
                      </p>
                    </div>
                  )}
                  {!uploadedCover && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-700 flex items-center">
                        <span className="mr-2">⚠️</span>
                        Kapak görseli zorunludur
                      </p>
                    </div>
                  )}
                </div>

                {/* Gallery Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Galeri Görselleri
                  </label>
                  <Upload
                    preset="image"
                    multiple={true}
                    maxFiles={20}
                    initialFiles={uploadedImages}
                    onUpload={(files) => {
                      setUploadedImages(files);
                      console.log("Gallery images uploaded:", files);
                    }}
                    onRemove={(file) => {
                      setUploadedImages(
                        uploadedImages.filter((img) => img.id !== file.id)
                      );
                      console.log("Gallery image removed:", file);
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                  />
                  {uploadedImages.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 flex items-center">
                        <span className="mr-2">✓</span>
                        {uploadedImages.length} görsel seçildi
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {uploadedImages.map((img, index) => (
                          <span
                            key={index}
                            className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"
                          >
                            {img.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Etiket ekle..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddTag();
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >
                      Ekle
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveTag(tag);
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700 flex items-center">
                        <span className="mr-2">✓</span>
                        {tags.length} etiket eklendi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                SEO Ayarları
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TextField
                  name="metaTitle"
                  label="Meta Başlık"
                  placeholder="SEO için özel başlık"
                />
                <TextareaField
                  name="metaDescription"
                  label="Meta Açıklama"
                  placeholder="SEO için açıklama"
                  rows={2}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetUploadStates();
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !uploadedCover}
                  className="px-6 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {createMutation.isPending ? "Ekleniyor..." : "Çalışma Ekle"}
                </button>
              </div>
            </div>
          </div>
        </Form>
      </Dialog>

      {/* Edit Modal */}
      {selectedPortfolio && (
        <Dialog
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            resetUploadStates();
          }}
          title="Portfolio Düzenle"
          description="Çalışma bilgilerini güncelleyin"
          size="lg"
        >
          <Form
            schema={portfolioUpdateSchema}
            defaultValues={{
              id: selectedPortfolio.id,
              title: selectedPortfolio.title,
              description: selectedPortfolio.description || "",
              coverImage: selectedPortfolio.coverImage,
              images: selectedPortfolio.images || [],
              tags: selectedPortfolio.tags || [],
              isPublished: selectedPortfolio.isPublished,
              isFeatured: selectedPortfolio.isFeatured,
              eventDate: selectedPortfolio.eventDate
                ? new Date(selectedPortfolio.eventDate)
                    .toISOString()
                    .slice(0, 10)
                : "",
              location: selectedPortfolio.location || "",
              metaTitle: selectedPortfolio.metaTitle || "",
              metaDescription: selectedPortfolio.metaDescription || "",
            }}
            onSubmit={handleUpdate}
          >
            {/* Similar form structure as create modal */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <TextField
                    name="title"
                    label="Başlık"
                    placeholder="Örn: Düğün Çekimi - Ayşe & Mehmet"
                    required
                  />

                  <TextareaField
                    name="description"
                    label="Açıklama"
                    placeholder="Çalışma hakkında kısa açıklama..."
                    rows={3}
                  />

                  <TextField
                    name="location"
                    label="Lokasyon"
                    placeholder="Örn: İstanbul, Türkiye"
                  />

                  <TextField
                    name="eventDate"
                    label="Etkinlik Tarihi"
                    type="date"
                  />
                </div>

                <div className="space-y-4">
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapak Görseli
                    </label>
                    <Upload
                      preset="image"
                      multiple={false}
                      initialFiles={uploadedCover ? [uploadedCover] : []}
                      onUpload={(files) => {
                        if (files.length > 0) {
                          setUploadedCover(files[0]);
                        }
                      }}
                      onRemove={() => setUploadedCover(null)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                    />
                  </div>

                  {/* Gallery Images Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Galeri Görselleri
                    </label>
                    <Upload
                      preset="image"
                      multiple={true}
                      maxFiles={20}
                      initialFiles={uploadedImages}
                      onUpload={(files) => {
                        setUploadedImages(files);
                      }}
                      onRemove={(file) => {
                        setUploadedImages(
                          uploadedImages.filter((img) => img.id !== file.id)
                        );
                      }}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4"
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
                    resetUploadStates();
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
        </Dialog>
      )}

      {/* Detail Modal */}
      {selectedPortfolio && (
        <Dialog
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Portfolio Detayları"
          description={selectedPortfolio.title}
          size="xl"
        >
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <Image
                src={selectedPortfolio.coverImage}
                alt={selectedPortfolio.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover"
                unoptimized
              />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Genel Bilgiler
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Durum:
                      </span>
                      <StatusBadge
                        isPublished={selectedPortfolio.isPublished}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Öne Çıkan:
                      </span>
                      <FeaturedBadge
                        isFeatured={selectedPortfolio.isFeatured}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Görsel Sayısı:
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedPortfolio.images?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Oluşturulma:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(
                          selectedPortfolio.createdAt
                        ).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPortfolio.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Açıklama
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPortfolio.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(selectedPortfolio.eventDate ||
                  selectedPortfolio.location) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Etkinlik Bilgileri
                    </h3>
                    <div className="space-y-2">
                      {selectedPortfolio.eventDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {new Date(
                              selectedPortfolio.eventDate
                            ).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      )}
                      {selectedPortfolio.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {selectedPortfolio.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPortfolio.tags &&
                  selectedPortfolio.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Etiketler
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPortfolio.tags.map(
                          (tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              #{tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Gallery */}
            {selectedPortfolio.images &&
              selectedPortfolio.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Galeri
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedPortfolio.images.map(
                      (image: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={image}
                            alt={`${selectedPortfolio.title} - ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover"
                            unoptimized
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setTags(selectedPortfolio.tags || []);
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
        title="Portfolio Çalışmasını Sil"
        description={`"${selectedPortfolio?.title}" adlı çalışmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        type="error"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleryContainer;
