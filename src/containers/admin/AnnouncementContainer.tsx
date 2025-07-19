"use client";

import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Gift,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/button";

export default function AnnouncementContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // TRPC queries
  const {
    data: announcementsData,
    isLoading,
    refetch,
  } = trpc.announcement.getAll.useQuery({
    page: 1,
    limit: 20,
    search: searchTerm || undefined,
    type: (selectedType as any) || undefined,
    isActive:
      selectedStatus === "active"
        ? true
        : selectedStatus === "inactive"
        ? false
        : undefined,
  });

  // TRPC mutations
  const toggleActiveMutation = trpc.announcement.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.announcement.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updatePriorityMutation = trpc.announcement.updatePriority.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INFO":
        return <Info className="w-4 h-4 text-blue-600" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "PROMOTION":
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const config = {
      INFO: { label: "Bilgi", className: "bg-blue-100 text-blue-800" },
      WARNING: { label: "Uyarı", className: "bg-amber-100 text-amber-800" },
      SUCCESS: { label: "Başarı", className: "bg-green-100 text-green-800" },
      PROMOTION: {
        label: "Kampanya",
        className: "bg-purple-100 text-purple-800",
      },
    };
    const typeConfig = config[type as keyof typeof config] || {
      label: type,
      className: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.className}`}
      >
        {typeConfig.label}
      </span>
    );
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePriorityChange = (
    id: string,
    currentPriority: number,
    direction: "up" | "down"
  ) => {
    const newPriority =
      direction === "up"
        ? currentPriority + 10
        : Math.max(0, currentPriority - 10);
    updatePriorityMutation.mutate({ id, priority: newPriority });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duyuru Yönetimi</h1>
          <p className="text-gray-600">Topbar duyurularını yönetin</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Duyuru
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <input
              type="text"
              placeholder="Başlık veya mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tüm Tipler</option>
              <option value="INFO">Bilgi</option>
              <option value="WARNING">Uyarı</option>
              <option value="SUCCESS">Başarı</option>
              <option value="PROMOTION">Kampanya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duyuru
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öncelik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcementsData?.announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(announcement.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {announcement.title}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {announcement.message}
                        </p>
                        {announcement.actionText && (
                          <p className="text-xs text-amber-600 mt-1">
                            Action: {announcement.actionText} →{" "}
                            {announcement.actionLink}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(announcement.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900">
                        {announcement.priority}
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            handlePriorityChange(
                              announcement.id,
                              announcement.priority,
                              "up"
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={updatePriorityMutation.isPending}
                        >
                          <ArrowUp className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={() =>
                            handlePriorityChange(
                              announcement.id,
                              announcement.priority,
                              "down"
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          disabled={updatePriorityMutation.isPending}
                        >
                          <ArrowDown className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {announcement.isActive ? "Aktif" : "Pasif"}
                      </span>
                      <button
                        onClick={() =>
                          handleToggleActive(
                            announcement.id,
                            announcement.isActive
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                        disabled={toggleActiveMutation.isPending}
                      >
                        {announcement.isActive ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(announcement.createdAt).toLocaleDateString(
                      "tr-TR"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-amber-600 hover:text-amber-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {announcementsData?.announcements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Duyuru bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Filtreleri değiştirmeyi deneyin veya yeni bir duyuru oluşturun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
