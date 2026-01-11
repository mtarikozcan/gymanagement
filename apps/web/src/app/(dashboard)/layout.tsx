'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    UserCheck,
    BarChart3,
    Settings,
    FileText,
    ChevronDown,
    Bell,
    Search,
    LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, usePermissions } from '@/lib/auth/context';
import { ProtectedRoute } from '@/lib/auth/protected';

const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', feature: 'dashboard' },
    { href: '/members', icon: Users, label: 'Members', feature: 'members' },
    { href: '/payments', icon: CreditCard, label: 'Payments', feature: 'payments' },
    { href: '/classes', icon: Calendar, label: 'Classes', feature: 'classes' },
    { href: '/trainers', icon: UserCheck, label: 'Trainers', feature: 'classes' },
    { href: '/reports', icon: BarChart3, label: 'Reports', feature: 'reports' },
    { href: '/settings', icon: Settings, label: 'Settings', feature: 'settings' },
    { href: '/audit', icon: FileText, label: 'Activity Log', feature: 'settings' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, gym, logout } = useAuth();
    const { canAccess } = usePermissions();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Filter nav items based on permissions
    const visibleNavItems = NAV_ITEMS.filter(item => canAccess(item.feature));

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-surface-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-surface-200 flex flex-col fixed h-full">
                    {/* Logo */}
                    <div className="p-5 border-b border-surface-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">
                                    {gym?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-surface-900 text-sm">{gym?.name || 'PulseGym'}</h1>
                                <p className="text-surface-500 text-xs">{gym?.city || 'Dashboard'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                        {visibleNavItems.map(({ href, icon: Icon, label }) => {
                            const isActive = pathname === href || pathname?.startsWith(href + '/');
                            return (
                                <button
                                    key={href}
                                    onClick={() => router.push(href)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : ''}`} />
                                    {label}
                                </button>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-3 border-t border-surface-200">
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                                    <span className="text-surface-600 text-sm font-medium">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-surface-900">{user?.name || 'User'}</p>
                                    <p className="text-xs text-surface-500">{user?.email}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-surface-400" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-surface-200 rounded-lg shadow-lg py-1">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            router.push('/settings');
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-surface-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 ml-64">
                    {/* Top header */}
                    <header className="bg-white border-b border-surface-200 px-6 py-4 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            {/* Search */}
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input
                                    type="text"
                                    placeholder="Search members, classes..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-50 border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                />
                            </div>

                            {/* Right actions */}
                            <div className="flex items-center gap-3">
                                <button className="relative p-2 rounded-lg hover:bg-surface-50 transition-colors">
                                    <Bell className="w-5 h-5 text-surface-500" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
