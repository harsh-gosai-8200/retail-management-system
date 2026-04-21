import { createContext, useContext, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<any>(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: any) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const icons = {
    success: <CheckCircle className="text-green-600" />,
    error: <XCircle className="text-red-600" />,
    info: <Info className="text-blue-600" />,
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-5 right-5 space-y-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-white border shadow-lg px-4 py-3 rounded-xl min-w-[250px] animate-fadeIn"
          >
            {icons[toast.type]}
            <p className="text-sm text-slate-700">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};