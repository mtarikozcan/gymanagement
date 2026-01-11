'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setCurrentGymId } from '@/lib/api/client';

interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
}

interface Gym {
    id: string;
    name: string;
    city: string;
}

interface AuthContextType {
    user: User | null;
    gym: Gym | null;
    role: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [gym, setGym] = useState<Gym | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = useCallback(async () => {
        try {
            const data = await authApi.me();
            if (data?.user) {
                setUser(data.user);
                setGym(data.gym);
                setRole(data.user.role);
                // Set gymId for gym-scoped API calls
                if (data.gym?.id) {
                    setCurrentGymId(data.gym.id);
                }
            } else {
                setUser(null);
                setGym(null);
                setRole(null);
                setCurrentGymId(null);
            }
        } catch {
            setUser(null);
            setGym(null);
            setRole(null);
            setCurrentGymId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email: string, password: string) => {
        const data = await authApi.login(email, password);
        setUser(data.user);
        setGym(data.gym);
        setRole(data.user.role);
        // Set gymId for gym-scoped API calls
        if (data.gym?.id) {
            setCurrentGymId(data.gym.id);
        }
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        }
        setUser(null);
        setGym(null);
        setRole(null);
        setCurrentGymId(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                gym,
                role,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                checkSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Permission checking helpers
export function usePermissions() {
    const { role } = useAuth();

    const ROLE_HIERARCHY = ['owner', 'admin', 'manager', 'staff', 'trainer', 'viewer'];

    const isRoleAtLeast = (minimumRole: string): boolean => {
        if (!role) return false;
        const userIndex = ROLE_HIERARCHY.indexOf(role);
        const requiredIndex = ROLE_HIERARCHY.indexOf(minimumRole);
        return userIndex !== -1 && requiredIndex !== -1 && userIndex <= requiredIndex;
    };

    const canAccess = (feature: string): boolean => {
        switch (feature) {
            case 'settings':
            case 'roles':
                return isRoleAtLeast('admin');
            case 'reports':
                return isRoleAtLeast('manager');
            case 'payments':
            case 'members':
            case 'memberships':
                return isRoleAtLeast('staff');
            case 'classes':
            case 'attendance':
                return isRoleAtLeast('trainer');
            default:
                return isRoleAtLeast('viewer');
        }
    };

    const hasPermission = (permission: string): boolean => {
        switch (permission) {
            case 'member.create':
            case 'member.update':
            case 'membership.renew':
            case 'membership.freeze':
                return isRoleAtLeast('staff');
            case 'payment.collect':
                return isRoleAtLeast('staff');
            case 'payment.void':
                return isRoleAtLeast('manager');
            case 'settings.manage':
            case 'role.manage':
                return isRoleAtLeast('admin');
            default:
                return isRoleAtLeast('viewer');
        }
    };

    return { isRoleAtLeast, canAccess, hasPermission };
}
