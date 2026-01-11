'use client';

import { useRouter } from 'next/navigation';
import {
    Users,
    CreditCard,
    Calendar,
    Clock,
    ArrowRight,
    TrendingUp,
    AlertCircle,
    UserPlus
} from 'lucide-react';

// Demo data for the dashboard
const DEMO_DATA = {
    activeMembers: 24,
    overduePayments: 5,
    overdueAmount: 450000, // cents
    todayClasses: 4,
    todayCheckIns: 12,
    overdueList: [
        { id: '1', name: 'Mehmet Yılmaz', amount: 90000, daysOverdue: 12 },
        { id: '2', name: 'Ayşe Kaya', amount: 90000, daysOverdue: 8 },
        { id: '3', name: 'Ali Demir', amount: 90000, daysOverdue: 5 },
    ],
    todaySchedule: [
        { id: '1', title: 'Morning Yoga', time: '09:00', trainer: 'Selin Öz', attendees: 8 },
        { id: '2', title: 'HIIT Blast', time: '11:00', trainer: 'Emre Kılıç', attendees: 12 },
        { id: '3', title: 'Spin Class', time: '17:00', trainer: 'Deniz Arslan', attendees: 15 },
        { id: '4', title: 'Body Pump', time: '19:00', trainer: 'Can Çelik', attendees: 10 },
    ],
};

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(cents / 100);
}

export default function SetupDashboardPage() {
    const router = useRouter();
    const gymData = typeof window !== 'undefined'
        ? JSON.parse(sessionStorage.getItem('setup_gym') || '{"name": "Your Gym", "city": "City"}')
        : { name: 'Your Gym', city: 'City' };

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Header */}
            <header className="bg-white border-b border-surface-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">
                                {gymData.name?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                        </div>
                        <div>
                            <h1 className="font-semibold text-surface-900">{gymData.name}</h1>
                            <p className="text-surface-500 text-sm">{gymData.city}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className="badge bg-amber-100 text-amber-800">
                            Demo Mode
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome banner */}
                <div className="card p-6 mb-8 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold mb-2">Your gym is ready</h2>
                            <p className="text-brand-100">
                                This is your control panel with demo data. Add your first real member to get started.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/setup/add-member')}
                            className="btn bg-white text-brand-700 hover:bg-brand-50 gap-2 group flex-shrink-0"
                        >
                            <UserPlus className="w-4 h-4" />
                            Add your first member
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-surface-500 text-sm">Active Members</span>
                        </div>
                        <p className="text-3xl font-bold text-surface-900">{DEMO_DATA.activeMembers}</p>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="text-surface-500 text-sm">Overdue</span>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{formatCurrency(DEMO_DATA.overdueAmount)}</p>
                        <p className="text-surface-500 text-xs mt-1">{DEMO_DATA.overduePayments} members</p>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-surface-500 text-sm">Today's Classes</span>
                        </div>
                        <p className="text-3xl font-bold text-surface-900">{DEMO_DATA.todayClasses}</p>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-surface-500 text-sm">Check-ins Today</span>
                        </div>
                        <p className="text-3xl font-bold text-surface-900">{DEMO_DATA.todayCheckIns}</p>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Overdue Queue */}
                    <div className="card">
                        <div className="p-5 border-b border-surface-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-surface-900">Overdue Payments</h3>
                                <button className="text-brand-600 text-sm font-medium hover:underline">
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-surface-100">
                            {DEMO_DATA.overdueList.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-surface-900">{item.name}</p>
                                        <p className="text-surface-500 text-sm">{item.daysOverdue} days overdue</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-red-600 font-semibold">
                                            {formatCurrency(item.amount)}
                                        </span>
                                        <button className="btn-primary text-sm py-1.5 px-3">
                                            Collect
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="card">
                        <div className="p-5 border-b border-surface-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-surface-900">Today's Schedule</h3>
                                <button className="text-brand-600 text-sm font-medium hover:underline">
                                    View all
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-surface-100">
                            {DEMO_DATA.todaySchedule.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="font-bold text-surface-900">{item.time}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-surface-900">{item.title}</p>
                                            <p className="text-surface-500 text-sm">{item.trainer}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-surface-500 text-sm">{item.attendees} registered</span>
                                        <button className="btn-secondary text-sm py-1.5 px-3">
                                            Attendance
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
