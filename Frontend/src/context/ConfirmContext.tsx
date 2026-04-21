import { createContext, useContext, useState } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

type ConfirmType = "warning" | "danger" | "info";

interface ConfirmOptions {
  message: string;
  type?: ConfirmType;
}

interface ConfirmContextType {
  confirm: (message: string, type?: ConfirmType) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
};

export const ConfirmProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveFn, setResolveFn] = useState<(value: boolean) => void>();

  const confirm = (message: string, type: ConfirmType = "warning") => {
    return new Promise<boolean>((resolve) => {
      setOptions({ message, type });
      setResolveFn(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    if (resolveFn) resolveFn(result);
    setOptions(null);
  };

  const styles = {
    warning: {
      bg: "bg-yellow-100",
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
    danger: {
      bg: "bg-red-100",
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      button: "bg-red-600 hover:bg-red-700",
    },
    info: {
      bg: "bg-blue-100",
      icon: <Info className="h-6 w-6 text-blue-600" />,
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const current = styles[options?.type || "warning"];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* MODAL */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn">
            
            {/* ICON */}
            <div className="flex items-center justify-center mb-4">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${current.bg}`}>
                {current.icon}
              </div>
            </div>

            {/* MESSAGE */}
            <p className="text-center text-sm text-slate-700 mb-6 leading-relaxed">
              {options.message}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleClose(true)}
                className={`flex-1 px-4 py-2 text-sm rounded-lg text-white ${current.button}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};