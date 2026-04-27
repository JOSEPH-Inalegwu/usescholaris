import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface ToastContextValue {
  toast: (message: string, type?: 'error' | 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'error' | 'success' | 'info'>('info');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const toast = useCallback((msg: string, t: 'error' | 'success' | 'info' = 'info') => {
    clearTimeout(timerRef.current);
    setType(t);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {message && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full pointer-events-none flex justify-center"
        >
          <div
            className={`px-6 py-4 rounded-2xl shadow-xl text-white text-sm font-bold flex items-center gap-3 pointer-events-auto border border-white/10 backdrop-blur-xl ${
              type === 'error' ? 'bg-[#b32839]' : type === 'success' ? 'bg-[#2d3435]' : 'bg-[#2d3435]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info'}
            </span>
            <p className="flex-1">{message}</p>
            <button
              onClick={() => setMessage(null)}
              className="opacity-60 hover:opacity-100 transition-opacity text-base leading-none"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}