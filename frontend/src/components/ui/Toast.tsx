import { useState, useEffect, FC, ReactNode } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

// Define toast types
type ToastType = "success" | "error" | "warning" | "info";

// Toast item interface
interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

// Declare global window interface extension
declare global {
  interface Window {
    toast: {
      success: (message: string, duration?: number) => void;
      error: (message: string, duration?: number) => void;
      warning: (message: string, duration?: number) => void;
      info: (message: string, duration?: number) => void;
    };
  }
}

// Individual Toast Component
interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const Toast: FC<ToastProps> = ({ type, message, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = (): void => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  // Get icon based on toast type
  const getIcon = (): ReactNode => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Get background color based on type
  const getBgColor = (): string => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div 
      className={`flex items-center justify-between w-full max-w-md px-4 py-3 mb-3 border rounded-lg shadow-sm transition-all duration-300 ${getBgColor()} ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100'}`}
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={handleClose} 
        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};

// Main Toast Container Component
export const ToastContainer: FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Add toast to the stack
  const addToast = (type: ToastType, message: string, duration: number = 5000): void => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, type, message, duration }]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };
  
  // Remove toast by id
  const removeToast = (id: string): void => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Expose methods to window for global access
  useEffect(() => {
    window.toast = {
      success: (message: string, duration?: number) => addToast("success", message, duration),
      error: (message: string, duration?: number) => addToast("error", message, duration),
      warning: (message: string, duration?: number) => addToast("warning", message, duration),
      info: (message: string, duration?: number) => addToast("info", message, duration)
    };
    
    return () => {
      window.toast = undefined as any;
    };
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};







const ToastDemo = () => {
    const showSuccessToast = () => {
      window.toast.success("Operation completed successfully!");
    };
    
    const showErrorToast = () => {
      window.toast.error("An error occurred. Please try again.");
    };
    
    const showWarningToast = () => {
      window.toast.warning("Please review your information before continuing.");
    };
    
    const showInfoToast = () => {
      window.toast.info("Here's some information you might find useful.");
    };
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Toast Notification Demo</h1>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={showSuccessToast}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Show Success Toast
          </button>
          <button 
            onClick={showErrorToast}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Show Error Toast
          </button>
          <button 
            onClick={showWarningToast}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Show Warning Toast
          </button>
          <button 
            onClick={showInfoToast}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Show Info Toast
          </button>
        </div>
        <ToastContainer />
      </div>
    );
  };