"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X, Bell, Gift, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { trpc } from "@/components/providers/trpcProvider";

interface AnnouncementProps {
  id: string;
  type: "info" | "warning" | "success" | "promotion";
  message: string;
  actionText?: string;
  actionLink?: string;
  dismissible?: boolean;
  autoHide?: boolean;
  duration?: number; // in seconds
  priority?: number;
}

interface TopbarProps {
  announcements?: AnnouncementProps[];
  announcement?: AnnouncementProps; // Backward compatibility
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number; // in seconds
  useApi?: boolean; // API'den duyuru çek
}

export default function Topbar({
  announcements,
  announcement, // Single announcement for backward compatibility
  className = "",
  autoRotate = true,
  rotationInterval = 5,
  useApi = true, // Varsayılan olarak API kullan
}: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // TRPC query for announcements
  const {
    data: apiAnnouncements = [],
    isLoading,
    error,
  } = trpc.announcement.getActive.useQuery(
    {
      page: pathname || "/",
      role: (session?.user?.role as any) || "CUSTOMER",
    },
    {
      enabled: useApi, // Only fetch when useApi is true
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  );

  const allAnnouncements = useApi
    ? apiAnnouncements
    : announcements || (announcement ? [announcement] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Filter out dismissed announcements
  const visibleAnnouncements = allAnnouncements.filter(
    (ann) => !dismissedIds.includes(ann.id)
  );

  const currentAnnouncement = visibleAnnouncements[currentIndex];

  // Auto rotation functionality
  useEffect(() => {
    if (autoRotate && visibleAnnouncements.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
      }, rotationInterval * 1000);

      return () => clearInterval(timer);
    }
  }, [autoRotate, rotationInterval, visibleAnnouncements.length]);

  // Auto hide functionality for current announcement
  useEffect(() => {
    if (currentAnnouncement?.autoHide && currentAnnouncement?.duration) {
      const timer = setTimeout(() => {
        handleDismiss(currentAnnouncement.id);
      }, currentAnnouncement.duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [currentAnnouncement]);

  // Load dismissed announcements from localStorage
  useEffect(() => {
    const dismissed = allAnnouncements
      .filter((ann) => {
        if (ann.dismissible) {
          return localStorage.getItem(`announcement-${ann.id}`) === "true";
        }
        return false;
      })
      .map((ann) => ann.id);

    setDismissedIds(dismissed);
  }, [allAnnouncements]);

  // Reset index if current announcement is dismissed
  useEffect(() => {
    if (
      currentIndex >= visibleAnnouncements.length &&
      visibleAnnouncements.length > 0
    ) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visibleAnnouncements.length]);

  const handleDismiss = (id?: string) => {
    const targetId = id || currentAnnouncement?.id;
    if (!targetId) return;

    setIsAnimating(true);

    setTimeout(() => {
      setDismissedIds((prev) => [...prev, targetId]);
      if (currentAnnouncement?.dismissible) {
        localStorage.setItem(`announcement-${targetId}`, "true");
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleNext = () => {
    if (visibleAnnouncements.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length);
    }
  };

  const handlePrevious = () => {
    if (visibleAnnouncements.length > 1) {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length
      );
    }
  };
  const getTypeStyles = (type: string) => {
    switch (type) {
      case "info":
        return {
          bg: "bg-blue-600",
          text: "text-white",
          icon: Info,
          hoverBg: "hover:bg-blue-700",
        };
      case "warning":
        return {
          bg: "bg-amber-500",
          text: "text-white",
          icon: AlertTriangle,
          hoverBg: "hover:bg-amber-600",
        };
      case "success":
        return {
          bg: "bg-green-600",
          text: "text-white",
          icon: CheckCircle,
          hoverBg: "hover:bg-green-700",
        };
      case "promotion":
        return {
          bg: "bg-gradient-to-r from-purple-600 to-pink-600",
          text: "text-white",
          icon: Gift,
          hoverBg: "hover:from-purple-700 hover:to-pink-700",
        };
      default:
        return {
          bg: "bg-gray-800",
          text: "text-white",
          icon: Bell,
          hoverBg: "hover:bg-gray-900",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2">
            <div className="animate-pulse text-sm text-gray-500">
              Duyurular yükleniyor...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visibleAnnouncements.length === 0 || !currentAnnouncement) return null;

  const typeStyles = getTypeStyles(currentAnnouncement.type);
  const Icon = typeStyles.icon;

  return (
    <div
      className={`
        ${typeStyles.bg} ${typeStyles.text} 
        ${isAnimating ? "animate-slide-up" : "animate-slide-down"}
        relative z-50 transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Left side - Icon and Message */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Icon className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium truncate">
              {currentAnnouncement.message}
            </p>
          </div>

          {/* Right side - Navigation, Action and Close */}
          <div className="flex items-center space-x-2 ml-3">
            {/* Multiple announcement indicators */}
            {visibleAnnouncements.length > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePrevious}
                  className="p-0.5 rounded hover:bg-white/20 transition-colors"
                  aria-label="Önceki duyuru"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="flex space-x-1">
                  {visibleAnnouncements.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentIndex ? "bg-white" : "bg-white/40"
                      }`}
                      aria-label={`${index + 1}. duyuruya git`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-0.5 rounded hover:bg-white/20 transition-colors"
                  aria-label="Sonraki duyuru"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            {currentAnnouncement.actionText &&
              currentAnnouncement.actionLink && (
                <Link
                  href={currentAnnouncement.actionLink}
                  className={`
                  inline-flex items-center px-2 py-1 text-xs font-semibold
                  bg-white/20 backdrop-blur-sm rounded-md
                  ${typeStyles.hoverBg} transition-colors duration-200
                  hover:bg-white/30
                `}
                >
                  {currentAnnouncement.actionText}
                </Link>
              )}

            {currentAnnouncement?.dismissible && (
              <button
                onClick={() => handleDismiss()}
                className={`
                  p-0.5 rounded-md transition-colors duration-200
                  hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50
                `}
                aria-label="Duyuruyu kapat"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animated border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
        <div
          className="h-full bg-white/60 transition-all duration-300 ease-out"
          style={{
            width:
              currentAnnouncement.autoHide && currentAnnouncement.duration
                ? "0%"
                : "100%",
            transitionDuration:
              currentAnnouncement.autoHide && currentAnnouncement.duration
                ? `${currentAnnouncement.duration}s`
                : "300ms",
          }}
        />
      </div>
    </div>
  );
}

// Predefined announcement types for easy use
export const promotionAnnouncement: AnnouncementProps = {
  id: "summer-promo",
  type: "promotion",
  message: "🌟 Yaz kampanyası! Düğün fotoğrafçılığında %25 indirim.",
  actionText: "Hemen Rezervasyon",
  actionLink: "/booking",
  dismissible: true,
};

export const infoAnnouncement: AnnouncementProps = {
  id: "new-location",
  type: "info",
  message: "📍 Yeni stüdyomuz Kadıköy'de hizmetinizde!",
  actionText: "Adres",
  actionLink: "/contact",
  dismissible: true,
};

export const warningAnnouncement: AnnouncementProps = {
  id: "holiday-notice",
  type: "warning",
  message: "⚠️ Bayram tatili: 28-30 Ağustos arası kapalıyız.",
  dismissible: true,
};

export const successAnnouncement: AnnouncementProps = {
  id: "award",
  type: "success",
  message: "🏆 2024 En İyi Düğün Fotoğrafçısı ödülüne layık görüldük!",
  actionText: "Portfolyo",
  actionLink: "/portfolio",
  dismissible: true,
};

// Multiple announcements example
export const multipleAnnouncements: AnnouncementProps[] = [
  {
    id: "summer-promo",
    type: "promotion",
    message: "🌟 Yaz kampanyası! Düğün fotoğrafçılığında %25 indirim.",
    actionText: "Rezervasyon",
    actionLink: "/booking",
    dismissible: true,
  },
  {
    id: "new-location",
    type: "info",
    message: "📍 Yeni stüdyomuz Kadıköy'de hizmetinizde!",
    actionText: "Adres",
    actionLink: "/contact",
    dismissible: true,
  },
  {
    id: "award",
    type: "success",
    message: "🏆 2024 En İyi Düğün Fotoğrafçısı ödülüne layık görüldük!",
    actionText: "Portfolyo",
    actionLink: "/portfolio",
    dismissible: true,
  },
  {
    id: "weekend-special",
    type: "promotion",
    message: "🎁 Hafta sonu özel: Engagement çekimlerinde %30 indirim!",
    actionText: "Detaylar",
    actionLink: "/services",
    dismissible: true,
  },
];
