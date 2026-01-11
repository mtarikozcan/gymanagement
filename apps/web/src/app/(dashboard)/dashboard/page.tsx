'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    CreditCard,
    Calendar,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    Clock
} from 'lucide-react';
import { gymApi, invoicesApi, classesApi } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/context';

interface Stats {
    activeMembers: number;
    overduePayments: number;
    overdueAmount: number;
    todayClasses: number;
    todayCheckIns: number;
}

interface OverdueItem {
    id: string;
    member: { id: string; fullName: string; phone: string };
    amountCents: number;
    daysOverdue: number;
}

interface ClassItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    trainer: { fullName: string } | null;
    attendeeCount: number;
    capacity: number | null;
}

interface ActivityItem {
    id: string;
    action: string;
    entityType: string;
    metadata: any;
    createdAt: string;
    actor: { name: string } | null;
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

function formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return new Date(date).toLocaleDateString('tr-TR');
}

export default function DashboardPage() {
    const router = useRouter();
    const { gym } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [overdueList, setOverdueList] = useState<OverdueItem[]>([]);
    const [todayClasses, setTodayClasses] = useState<ClassItem[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, overdueData, scheduleData, activityData] = await Promise.all([
                    gymApi.getStats().catch(() => null),
                    invoicesApi.getOverdue().catch(() => ({ invoices: [] })),
                    classesApi.getSchedule(0).catch(() => ({ today: [] })),
                    gymApi.getActivityFeed(5).catch(() => ({ logs: [] })),
                ]);

                if (statsData) {
                    setStats(statsData);
                }
                // Extract arrays from response objects
                setOverdueList((overdueData?.invoices || []).slice(0, 5));
                setTodayClasses(scheduleData?.today || []);
                setActivityFeed(activityData?.logs || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card p-5 h-32 animate-pulse bg-surface-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
                <p className="text-surface-500 mt-1">Your gym at a glance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Active Members</span>
                    </div>
                    <p className="text-3xl font-bold text-surface-900">{stats?.activeMembers || 0}</p>
                </div>

                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Overdue Payments</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(stats?.overdueAmount || 0)}</p>
                    <p className="text-surface-500 text-xs mt-2">{stats?.overduePayments || 0} invoices</p>
                </div>

                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Today&apos;s Classes</span>
                    </div>
                    <p className="text-3xl font-bold text-surface-900">{stats?.todayClasses || todayClasses.length}</p>
                </div>

                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Check-ins Today</span>
                    </div>
                    <p className="text-3xl font-bold text-surface-900">{stats?.todayCheckIns || 0}</p>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Overdue Queue */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="p-5 border-b border-surface-200 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-surface-900">Overdue Payments</h2>
                                <p className="text-surface-500 text-sm">Requires immediate attention</p>
                            </div>
                            <button
                                onClick={() => router.push('/payments')}
                                className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1"
                            >
                                View all <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="divide-y divide-surface-100">
                            {overdueList.length === 0 ? (
                                <div className="p-8 text-center text-surface-500">
                                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                    <p>No overdue payments</p>
                                </div>
                            ) : (
                                overdueList.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center">
                                                <span className="text-surface-600 font-medium text-sm">
                                                    {item.member.fullName.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-900">{item.member.fullName}</p>
                                                <p className="text-surface-500 text-sm">{item.member.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-red-600 font-semibold">{formatCurrency(item.amountCents)}</p>
                                                <p className="text-surface-400 text-xs">{item.daysOverdue} days overdue</p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/payments?collect=${item.id}`)}
                                                className="btn-primary text-sm py-1.5 px-3"
                                            >
                                                Collect
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="card">
                    <div className="p-5 border-b border-surface-200">
                        <h2 className="font-semibold text-surface-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-surface-100">
                        {activityFeed.length === 0 ? (
                            <div className="p-8 text-center text-surface-500">
                                <Clock className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            activityFeed.map((item) => (
                                <div key={item.id} className="p-4">
                                    <p className="text-sm font-medium text-surface-900">
                                        {item.action.split('.').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </p>
                                    <p className="text-surface-500 text-sm mt-0.5">
                                        {item.actor?.name || 'System'}
                                    </p>
                                    <p className="text-surface-400 text-xs mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatRelativeTime(item.createdAt)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="card">
                <div className="p-5 border-b border-surface-200 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-surface-900">Today&apos;s Schedule</h2>
                        <p className="text-surface-500 text-sm">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/classes')}
                        className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        View week <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                {todayClasses.length === 0 ? (
                    <div className="p-8 text-center text-surface-500">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                        <p>No classes scheduled for today</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-surface-100">
                        {todayClasses.slice(0, 4).map((item) => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-surface-900">{formatTime(item.startTime)}</span>
                                    <span className="text-surface-400 text-sm">- {formatTime(item.endTime)}</span>
                                </div>
                                <h3 className="font-medium text-surface-900">{item.title}</h3>
                                <p className="text-surface-500 text-sm">{item.trainer?.fullName || 'No trainer'}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-surface-500 text-sm">
                                        {item.attendeeCount}/{item.capacity || '∞'} registered
                                    </span>
                                    <button
                                        onClick={() => router.push(`/classes/${item.id}`)}
                                        className="text-brand-600 text-sm font-medium hover:underline"
                                    >
                                        Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
