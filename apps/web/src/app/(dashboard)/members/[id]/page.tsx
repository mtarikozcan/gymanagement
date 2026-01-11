'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Clock,
    Edit,
    MoreVertical,
    Snowflake,
    RefreshCw,
    Play
} from 'lucide-react';
import { membersApi, membershipsApi, plansApi, invoicesApi } from '@/lib/api/client';
import { usePermissions } from '@/lib/auth/context';
import { toast } from '@/components/ui/toast';

interface Member {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    status: 'active' | 'frozen' | 'expired';
    notes: string | null;
    createdAt: string;
    memberships: Membership[];
    invoices: Invoice[];
}

interface Membership {
    id: string;
    plan: { id: string; name: string; priceCents: number };
    startDate: string;
    endDate: string;
    status: 'active' | 'expired' | 'frozen';
}

interface Invoice {
    id: string;
    amountCents: number;
    dueDate: string;
    status: 'due' | 'paid' | 'void';
    paidAt?: string;
}

interface Plan {
    id: string;
    name: string;
    priceCents: number;
    durationDays: number;
}

const STATUS_BADGES: Record<string, string> = {
    active: 'badge-success',
    frozen: 'badge-warning',
    expired: 'badge-danger',
};

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export default function MemberDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { hasPermission } = usePermissions();
    const memberId = params.id as string;

    const [member, setMember] = useState<Member | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAssignPlanModal, setShowAssignPlanModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);

    useEffect(() => {
        fetchMember();
        fetchPlans();
    }, [memberId]);

    async function fetchMember() {
        try {
            const data = await membersApi.get(memberId);
            setMember(data);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            router.push('/members');
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchPlans() {
        try {
            const data = await plansApi.list();
            setPlans(data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        }
    }

    async function handleFreeze() {
        if (!member?.memberships?.[0]) return;
        try {
            await membershipsApi.freeze(member.memberships[0].id);
            toast.success('Membership frozen');
            fetchMember();
        } catch (error) {
            console.error('Failed to freeze:', error);
        }
    }

    async function handleUnfreeze() {
        if (!member?.memberships?.[0]) return;
        try {
            await membershipsApi.unfreeze(member.memberships[0].id);
            toast.success('Membership unfrozen');
            fetchMember();
        } catch (error) {
            console.error('Failed to unfreeze:', error);
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-4 w-32 bg-surface-200 rounded animate-pulse" />
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-200 rounded-full animate-pulse" />
                    <div>
                        <div className="h-6 w-48 bg-surface-200 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-surface-100 rounded animate-pulse mt-2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!member) return null;

    const currentMembership = member.memberships?.[0];
    const daysRemaining = currentMembership
        ? Math.max(0, Math.ceil((new Date(currentMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;
    const progressPercent = currentMembership
        ? Math.min(100, Math.max(0, (1 - daysRemaining / 30) * 100))
        : 0;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to members
            </button>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
                        <span className="text-surface-600 font-medium text-xl">
                            {member.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-surface-900">{member.fullName}</h1>
                            <span className={STATUS_BADGES[member.status]}>
                                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-surface-500 text-sm">
                            {member.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {member.phone}
                                </span>
                            )}
                            {member.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {member.email}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Member since {new Date(member.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasPermission('member.update') && (
                        <button className="btn-secondary gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                    <button className="btn-secondary p-2">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Membership */}
                    <div className="card">
                        <div className="p-5 border-b border-surface-200 flex items-center justify-between">
                            <h2 className="font-semibold text-surface-900">Current Membership</h2>
                            {hasPermission('membership.renew') && (
                                <div className="flex items-center gap-2">
                                    {currentMembership?.status === 'frozen' ? (
                                        <button onClick={handleUnfreeze} className="btn-ghost text-sm gap-1">
                                            <Play className="w-4 h-4" />
                                            Unfreeze
                                        </button>
                                    ) : currentMembership?.status === 'active' ? (
                                        <button onClick={handleFreeze} className="btn-ghost text-sm gap-1">
                                            <Snowflake className="w-4 h-4" />
                                            Freeze
                                        </button>
                                    ) : null}
                                    <button onClick={() => setShowRenewModal(true)} className="btn-primary text-sm gap-1">
                                        <RefreshCw className="w-4 h-4" />
                                        Renew
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-5">
                            {currentMembership ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-lg font-semibold text-surface-900">{currentMembership.plan.name}</p>
                                            <p className="text-surface-500 text-sm">
                                                {new Date(currentMembership.startDate).toLocaleDateString('tr-TR')} — {new Date(currentMembership.endDate).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                        <span className={STATUS_BADGES[currentMembership.status]}>
                                            {currentMembership.status.charAt(0).toUpperCase() + currentMembership.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Timeline bar */}
                                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                    <p className="text-surface-500 text-sm mt-2">
                                        {daysRemaining} days remaining
                                    </p>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-surface-500 mb-4">No active membership</p>
                                    {hasPermission('membership.renew') && (
                                        <button onClick={() => setShowAssignPlanModal(true)} className="btn-primary">
                                            Assign a Plan
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment history */}
                    <div className="card">
                        <div className="p-5 border-b border-surface-200">
                            <h2 className="font-semibold text-surface-900">Payment History</h2>
                        </div>
                        <div className="divide-y divide-surface-100">
                            {member.invoices.length === 0 ? (
                                <div className="p-8 text-center text-surface-500">No invoices</div>
                            ) : (
                                member.invoices.slice(0, 5).map((invoice) => (
                                    <div key={invoice.id} className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${invoice.status === 'paid' ? 'bg-green-50' : 'bg-red-50'
                                                }`}>
                                                <CreditCard className={`w-5 h-5 ${invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-surface-900">
                                                    {formatCurrency(invoice.amountCents)}
                                                </p>
                                                <p className="text-surface-500 text-sm">
                                                    Due {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {invoice.status === 'paid' ? (
                                                <span className="badge-success">Paid</span>
                                            ) : invoice.status === 'due' ? (
                                                <>
                                                    <span className="badge-danger">Due</span>
                                                    <button
                                                        onClick={() => router.push(`/payments?collect=${invoice.id}`)}
                                                        className="btn-primary text-sm py-1.5 px-3"
                                                    >
                                                        Collect
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="badge">Void</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Notes */}
                    <div className="card p-5">
                        <h3 className="font-semibold text-surface-900 mb-3">Notes</h3>
                        <p className="text-surface-600 text-sm">{member.notes || 'No notes'}</p>
                    </div>
                </div>
            </div>

            {/* Assign Plan Modal */}
            {showAssignPlanModal && (
                <AssignPlanModal
                    memberId={member.id}
                    plans={plans}
                    onClose={() => setShowAssignPlanModal(false)}
                    onAssigned={() => {
                        setShowAssignPlanModal(false);
                        fetchMember();
                    }}
                />
            )}

            {/* Renew Modal */}
            {showRenewModal && currentMembership && (
                <RenewModal
                    membershipId={currentMembership.id}
                    currentPlan={currentMembership.plan}
                    plans={plans}
                    onClose={() => setShowRenewModal(false)}
                    onRenewed={() => {
                        setShowRenewModal(false);
                        fetchMember();
                    }}
                />
            )}
        </div>
    );
}

function AssignPlanModal({
    memberId,
    plans,
    onClose,
    onAssigned,
}: {
    memberId: string;
    plans: Plan[];
    onClose: () => void;
    onAssigned: () => void;
}) {
    const [planId, setPlanId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await membershipsApi.create({ memberId, planId, startDate });
            toast.success('Plan assigned successfully');
            onAssigned();
        } catch (error) {
            console.error('Failed to assign plan:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-surface-900 mb-4">Assign a Plan</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Plan *</label>
                        <select
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            className="input"
                            required
                        >
                            <option value="">Select a plan</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - {formatCurrency(plan.priceCents)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !planId} className="btn-primary flex-1">
                            {isSubmitting ? 'Assigning...' : 'Assign Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RenewModal({
    membershipId,
    currentPlan,
    plans,
    onClose,
    onRenewed,
}: {
    membershipId: string;
    currentPlan: { id: string; name: string };
    plans: Plan[];
    onClose: () => void;
    onRenewed: () => void;
}) {
    const [planId, setPlanId] = useState(currentPlan.id);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await membershipsApi.renew(membershipId, { planId, startDate });
            toast.success('Membership renewed successfully');
            onRenewed();
        } catch (error) {
            console.error('Failed to renew:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-surface-900 mb-4">Renew Membership</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Plan</label>
                        <select
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            className="input"
                            required
                        >
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - {formatCurrency(plan.priceCents)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">New Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                            {isSubmitting ? 'Renewing...' : 'Renew'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
