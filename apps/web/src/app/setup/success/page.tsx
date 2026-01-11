'use client';

import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    ArrowRight,
    Users,
    CreditCard,
    Calendar,
    UserCheck,
    BarChart3,
    Settings,
    Shield
} from 'lucide-react';

const FEATURES = [
    { icon: Users, label: 'Members' },
    { icon: CreditCard, label: 'Payments' },
    { icon: UserCheck, label: 'Trainers' },
    { icon: Calendar, label: 'Classes' },
    { icon: BarChart3, label: 'Reports' },
    { icon: Settings, label: 'Settings' },
    { icon: Shield, label: 'Roles & Logs' },
];

export default function SuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center">
                {/* Success animation */}
                <div className="w-24 h-24 mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-30" />
                    <div className="absolute inset-0 bg-brand-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-surface-900 mb-3">
                    Your gym is now live
                </h1>
                <p className="text-surface-500 mb-10">
                    You're all set. Your control panel is ready with everything you need.
                </p>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {FEATURES.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-surface-200 shadow-sm"
                        >
                            <Icon className="w-4 h-4 text-brand-500" />
                            <span className="text-sm font-medium text-surface-700">{label}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-primary text-lg px-10 py-4 gap-2 group"
                >
                    Enter control panel
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="mt-6 text-surface-400 text-sm">
                    You can save your progress and invite team members from Settings.
                </p>
            </div>
        </div>
    );
}
