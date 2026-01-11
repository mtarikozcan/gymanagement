'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './context';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Still loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-surface-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Check role if required
    if (requiredRole) {
        const ROLE_HIERARCHY = ['owner', 'admin', 'manager', 'staff', 'trainer', 'viewer'];
        const userIndex = role ? ROLE_HIERARCHY.indexOf(role) : -1;
        const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);

        if (userIndex === -1 || requiredIndex === -1 || userIndex > requiredIndex) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-surface-50">
                    <div className="card p-8 text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-surface-900 mb-2">Access Denied</h2>
                        <p className="text-surface-500 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
