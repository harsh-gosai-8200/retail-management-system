import { createContext, useContext, useState } from "react";
import { MessageSquare } from "lucide-react";

interface PromptContextType {
  prompt: (message: string) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextType | null>(null);

export const usePrompt = () => {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error("usePrompt must be used inside PromptProvider");
  return ctx;
};

export const PromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [resolveFn, setResolveFn] = useState<(value: string | null) => void>();

  const prompt = (msg: string) => {
    setMessage(msg);
    setInputValue("");

    return new Promise<string | null>((resolve) => {
      setResolveFn(() => resolve);
    });
  };

  const handleClose = (result: string | null) => {
    if (resolveFn) resolveFn(result);
    setMessage(null);
  };

  return (
    <PromptContext.Provider value={{ prompt }}>
      {children}

      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* MODAL */}
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn">
            
            {/* ICON */}
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* MESSAGE */}
            <p className="text-center text-sm text-slate-700 mb-4">
              {message}
            </p>

            {/* INPUT */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason..."
              autoFocus
            />

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button
                onClick={() => handleClose(null)}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={() => handleClose(inputValue.trim() || null)}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </PromptContext.Provider>
  );
};