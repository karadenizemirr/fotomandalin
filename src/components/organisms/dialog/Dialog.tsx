"use client";

import { ReactNode, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
export type DialogType = "default" | "success" | "warning" | "error" | "info";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  size?: DialogSize;
  type?: DialogType;
  showCloseButton?: boolean;
  closable?: boolean;
  backdrop?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: ReactNode;
  icon?: ReactNode;
  preventCloseOnBackdrop?: boolean;
}

// Size mappings following UI/UX guidelines
const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

// Type icons and colors following the color palette
const typeConfig: Record<DialogType, { icon: ReactNode; colorClass: string }> =
  {
    default: {
      icon: <Info className="w-6 h-6" />,
      colorClass: "text-black",
    },
    success: {
      icon: <CheckCircle className="w-6 h-6" />,
      colorClass: "text-green-600",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6" />,
      colorClass: "text-orange-400",
    },
    error: {
      icon: <AlertCircle className="w-6 h-6" />,
      colorClass: "text-red-600",
    },
    info: {
      icon: <Info className="w-6 h-6" />,
      colorClass: "text-blue-600",
    },
  };

/**
 * Dialog Component - Sistem genelinde kullanılabilir modal dialog
 *
 * @example
 * ```tsx
 * <Dialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Kullanıcı Sil"
 *   description="Bu işlem geri alınamaz"
 *   type="warning"
 *   size="md"
 *   footer={
 *     <div className="flex justify-end space-x-3">
 *       <button onClick={() => setIsOpen(false)}>İptal</button>
 *       <button onClick={handleDelete}>Sil</button>
 *     </div>
 *   }
 * />
 * ```
 */
export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  type = "default",
  showCloseButton = true,
  closable = true,
  backdrop = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  footer,
  icon,
  preventCloseOnBackdrop = false,
}: DialogProps) {
  // Escape key handling
  useEffect(() => {
    if (!isOpen || !closable) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closable, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (closable && !preventCloseOnBackdrop) {
      onClose();
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const typeIconConfig = typeConfig[type];
  const displayIcon = icon || typeIconConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed inset-0 bg-black/10 bg-opacity-50 transition-opacity duration-200"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Dialog */}
      <div
        className={`
          relative bg-white rounded-lg border border-gray-200 w-full
          max-h-[90vh] overflow-y-auto
          ${sizeClasses[size]}
          transform transition-all duration-200 ease-out
          ${className}
        `}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`
              flex items-center justify-between p-6 border-b border-gray-200
              ${headerClassName}
            `}
          >
            <div className="flex items-center space-x-3">
              {/* Icon */}
              {displayIcon && (
                <div className={typeIconConfig.colorClass}>{displayIcon}</div>
              )}

              {/* Title */}
              {title && (
                <h2
                  id="dialog-title"
                  className="text-lg font-semibold text-black"
                >
                  {title}
                </h2>
              )}
            </div>

            {/* Close Button */}
            {showCloseButton && closable && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label="Kapat"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`p-6 ${bodyClassName}`}>
          {/* Description */}
          {description && (
            <p
              id="dialog-description"
              className="text-black mb-4 leading-relaxed"
            >
              {description}
            </p>
          )}

          {/* Children Content */}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`
              px-6 py-4 border-t border-gray-200 bg-gray-50
              ${footerClassName}
            `}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Predefined Dialog Variants for common use cases
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Onay",
  description = "Bu işlemi yapmak istediğinizden emin misiniz?",
  confirmText = "Onayla",
  cancelText = "İptal",
  type = "warning",
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  loading?: boolean;
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type={type}
      size="sm"
      preventCloseOnBackdrop={loading}
      closable={!loading}
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200
              ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : type === "warning"
                  ? "bg-orange-400 hover:bg-orange-500"
                  : "bg-orange-400 hover:bg-orange-500"
              }
            `}
          >
            {loading ? "İşleniyor..." : confirmText}
          </button>
        </div>
      }
    />
  );
}

export function AlertDialog({
  isOpen,
  onClose,
  title = "Bilgi",
  description,
  type = "info",
  buttonText = "Tamam",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description: string;
  type?: DialogType;
  buttonText?: string;
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      type={type}
      size="sm"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-colors duration-200"
          >
            {buttonText}
          </button>
        </div>
      }
    />
  );
}

export function FormDialog({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Kaydet",
  cancelText = "İptal",
  loading = false,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: DialogSize;
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      preventCloseOnBackdrop={loading}
      closable={!loading}
      footer={
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-black bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? "Kaydediliyor..." : submitText}
          </button>
        </div>
      }
    >
      {children}
    </Dialog>
  );
}
