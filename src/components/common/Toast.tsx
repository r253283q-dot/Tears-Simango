import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded shadow-lg text-sm text-slate-800 transition-all duration-200">
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-sky-600 shrink-0" />}
      <span className="font-medium">{toast.text}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
