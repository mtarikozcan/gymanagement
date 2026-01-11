'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { reportsApi } from '@/lib/api/client';

interface RevenueData {
    totalRevenue: number;
    previousPeriod: number;
    percentChange: number;
    byMonth: { month: string; amount: number }[];
}

interface OverdueData {
    totalOverdue: number;
    count: number;
    byDaysRange: { range: string; amount: number; count: number }[];
}

interface ChurnData {
    churnRate: number;
    churned: number;
    retained: number;
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export default function ReportsPage() {
    const [revenue, setRevenue] = useState<RevenueData | null>(null);
    const [overdue, setOverdue] = useState<OverdueData | null>(null);
    const [churn, setChurn] = useState<ChurnData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [revenueData, overdueData, churnData] = await Promise.all([
                reportsApi.getRevenue().catch(() => null),
                reportsApi.getOverdue().catch(() => null),
                reportsApi.getChurn().catch(() => null),
            ]);
            setRevenue(revenueData);
            setOverdue(overdueData);
            setChurn(churnData);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card p-6 h-40 animate-pulse bg-surface-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Reports</h1>
                <p className="text-surface-500 mt-1">Business insights and analytics</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-surface-500 text-sm">Total Revenue</span>
                        </div>
                        {revenue && revenue.percentChange !== 0 && (
                            <span className={`flex items-center gap-1 text-sm ${revenue.percentChange > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {revenue.percentChange > 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                {Math.abs(revenue.percentChange).toFixed(1)}%
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-surface-900">
                        {formatCurrency(revenue?.totalRevenue || 0)}
                    </p>
                    <p className="text-surface-500 text-sm mt-2">
                        vs {formatCurrency(revenue?.previousPeriod || 0)} last period
                    </p>
                </div>

                {/* Overdue */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Total Overdue</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                        {formatCurrency(overdue?.totalOverdue || 0)}
                    </p>
                    <p className="text-surface-500 text-sm mt-2">
                        {overdue?.count || 0} unpaid invoices
                    </p>
                </div>

                {/* Churn */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-surface-500 text-sm">Churn Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-surface-900">
                        {(churn?.churnRate || 0).toFixed(1)}%
                    </p>
                    <p className="text-surface-500 text-sm mt-2">
                        {churn?.churned || 0} churned / {churn?.retained || 0} retained
                    </p>
                </div>
            </div>

            {/* Detailed Reports */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown */}
                <div className="card">
                    <div className="p-5 border-b border-surface-200">
                        <h2 className="font-semibold text-surface-900">Revenue by Month</h2>
                    </div>
                    <div className="p-5">
                        {revenue?.byMonth && revenue.byMonth.length > 0 ? (
                            <div className="space-y-4">
                                {revenue.byMonth.map((item) => {
                                    const maxAmount = Math.max(...revenue.byMonth.map(m => m.amount));
                                    const percent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                                    return (
                                        <div key={item.month}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-surface-700 text-sm">{item.month}</span>
                                                <span className="text-surface-900 font-medium">{formatCurrency(item.amount)}</span>
                                            </div>
                                            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-surface-500">
                                <Calendar className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                <p>No revenue data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overdue Analysis */}
                <div className="card">
                    <div className="p-5 border-b border-surface-200">
                        <h2 className="font-semibold text-surface-900">Overdue Analysis</h2>
                    </div>
                    <div className="p-5">
                        {overdue?.byDaysRange && overdue.byDaysRange.length > 0 ? (
                            <div className="space-y-4">
                                {overdue.byDaysRange.map((item) => (
                                    <div key={item.range} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                                        <div>
                                            <p className="text-surface-900 font-medium">{item.range}</p>
                                            <p className="text-surface-500 text-sm">{item.count} invoices</p>
                                        </div>
                                        <span className="text-red-600 font-semibold">{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-surface-500">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                                <p>No overdue invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
