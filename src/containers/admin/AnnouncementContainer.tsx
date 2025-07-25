"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { trpc } from "@/components/providers/trpcProvider";
import { Button } from "@/components/atoms/button";
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
  EyeOff,
  RefreshCw,
  Bell,
  ArrowUp,
  ArrowDown,
  Gift,
  Info,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { Announcement, AnnouncementType } from "@/types/announcement";
import { useToast } from "@/components/ui/toast/toast";

// Schema'yı tRPC router ile uyumlu hale getiriyorum
const announcementCreateSchema = z.object({
  title: z.string().min(1, "Başlık gereklidir"),
  message: z.string().min(1, "Mesaj gereklidir"),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "PROMOTION"]).default("INFO"),
  priority: z.coerce.number().min(0).max(100).default(50),
  actionText: z.string().optional(),
  actionLink: z.string().optional(),
  isActive: z.boolean().default(true),
});

type AnnouncementFormData = z.infer<typeof announcementCreateSchema>;

// TRPC response tipini database modeline uygun hale getir
interface AnnouncementTableData extends Announcement {
  creator?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function AnnouncementContainer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementTableData | null>(null);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>(
    []
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    announcementId: string;
    announcementTitle: string;
  }>({ isOpen: false, announcementId: "", announcementTitle: "" });
  const [filters, setFilters] = useState({
    search: "",
    type: "" as "" | AnnouncementType,
    includeInactive: false,
    limit: 50,
    page: 1,
  });

  const { addToast } = useToast();

  // tRPC queries - router ile tam uyumlu
  const {
    data: announcementsResponse,
    isLoading,
    refetch,
  } = trpc.announcement.getAll.useQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    type: filters.type || undefined,
    isActive: filters.includeInactive ? undefined : true,
  });

  // tRPC mutations - profesyonel toast bildirimleri ile
  const createAnnouncementMutation = trpc.announcement.create.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Duyuru Oluşturuldu!",
        message: "Yeni duyuru başarıyla sisteme eklendi",
        duration: 4000,
      });
      setIsModalOpen(false);
      refetch();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Oluşturma Hatası!",
        message: error.message || "Duyuru oluşturulurken bir hata oluştu",
        duration: 6000,
      });
    },
  });

  const updateAnnouncementMutation = trpc.announcement.update.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Güncelleme Başarılı!",
        message: "Duyuru bilgileri başarıyla güncellendi",
        duration: 4000,
      });
      setIsModalOpen(false);
      setEditingAnnouncement(null);
      refetch();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Güncelleme Hatası!",
        message: error.message || "Duyuru güncellenirken bir hata oluştu",
        duration: 6000,
      });
    },
  });

  const deleteAnnouncementMutation = trpc.announcement.delete.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Silme İşlemi Tamamlandı!",
        message: "Duyuru sistemden başarıyla kaldırıldı",
        duration: 4000,
      });
      setDeleteConfirm({
        isOpen: false,
        announcementId: "",
        announcementTitle: "",
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Silme Hatası!",
        message: error.message || "Duyuru silinirken bir hata oluştu",
        duration: 6000,
      });
    },
  });

  const toggleActiveMutation = trpc.announcement.toggleActive.useMutation({
    onSuccess: (data) => {
      const statusText = data?.isActive ? "aktif" : "pasif";
      addToast({
        type: "info",
        title: "Durum Güncellendi",
        message: `Duyuru ${statusText} duruma getirildi`,
        duration: 3000,
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Durum Değişikliği Başarısız!",
        message: error.message || "Duyuru durumu güncellenirken hata oluştu",
        duration: 5000,
      });
    },
  });

  const updatePriorityMutation = trpc.announcement.updatePriority.useMutation({
    onSuccess: () => {
      addToast({
        type: "success",
        title: "Öncelik Güncellendi",
        message: "Duyuru öncelik sırası başarıyla değiştirildi",
        duration: 2500,
      });
      refetch();
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Öncelik Hatası!",
        message: error.message || "Duyuru önceliği güncellenirken hata oluştu",
        duration: 4000,
      });
    },
  });

  // Handlers
  const handleCreate = async (data: AnnouncementFormData) => {
    await createAnnouncementMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: AnnouncementFormData) => {
    if (!editingAnnouncement) return;
    await updateAnnouncementMutation.mutateAsync({
      id: editingAnnouncement.id,
      ...data,
    });
  };

  const handleDelete = (announcementId: string, announcementTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      announcementId,
      announcementTitle,
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.announcementId) {
      await deleteAnnouncementMutation.mutateAsync({
        id: deleteConfirm.announcementId,
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleActiveMutation.mutateAsync({
      id,
      isActive: !currentStatus,
    });
  };

  const handlePriorityChange = async (
    id: string,
    currentPriority: number,
    direction: "up" | "down"
  ) => {
    const newPriority =
      direction === "up"
        ? currentPriority + 10
        : Math.max(0, currentPriority - 10);
    await updatePriorityMutation.mutateAsync({
      id,
      priority: newPriority,
    });
  };

  const handleEdit = (announcement: AnnouncementTableData) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  // Table columns configuration - DataTable interface'ine uygun
  const columns = useMemo(
    () => [
      {
        key: "title",
        title: "Duyuru",
        dataIndex: "title",
        render: (value: string, announcement: AnnouncementTableData) => (
          <div className="flex items-start space-x-2">
            {getTypeIcon(announcement.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-black truncate">
                {announcement.title}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 md:line-clamp-1 mt-1">
                {announcement.message}
              </p>
              {announcement.actionText && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 mt-1">
                  🔗 {announcement.actionText}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "type",
        title: "Tip",
        dataIndex: "type",
        hidden: "sm", // Mobilde gizle
        render: (value: AnnouncementType) => getTypeBadge(value),
      },
      {
        key: "priority",
        title: "Öncelik",
        dataIndex: "priority",
        hidden: "md", // Tablet ve mobilde gizle
        render: (value: number, announcement: AnnouncementTableData) => (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-black bg-gray-100 px-2 py-1 rounded border border-gray-200">
              {value}
            </span>
            <div className="flex flex-col space-y-0.5">
              <motion.button
                onClick={() =>
                  handlePriorityChange(announcement.id, value, "up")
                }
                className="p-0.5 hover:bg-green-50 border border-transparent hover:border-green-200 rounded transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Önceliği artır"
              >
                <ArrowUp className="w-2.5 h-2.5 text-gray-500 hover:text-green-600" />
              </motion.button>
              <motion.button
                onClick={() =>
                  handlePriorityChange(announcement.id, value, "down")
                }
                className="p-0.5 hover:bg-red-50 border border-transparent hover:border-red-200 rounded transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Önceliği azalt"
              >
                <ArrowDown className="w-2.5 h-2.5 text-gray-500 hover:text-red-600" />
              </motion.button>
            </div>
          </div>
        ),
      },
      {
        key: "isActive",
        title: "Durum",
        dataIndex: "isActive",
        render: (value: boolean, announcement: AnnouncementTableData) => (
          <div className="flex items-center space-x-1 md:space-x-2">
            <span
              className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium border ${
                value
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1 md:mr-1.5 ${
                  value ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span className="hidden sm:inline">
                {value ? "Aktif" : "Pasif"}
              </span>
            </span>
            <motion.button
              onClick={() => handleToggleActive(announcement.id, value)}
              className="p-1 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={value ? "Pasif yap" : "Aktif yap"}
            >
              {value ? (
                <EyeOff className="w-3 h-3 text-gray-500 hover:text-amber-600" />
              ) : (
                <Eye className="w-3 h-3 text-gray-500 hover:text-green-600" />
              )}
            </motion.button>
          </div>
        ),
      },
      {
        key: "createdAt",
        title: "Tarih",
        dataIndex: "createdAt",
        hidden: "lg", // Sadece desktop'ta göster
        render: (value: Date | string) => (
          <div className="flex flex-col">
            <span className="font-medium text-black text-xs">
              {new Date(value).toLocaleDateString("tr-TR")}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(value).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  // Actions for table - DataTable interface'ine uygun key eklendi
  const actions = useMemo(
    () => [
      {
        key: "edit",
        label: "Düzenle",
        icon: <Edit className="w-3 h-3" />,
        onClick: (announcement: AnnouncementTableData) =>
          handleEdit(announcement),
        variant: "secondary" as const,
      },
      {
        key: "delete",
        label: "Sil",
        icon: <Trash2 className="w-3 h-3" />,
        onClick: (announcement: AnnouncementTableData) =>
          handleDelete(announcement.id, announcement.title),
        variant: "danger" as const,
      },
    ],
    []
  );

  // Helper functions
  const getTypeIcon = (type: AnnouncementType) => {
    switch (type) {
      case "INFO":
        return <Info className="w-3 h-3 text-blue-600" />;
      case "WARNING":
        return <AlertTriangle className="w-3 h-3 text-amber-600" />;
      case "SUCCESS":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "PROMOTION":
        return <Gift className="w-3 h-3 text-purple-600" />;
      default:
        return <Bell className="w-3 h-3 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const config = {
      INFO: {
        label: "Bilgi",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      WARNING: {
        label: "Uyarı",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      },
      SUCCESS: {
        label: "Başarı",
        className: "bg-green-50 text-green-700 border-green-200",
      },
      PROMOTION: {
        label: "Kampanya",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      },
    };
    const typeConfig = config[type] || {
      label: type,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig.className}`}
      >
        {typeConfig.label}
      </span>
    );
  };

  const getTypeStats = () => {
    if (!announcementsResponse?.announcements) return [];

    const stats = announcementsResponse.announcements.reduce(
      (acc, announcement) => {
        acc[announcement.type] = (acc[announcement.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return [
      {
        type: "INFO",
        label: "Bilgi",
        count: stats.INFO || 0,
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
      },
      {
        type: "SUCCESS",
        label: "Başarı",
        count: stats.SUCCESS || 0,
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      },
      {
        type: "WARNING",
        label: "Uyarı",
        count: stats.WARNING || 0,
        bgColor: "bg-amber-50",
        textColor: "text-amber-800",
        borderColor: "border-amber-200",
      },
      {
        type: "PROMOTION",
        label: "Kampanya",
        count: stats.PROMOTION || 0,
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        borderColor: "border-purple-200",
      },
    ];
  };

  const typeOptions = [
    { value: "INFO", label: "📝 Bilgi" },
    { value: "WARNING", label: "⚠️ Uyarı" },
    { value: "SUCCESS", label: "✅ Başarı" },
    { value: "PROMOTION", label: "🎁 Kampanya" },
  ];

  const announcements = announcementsResponse?.announcements || [];
  const pagination = announcementsResponse?.pagination;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="bg-white rounded-lg p-4 md:p-8 border border-gray-200"
        variants={itemVariants}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-3">
              Duyuru Yönetimi
            </h1>
            <p className="text-gray-600 text-sm md:text-lg mb-4 md:mb-6">
              Site genelindeki duyuruları yönetin ve düzenleyin
            </p>
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium text-sm">
                  {announcements.filter((a) => a.isActive).length} Aktif
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700 font-medium text-sm">
                  {announcements.filter((a) => !a.isActive).length} Pasif
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <span className="text-gray-700 font-medium text-sm">
                  Toplam {pagination?.total || announcements.length}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white border border-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Duyuru
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
        variants={itemVariants}
      >
        {getTypeStats().map((stat) => (
          <div
            key={stat.type}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-3 lg:p-4`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-2 lg:mb-0">
                <p
                  className={`text-xs lg:text-sm font-medium ${stat.textColor}`}
                >
                  {stat.label}
                </p>
                <p
                  className={`text-lg lg:text-2xl font-bold ${stat.textColor}`}
                >
                  {stat.count}
                </p>
              </div>
              <div
                className={`p-1.5 lg:p-2 ${stat.bgColor} rounded-lg border ${stat.borderColor} self-end lg:self-auto`}
              >
                {getTypeIcon(stat.type as AnnouncementType)}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white rounded-lg p-4 lg:p-6 border border-gray-200"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Duyuru ara..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as "" | AnnouncementType,
              }))
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
          >
            <option value="">Tüm Tipler</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.includeInactive}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  includeInactive: e.target.checked,
                }))
              }
              className="w-4 h-4 text-black border-gray-200 rounded focus:ring-black focus:ring-2"
            />
            <span className="text-sm text-gray-700">
              Pasif duyuruları göster
            </span>
          </label>

          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-gray-200 w-full md:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </motion.div>

      {/* Data Table - selectable prop'unu kaldırıyorum */}
      <motion.div variants={itemVariants}>
        <DataTable
          data={announcements.map((announcement) => ({
            ...announcement,
            createdAt: new Date(announcement.createdAt),
            updatedAt: new Date(announcement.updatedAt),
          }))}
          columns={columns}
          actions={actions}
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: pagination?.total || 0,
            onChange: (page: number, pageSize: number) => {
              setFilters((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </motion.div>

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAnnouncement ? "Duyuru Düzenle" : "Yeni Duyuru"}
      >
        <Form
          schema={announcementCreateSchema}
          onSubmit={editingAnnouncement ? handleUpdate : handleCreate}
          defaultValues={
            editingAnnouncement
              ? {
                  title: editingAnnouncement.title,
                  message: editingAnnouncement.message,
                  type: editingAnnouncement.type,
                  priority: editingAnnouncement.priority,
                  actionText: editingAnnouncement.actionText || "",
                  actionLink: editingAnnouncement.actionLink || "",
                  isActive: editingAnnouncement.isActive,
                }
              : undefined
          }
        >
          <div className="space-y-4">
            <TextField
              name="title"
              label="Başlık"
              placeholder="Duyuru başlığını girin"
              required
            />

            <TextareaField
              name="message"
              label="Mesaj"
              placeholder="Duyuru mesajını girin"
              rows={4}
              required
            />

            <SelectField
              name="type"
              label="Tip"
              options={typeOptions}
              required
            />

            <NumberField
              name="priority"
              label="Öncelik (0-100)"
              min={0}
              max={100}
              placeholder="50"
            />

            <TextField
              name="actionText"
              label="Aksiyon Metni (Opsiyonel)"
              placeholder="Daha Fazla Bilgi"
            />

            <TextField
              name="actionLink"
              label="Aksiyon Linki (Opsiyonel)"
              placeholder="https://..."
            />

            <CheckboxField name="isActive" label="Aktif" />

            {/* Submit Button Section */}
            <div className="flex flex-col sm:flex-row justify-end pt-6 border-t space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="w-full sm:w-auto"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={
                  createAnnouncementMutation.isPending ||
                  updateAnnouncementMutation.isPending
                }
                className="w-full sm:w-auto bg-black hover:bg-black/90"
              >
                {createAnnouncementMutation.isPending ||
                updateAnnouncementMutation.isPending ? (
                  <div className="flex items-center">
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
                    {editingAnnouncement
                      ? "Duyuru güncelleniyor..."
                      : "Duyuru oluşturuluyor..."}
                  </div>
                ) : editingAnnouncement ? (
                  "Duyuruyu Güncelle"
                ) : (
                  "Duyuru Oluştur"
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Dialog>

      {/* Delete Confirmation - type prop'unu kaldırıyorum */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            announcementId: "",
            announcementTitle: "",
          })
        }
        onConfirm={confirmDelete}
        title="Duyuru Sil"
        description={`"${deleteConfirm.announcementTitle}" duyurusunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
      />
    </motion.div>
  );
}
