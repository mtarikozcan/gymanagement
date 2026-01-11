'use client';

import { useRouter } from 'next/navigation';
import {
    Building2,
    CreditCard,
    Users,
    Bell,
    Shield,
    Database,
    ChevronRight,
    Zap
} from 'lucide-react';
import { useAuth, usePermissions } from '@/lib/auth/context';

const SETTINGS_SECTIONS = [
    {
        id: 'gym',
        title: 'Gym Profile',
        description: 'Update your gym name, logo, and contact info',
        icon: Building2,
        href: '/settings/gym',
        feature: 'settings',
    },
    {
        id: 'plans',
        title: 'Membership Plans',
        description: 'Manage pricing and plan options',
        icon: CreditCard,
        href: '/settings/plans',
        feature: 'settings',
    },
    {
        id: 'team',
        title: 'Team & Roles',
        description: 'Invite staff and manage permissions',
        icon: Users,
        href: '/settings/team',
        feature: 'roles',
    },
    {
        id: 'notifications',
        title: 'Notifications',
        description: 'Configure email and SMS alerts',
        icon: Bell,
        href: '/settings/notifications',
        feature: 'settings',
    },
    {
        id: 'security',
        title: 'Security',
        description: 'Password, 2FA, and session settings',
        icon: Shield,
        href: '/settings/security',
        feature: 'settings',
    },
    {
        id: 'data',
        title: 'Data & Export',
        description: 'Export data and manage backups',
        icon: Database,
        href: '/settings/data',
        feature: 'settings',
    },
];

export default function SettingsPage() {
    const router = useRouter();
    const { gym, role } = useAuth();
    const { canAccess } = usePermissions();

    const visibleSections = SETTINGS_SECTIONS.filter(section => canAccess(section.feature));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
                <p className="text-surface-500 mt-1">Manage your gym configuration</p>
            </div>

            {/* Demo Mode Banner */}
            <div className="card p-4 bg-brand-50 border-brand-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-brand-900">Demo Mode Active</p>
                        <p className="text-brand-700 text-sm">
                            You're viewing {gym?.name || 'PulseGym'} with demo data. Changes are saved but can be reset.
                        </p>
                    </div>
                    <button className="btn-secondary text-sm">
                        Reset Demo
                    </button>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {visibleSections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => router.push(section.href)}
                        className="card p-5 text-left hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
                                <section.icon className="w-5 h-5 text-surface-600 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-surface-900">{section.title}</h3>
                                    <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                                </div>
                                <p className="text-surface-500 text-sm mt-1">{section.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Account Info */}
            <div className="card p-5">
                <h2 className="font-semibold text-surface-900 mb-4">Account Info</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-surface-500">Gym</p>
                        <p className="text-surface-900 font-medium">{gym?.name || 'PulseGym'}</p>
                    </div>
                    <div>
                        <p className="text-surface-500">Your Role</p>
                        <p className="text-surface-900 font-medium capitalize">{role || 'Owner'}</p>
                    </div>
                    <div>
                        <p className="text-surface-500">Plan</p>
                        <p className="text-surface-900 font-medium">Pro (Demo)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
