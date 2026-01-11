'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Clock,
    User,
    FileText,
    Activity
} from 'lucide-react';
import { auditApi } from '@/lib/api/client';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: any;
    createdAt: string;
    actor: { id: string; name: string; email: string } | null;
}

interface ActionType {
    action: string;
    count: number;
}

function formatRelativeTime(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString('tr-TR');
}

function formatAction(action: string): string {
    return action
        .split('.')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getActionColor(action: string): { bg: string; text: string } {
    if (action.includes('create')) return { bg: 'bg-green-100', text: 'text-green-700' };
    if (action.includes('delete')) return { bg: 'bg-red-100', text: 'text-red-700' };
    if (action.includes('update')) return { bg: 'bg-blue-100', text: 'text-blue-700' };
    if (action.includes('collect') || action.includes('payment')) return { bg: 'bg-amber-100', text: 'text-amber-700' };
    return { bg: 'bg-surface-100', text: 'text-surface-700' };
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, [actionFilter]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [logsData, actionsData] = await Promise.all([
                auditApi.list({
                    action: actionFilter !== 'all' ? actionFilter : undefined,
                    limit: 50,
                }),
                auditApi.getActionTypes().catch(() => ({ actions: [] as any[] })),
            ]);
            setLogs(logsData?.logs || []);
            setActionTypes(actionsData?.actions || []);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredLogs = logs.filter((log) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            log.action.toLowerCase().includes(searchLower) ||
            log.entityType.toLowerCase().includes(searchLower) ||
            log.actor?.name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Activity Log</h1>
                <p className="text-surface-500 mt-1">Track all actions and changes in your gym</p>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by action, entity, or user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Action filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-surface-400" />
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="input w-auto"
                        >
                            <option value="all">All actions</option>
                            {actionTypes.map((at) => (
                                <option key={at.action} value={at.action}>
                                    {formatAction(at.action)} ({at.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs */}
            <div className="card divide-y divide-surface-100">
                {isLoading ? (
                    <div className="p-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
                                <div className="w-10 h-10 bg-surface-200 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-4 w-48 bg-surface-200 rounded" />
                                    <div className="h-3 w-32 bg-surface-100 rounded mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                        <h3 className="text-surface-900 font-medium mb-1">No activity found</h3>
                        <p className="text-surface-500 text-sm">
                            {search ? 'Try adjusting your search.' : 'Actions will appear here as they happen.'}
                        </p>
                    </div>
                ) : (
                    filteredLogs.map((log) => {
                        const colors = getActionColor(log.action);
                        return (
                            <div key={log.id} className="p-4 flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
                                    <FileText className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
                                            {formatAction(log.action)}
                                        </span>
                                        <span className="text-surface-400 text-sm">
                                            on {log.entityType}
                                        </span>
                                    </div>
                                    <p className="text-surface-600 text-sm mt-1">
                                        {log.metadata?.description || `${log.entityType} ${log.entityId || ''}`}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-surface-400 text-xs">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {log.actor?.name || 'System'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatRelativeTime(log.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
