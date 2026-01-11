'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

function ToastContainer() {
    const context = useContext(ToastContext);
    if (!context) return null;

    const { toasts, removeToast } = context;

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-up ${bgColors[t.type]}`}
                >
                    {icons[t.type]}
                    <span className="text-sm text-surface-900">{t.message}</span>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="ml-2 text-surface-400 hover:text-surface-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Singleton toast for use outside of React components (in API client)
let toastHandler: ((type: ToastType, message: string) => void) | null = null;

export function setToastHandler(handler: (type: ToastType, message: string) => void) {
    toastHandler = handler;
}

export const toast = {
    success: (message: string) => toastHandler?.('success', message),
    error: (message: string) => toastHandler?.('error', message),
    warning: (message: string) => toastHandler?.('warning', message),
    info: (message: string) => toastHandler?.('info', message),
};
