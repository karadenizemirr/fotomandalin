import { useState } from "react";
import { trpc } from "@/components/providers/trpcProvider";
import { AnnouncementType } from "@/types/announcement";

export function useAnnouncementManagement() {
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
    type: (selectedType as AnnouncementType) || undefined,
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
    onError: (error) => {
      console.error("Toggle active error:", error);
    },
  });

  const deleteMutation = trpc.announcement.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const updatePriorityMutation = trpc.announcement.updatePriority.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Update priority error:", error);
    },
  });

  const createMutation = trpc.announcement.create.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

  const updateMutation = trpc.announcement.update.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

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

  const handleCreate = async (data: {
    title: string;
    message: string;
    type: AnnouncementType;
    priority: number;
    actionText?: string;
    actionLink?: string;
    isActive: boolean;
  }) => {
    return createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: string, data: {
    title: string;
    message: string;
    type: AnnouncementType;
    priority: number;
    actionText?: string;
    actionLink?: string;
    isActive: boolean;
  }) => {
    return updateMutation.mutateAsync({ id, ...data });
  };

  return {
    // State
    searchTerm,
    selectedType,
    selectedStatus,

    // Data
    announcements: announcementsData?.announcements || [],
    isLoading,

    // Actions
    setSearchTerm,
    setSelectedType,
    setSelectedStatus,
    handleToggleActive,
    handleDelete,
    handlePriorityChange,
    handleCreate,
    handleUpdate,

    // Mutation states
    isToggling: toggleActiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPriorityUpdating: updatePriorityMutation.isPending,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
