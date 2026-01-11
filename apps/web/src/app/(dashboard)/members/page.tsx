'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Plus,
    Filter,
    MoreVertical,
    Phone,
    Mail,
    AlertCircle
} from 'lucide-react';
import { membersApi } from '@/lib/api/client';
import { usePermissions } from '@/lib/auth/context';

interface Member {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    status: 'active' | 'frozen' | 'expired';
    membership?: {
        plan: { name: string };
        endDate: string;
    } | null;
    overdueAmount?: number;
}

const STATUS_BADGES: Record<string, string> = {
    active: 'badge-success',
    frozen: 'badge-warning',
    expired: 'badge-danger',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    frozen: 'Frozen',
    expired: 'Expired',
};

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export default function MembersPage() {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const [members, setMembers] = useState<Member[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [statusFilter]);

    async function fetchMembers() {
        setIsLoading(true);
        try {
            const data = await membersApi.list({
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: search || undefined,
            });
            setMembers(data.members || []);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') {
                fetchMembers();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const filteredMembers = members.filter((member) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            member.fullName.toLowerCase().includes(searchLower) ||
            member.phone?.toLowerCase().includes(searchLower) ||
            member.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Members</h1>
                    <p className="text-surface-500 mt-1">{members.length} total members</p>
                </div>
                {hasPermission('member.create') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add member
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-surface-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input w-auto"
                        >
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="frozen">Frozen</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Members table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
                                <div className="w-10 h-10 bg-surface-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-surface-200 rounded" />
                                    <div className="h-3 w-24 bg-surface-100 rounded mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Member</th>
                                <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Plan</th>
                                <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Status</th>
                                <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Expires</th>
                                <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Overdue</th>
                                <th className="text-right text-sm font-medium text-surface-500 px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {filteredMembers.map((member) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-surface-50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/members/${member.id}`)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-surface-600 font-medium text-sm">
                                                    {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-900">{member.fullName}</p>
                                                <div className="flex items-center gap-3 text-surface-500 text-sm">
                                                    {member.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {member.phone}
                                                        </span>
                                                    )}
                                                    {member.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {member.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-surface-700">
                                            {member.membership?.plan?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={STATUS_BADGES[member.status]}>
                                            {STATUS_LABELS[member.status]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {member.membership?.endDate ? (
                                            <span className="text-surface-700">
                                                {new Date(member.membership.endDate).toLocaleDateString('tr-TR')}
                                            </span>
                                        ) : (
                                            <span className="text-surface-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {member.overdueAmount && member.overdueAmount > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                                <span className="text-red-600 font-medium">
                                                    {formatCurrency(member.overdueAmount)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-surface-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-4 h-4 text-surface-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!isLoading && filteredMembers.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-surface-100 rounded-full flex items-center justify-center">
                            <Search className="w-6 h-6 text-surface-400" />
                        </div>
                        <h3 className="text-surface-900 font-medium mb-1">No members found</h3>
                        <p className="text-surface-500 text-sm">
                            {search ? 'Try adjusting your search.' : 'Add your first member to get started.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Member Modal */}
            {showCreateModal && (
                <CreateMemberModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchMembers();
                    }}
                />
            )}
        </div>
    );
}

function CreateMemberModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await membersApi.create({ fullName, phone, email, notes });
            onCreated();
        } catch (error) {
            console.error('Failed to create member:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-surface-900 mb-4">Add New Member</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name *</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="input"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input"
                            placeholder="+90 5XX XXX XX XX"
                        />
                    </div>

                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            placeholder="member@example.com"
                        />
                    </div>

                    <div>
                        <label className="label">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input min-h-[80px]"
                            placeholder="Any notes about this member..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !fullName} className="btn-primary flex-1">
                            {isSubmitting ? 'Creating...' : 'Create Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
