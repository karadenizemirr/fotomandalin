export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: number;
  isActive: boolean;
  actionText?: string | null;
  actionLink?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnouncementType = "INFO" | "WARNING" | "SUCCESS" | "PROMOTION";

export interface AnnouncementFilters {
  search?: string;
  type?: AnnouncementType;
  isActive?: boolean;
}

export interface AnnouncementTableProps {
  announcements: Announcement[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, currentPriority: number, direction: "up" | "down") => void;
  isLoading?: boolean;
}

export interface AnnouncementFiltersProps {
  searchTerm: string;
  selectedType: string;
  selectedStatus: string;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}
