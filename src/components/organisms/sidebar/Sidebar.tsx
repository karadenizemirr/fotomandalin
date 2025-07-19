"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Camera,
  Package,
  FileImage,
  Settings,
  BarChart3,
  MessageSquare,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  UserCog,
  Shield,
  TrendingUp,
  Zap,
  Plus,
  FolderPlus,
  MapPin,
  UserCheck,
} from "lucide-react";

interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: SidebarItem[];
  description?: string;
  isNew?: boolean;
  isPro?: boolean;
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

export default function AdminSidebar({
  collapsed = false,
  onToggle,
  className = "",
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Mock data for badges (replace with tRPC hooks when endpoints are ready)
  const reservationsCount = 8;
  const pendingReservations = 3;
  const newMessages = 5;

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  const sidebarItems: SidebarItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
      description: "Genel bakış ve istatistikler",
    },
    {
      key: "reservations",
      label: "Rezervasyonlar",
      icon: <Calendar className="w-5 h-5" />,
      href: "/calendar",
      badge: reservationsCount,
      description: "Aktif rezervasyonlar",
      isNew: true,
    },
    {
      key: "locations",
      label: "Lokasyonlar",
      icon: <MapPin className="w-5 h-5" />,
      href: "/location",
      description: "Çekim lokasyonları",
    },
    {
      key: "staff",
      label: "Personel",
      icon: <UserCheck className="w-5 h-5" />,
      href: "/staff",
      description: "Personel yönetimi",
    },
    {
      key: "customers",
      label: "Müşteriler",
      icon: <Users className="w-5 h-5" />,
      href: "/admin/musteriler",
      badge: newMessages > 0 ? newMessages : undefined,
      description: "Müşteri veritabanı",
    },
    {
      key: "messages",
      label: "İletişim Mesajları",
      icon: <MessageSquare className="w-5 h-5" />,
      href: "/messages",
      description: "İletişim formu mesajları",
    },
    {
      key: "packages",
      label: "Paket Yönetimi",
      icon: <Package className="w-5 h-5" />,
      href: "/packages",
      description: "Hizmet paketleri",
      children: [
        {
          key: "packagesManagement",
          label: "Paket İşlemleri",
          icon: <Package className="w-4 h-4" />,
          href: "/packages",
          description: "Paket listesi ve düzenleme",
        },
        {
          key: "addOnServices",
          label: "Ek Hizmet İşlemleri",
          icon: <Plus className="w-4 h-4" />,
          href: "/packages/addOns",
          description: "Ek hizmet yönetimi",
        },
        {
          key: "categoryManagement",
          label: "Kategori İşlemleri",
          icon: <FolderPlus className="w-4 h-4" />,
          href: "/packages/category",
          description: "Kategori yönetimi",
        },
        {
          key: "announcements",
          label: "Kampanya Duyuruları",
          icon: <Bell className="w-4 h-4" />,
          href: "/packages/announcements",
          description: "Duyuru yönetimi",
        },
      ],
    },
    {
      key: "gallery",
      label: "Galeri",
      icon: <Camera className="w-5 h-5" />,
      href: "/gallery",
      description: "Fotoğraf koleksiyonu",
    },
    {
      key: "analytics",
      label: "Analitik",
      icon: <TrendingUp className="w-5 h-5" />,
      href: "/analytics",
      description: "Performans metrikleri",
      isPro: true,
      children: [
        {
          key: "reports",
          label: "Raporlar",
          icon: <BarChart3 className="w-4 h-4" />,
          href: "/analytics/reports",
          description: "Detaylı raporlar",
        },
        {
          key: "insights",
          label: "İçgörüler",
          icon: <Zap className="w-4 h-4" />,
          href: "/analytics/insights",
          description: "AI destekli analiz",
          isPro: true,
        },
      ],
    },
    {
      key: "finance",
      label: "Finansal",
      icon: <CreditCard className="w-5 h-5" />,
      href: "/finance",
      description: "Gelir ve giderler",
      children: [
        {
          key: "payments",
          label: "Ödemeler",
          icon: <CreditCard className="w-4 h-4" />,
          href: "/finance/payments",
          badge: pendingReservations > 0 ? pendingReservations : undefined,
          description: "Ödeme takibi",
        },
        {
          key: "invoices",
          label: "Faturalar",
          icon: <FileImage className="w-4 h-4" />,
          href: "/finance/invoices",
          description: "Fatura yönetimi",
        },
      ],
    },
    {
      key: "system",
      label: "Sistem",
      icon: <Settings className="w-5 h-5" />,
      href: "/settings",
      description: "Sistem ayarları",
      children: [
        {
          key: "users",
          label: "Kullanıcılar",
          icon: <UserCog className="w-4 h-4" />,
          href: "/settings/users",
          description: "Kullanıcı yönetimi",
        },
        {
          key: "settings",
          label: "Ayarlar",
          icon: <Settings className="w-4 h-4" />,
          href: "/settings",
          description: "Genel ayarlar",
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (item: SidebarItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.href));
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isGroupOpen = openGroups.includes(item.key);
    const hasActiveChildren = hasActiveChild(item);

    if (hasChildren) {
      return (
        <div key={item.key} className="mb-1">
          <button
            onClick={() => toggleGroup(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
              hasActiveChildren
                ? "bg-orange-900/30 text-orange-400 shadow-sm border-l-4 border-orange-400"
                : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-sm"
            }`}
          >
            <div className="flex items-center flex-1">
              <div
                className={`transition-colors duration-200 ${
                  hasActiveChildren
                    ? "text-orange-400"
                    : "text-gray-400 group-hover:text-gray-200"
                }`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex-1 ml-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      {item.isPro && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400">
                          PRO
                        </span>
                      )}
                      {item.isNew && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                          YENİ
                        </span>
                      )}
                      {item.badge && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ml-2 ${
                  isGroupOpen ? "rotate-180" : ""
                } ${hasActiveChildren ? "text-orange-500" : "text-gray-400"}`}
              />
            )}
          </button>

          {!isCollapsed && isGroupOpen && (
            <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
              {item.children?.map((child) =>
                renderSidebarItem(child, level + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.key} className="mb-1">
        <Link
          href={item.href}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
            active
              ? "bg-orange-900/30 text-orange-400 shadow-sm border-l-4 border-orange-400"
              : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-sm"
          } ${level > 0 ? "text-xs py-2" : ""}`}
        >
          <div
            className={`transition-colors duration-200 ${
              active
                ? "text-orange-400"
                : "text-gray-400 group-hover:text-gray-200"
            }`}
          >
            {item.icon}
          </div>
          {!isCollapsed && (
            <div className="flex-1 ml-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-2">
                  {item.isPro && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-400">
                      PRO
                    </span>
                  )}
                  {item.isNew && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                      YENİ
                    </span>
                  )}
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              {item.description && level === 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          )}
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`bg-black border-r border-gray-800 flex flex-col transition-all duration-300 shadow-sm ${
        isCollapsed ? "w-20" : "w-72"
      } ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-black">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                <p className="text-sm text-gray-400 font-medium">
                  Fotomandalin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleToggle}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all duration-200 hover:shadow-sm"
            title={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {/* Ana Site Link */}
          <div className="mb-6">
            <Link
              href="/"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 rounded-xl transition-all duration-200 group hover:shadow-sm"
            >
              <Home className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
              {!isCollapsed && (
                <div className="ml-3">
                  <span className="font-medium">Ana Siteye Dön</span>
                  <p className="text-xs text-gray-500 group-hover:text-blue-500">
                    Ziyaretçi görünümü
                  </p>
                </div>
              )}
            </Link>
          </div>

          {/* Ana Menü */}
          <div className="space-y-1">
            {sidebarItems.map((item) => renderSidebarItem(item))}
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Hızlı İşlemler
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/rezervasyonlar/yeni"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-green-900/30 hover:text-green-400 rounded-lg transition-all duration-200 group"
                >
                  <Calendar className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                  <span className="ml-3">Yeni Rezervasyon</span>
                </Link>
                <Link
                  href="/admin/musteriler/yeni"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 rounded-lg transition-all duration-200 group"
                >
                  <Users className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                  <span className="ml-3">Yeni Müşteri</span>
                </Link>
                <Link
                  href="/admin/notifications"
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-orange-900/30 hover:text-orange-400 rounded-lg transition-all duration-200 group relative"
                >
                  <Bell className="w-4 h-4 text-gray-400 group-hover:text-orange-400" />
                  <span className="ml-3">Bildirimler</span>
                  {newMessages > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                      {newMessages}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer - User Info */}
      <div className="border-t border-gray-800 p-4 bg-gradient-to-r from-gray-900 to-black">
        {session && (
          <div className="space-y-4">
            {/* User Info */}
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "space-x-3"
              }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                <UserCog className="w-5 h-5 text-gray-300" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {session.user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`flex ${
                isCollapsed ? "flex-col space-y-2" : "justify-between"
              }`}
            >
              <div
                className={`flex ${
                  isCollapsed ? "flex-col space-y-2" : "space-x-2"
                }`}
              >
                <button
                  className={`flex items-center justify-center p-2.5 text-gray-400 hover:text-orange-400 hover:bg-orange-900/30 rounded-xl transition-all duration-200 hover:shadow-sm ${
                    isCollapsed ? "w-full" : ""
                  }`}
                  title="Bildirimler"
                >
                  <Bell className="w-4 h-4" />
                  {!isCollapsed && (
                    <span className="ml-2 text-xs font-medium">
                      Bildirimler
                    </span>
                  )}
                </button>

                <button
                  className={`flex items-center justify-center p-2.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-xl transition-all duration-200 hover:shadow-sm ${
                    isCollapsed ? "w-full" : ""
                  }`}
                  title="Yardım"
                >
                  <HelpCircle className="w-4 h-4" />
                  {!isCollapsed && (
                    <span className="ml-2 text-xs font-medium">Yardım</span>
                  )}
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className={`flex items-center justify-center p-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:shadow-sm ${
                  isCollapsed ? "w-full" : ""
                }`}
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                {!isCollapsed && (
                  <span className="ml-2 text-xs font-medium">Çıkış</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
