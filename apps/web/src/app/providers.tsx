'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider, useToast, setToastHandler } from '@/components/ui/toast';

function ToastInitializer() {
    const { addToast } = useToast();

    useEffect(() => {
        setToastHandler(addToast);
    }, [addToast]);

    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <ToastProvider>
                <ToastInitializer />
                {children}
            </ToastProvider>
        </AuthProvider>
    );
}
