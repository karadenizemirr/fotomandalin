// Sidebar bileşeni ve yardımcı fonksiyonlar

export { default as AdminSidebar } from './Sidebar';

// Sidebar item türleri
export interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

// Sidebar hook'u
export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  
  const toggle = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return {
    collapsed,
    toggle,
    setCollapsed,
  };
}

import { useState, useCallback } from 'react';
