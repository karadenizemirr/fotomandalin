"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// Toast Types
export type ToastType = "success" | "error" | "info" | "warning";

// Toast Interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
}

// Context Interface
interface ToastContextProps {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

// Create Context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Toast Provider Props
interface ToastProviderProps {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

// Generate unique ID
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Toast Provider Component
export const ToastProvider = ({ 
  children, 
  position = "top-right" 
}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = generateId();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Position classes
  const positionClasses = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {isMounted &&
        createPortal(
          <div 
            className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]} pointer-events-none`}
            style={{
              margin: '1rem',
              maxWidth: position.includes('center') ? '400px' : '420px',
              width: position.includes('center') ? 'auto' : 'calc(100vw - 2rem)',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

// Toast Item Component
const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  // Icon based on toast type
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  };

  // Background color based on toast type
  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-amber-50 border-amber-200",
  };

  // Title color based on toast type
  const titleColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
    warning: "text-amber-800",
  };

  // Message color based on toast type
  const messageColors = {
    success: "text-green-700",
    error: "text-red-700",
    info: "text-blue-700",
    warning: "text-amber-700",
  };

  // Animation classes
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div
      className={`w-full min-w-0 max-w-full overflow-hidden rounded-lg border ${bgColors[toast.type]} shadow-lg transition-all duration-300 transform pointer-events-auto ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"
      }`}
      role="alert"
      style={{
        minWidth: '320px',
        maxWidth: '420px',
      }}
    >
      <div className="flex p-4">
        <div className="flex-shrink-0">{icons[toast.type]}</div>
        <div className="ml-3 flex-1 min-w-0">
          {toast.title && (
            <p className={`text-sm font-medium ${titleColors[toast.type]} truncate`}>{toast.title}</p>
          )}
          <p className={`${toast.title ? 'mt-1' : ''} text-sm ${messageColors[toast.type]} break-words`}>{toast.message}</p>
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={onClose}
          >
            <span className="sr-only">Kapat</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className={`h-1 bg-gradient-to-r ${
        toast.type === 'success' ? 'from-green-200 via-green-400 to-green-200' :
        toast.type === 'error' ? 'from-red-200 via-red-400 to-red-200' :
        toast.type === 'warning' ? 'from-amber-200 via-amber-400 to-amber-200' :
        'from-blue-200 via-blue-400 to-blue-200'
      } opacity-60`} />
    </div>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast component for direct usage
export const Toast = {
  success: (message: string, options?: { title?: string; duration?: number }) => {
    const { addToast } = useToast();
    addToast({ message, type: "success", ...options });
  },
  error: (message: string, options?: { title?: string; duration?: number }) => {
    const { addToast } = useToast();
    addToast({ message, type: "error", ...options });
  },
  info: (message: string, options?: { title?: string; duration?: number }) => {
    const { addToast } = useToast();
    addToast({ message, type: "info", ...options });
  },
  warning: (message: string, options?: { title?: string; duration?: number }) => {
    const { addToast } = useToast();
    addToast({ message, type: "warning", ...options });
  },
};

export default Toast;