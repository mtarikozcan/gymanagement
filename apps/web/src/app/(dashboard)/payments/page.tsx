'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    CreditCard,
    DollarSign,
    AlertCircle,
    Clock,
    CheckCircle2,
    User,
    Filter
} from 'lucide-react';
import { invoicesApi, paymentsApi } from '@/lib/api/client';
import { usePermissions } from '@/lib/auth/context';
import { toast } from '@/components/ui/toast';

interface Invoice {
    id: string;
    member: { id: string; fullName: string; phone: string | null };
    amountCents: number;
    dueDate: string;
    status: 'due' | 'paid' | 'void';
    daysOverdue?: number;
}

interface Payment {
    id: string;
    invoice: Invoice;
    amountCents: number;
    method: string;
    paidAt: string;
    note?: string;
}

type TabType = 'overdue' | 'all' | 'history';

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

function generateIdempotencyKey(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function PaymentsContent() {
    const searchParams = useSearchParams();
    const { hasPermission } = usePermissions();

    const [tab, setTab] = useState<TabType>('overdue');
    const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [collectInvoice, setCollectInvoice] = useState<Invoice | null>(null);

    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amountCents, 0);
    const paidThisMonth = payments
        .filter(p => new Date(p.paidAt).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + p.amountCents, 0);

    useEffect(() => {
        fetchData();
    }, [tab]);

    useEffect(() => {
        const collectId = searchParams.get('collect');
        if (collectId) {
            const invoice = overdueInvoices.find(inv => inv.id === collectId);
            if (invoice) {
                setCollectInvoice(invoice);
            }
        }
    }, [searchParams, overdueInvoices]);

    async function fetchData() {
        setIsLoading(true);
        try {
            if (tab === 'overdue') {
                const data = await invoicesApi.getOverdue();
                setOverdueInvoices(data?.invoices || []);
            } else if (tab === 'all') {
                const data = await invoicesApi.list();
                setAllInvoices(data.invoices || []);
            } else {
                const data = await paymentsApi.list();
                setPayments(data.payments || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-surface-900">Payments</h1>
                <p className="text-surface-500 mt-1">Manage invoices and collect payments</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-surface-500 text-sm">Total Overdue</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-surface-500 text-sm">Collected This Month</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(paidThisMonth)}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-surface-600" />
                        </div>
                        <div>
                            <p className="text-surface-500 text-sm">Overdue Invoices</p>
                            <p className="text-2xl font-bold text-surface-900">{overdueInvoices.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-surface-200">
                <nav className="flex gap-6">
                    {[
                        { id: 'overdue', label: 'Overdue', count: overdueInvoices.length },
                        { id: 'all', label: 'All Invoices' },
                        { id: 'history', label: 'Payment History' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id as TabType)}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === item.id
                                ? 'border-brand-500 text-brand-600'
                                : 'border-transparent text-surface-500 hover:text-surface-700'
                                }`}
                        >
                            {item.label}
                            {item.count !== undefined && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {isLoading ? (
                <div className="card p-8">
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
            ) : tab === 'overdue' ? (
                <OverdueList
                    invoices={overdueInvoices}
                    onCollect={(invoice) => hasPermission('payment.collect') && setCollectInvoice(invoice)}
                    canCollect={hasPermission('payment.collect')}
                />
            ) : tab === 'all' ? (
                <InvoiceList
                    invoices={allInvoices}
                    onCollect={(invoice) => hasPermission('payment.collect') && setCollectInvoice(invoice)}
                    canCollect={hasPermission('payment.collect')}
                />
            ) : (
                <PaymentHistory payments={payments} />
            )}

            {collectInvoice && (
                <CollectPaymentModal
                    invoice={collectInvoice}
                    onClose={() => setCollectInvoice(null)}
                    onCollected={() => {
                        setCollectInvoice(null);
                        fetchData();
                        toast.success('Payment collected successfully');
                    }}
                />
            )}
        </div>
    );
}

function OverdueList({ invoices, onCollect, canCollect }: { invoices: Invoice[]; onCollect: (inv: Invoice) => void; canCollect: boolean }) {
    if (invoices.length === 0) {
        return (
            <div className="card p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-surface-900 font-medium mb-1">All caught up!</h3>
                <p className="text-surface-500 text-sm">No overdue payments</p>
            </div>
        );
    }

    return (
        <div className="card divide-y divide-surface-100">
            {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-surface-400" />
                        </div>
                        <div>
                            <p className="font-medium text-surface-900">{invoice.member.fullName}</p>
                            <p className="text-surface-500 text-sm">{invoice.member.phone}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="font-semibold text-red-600">{formatCurrency(invoice.amountCents)}</p>
                            <p className="text-surface-400 text-xs flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" />
                                {invoice.daysOverdue} days overdue
                            </p>
                        </div>
                        {canCollect && (
                            <button onClick={() => onCollect(invoice)} className="btn-primary">Collect</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function InvoiceList({ invoices, onCollect, canCollect }: { invoices: Invoice[]; onCollect: (inv: Invoice) => void; canCollect: boolean }) {
    const statusColors: Record<string, string> = { due: 'badge-danger', paid: 'badge-success', void: 'badge' };

    return (
        <div className="card overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Member</th>
                        <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Amount</th>
                        <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Due Date</th>
                        <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Status</th>
                        <th className="text-right text-sm font-medium text-surface-500 px-5 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                    {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-surface-50">
                            <td className="px-5 py-4 text-surface-900">{invoice.member.fullName}</td>
                            <td className="px-5 py-4 font-medium text-surface-900">{formatCurrency(invoice.amountCents)}</td>
                            <td className="px-5 py-4 text-surface-600">{new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</td>
                            <td className="px-5 py-4">
                                <span className={statusColors[invoice.status]}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                                {invoice.status === 'due' && canCollect && (
                                    <button onClick={() => onCollect(invoice)} className="btn-primary text-sm py-1.5 px-3">Collect</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PaymentHistory({ payments }: { payments: Payment[] }) {
    const methodLabels: Record<string, string> = { cash: 'Cash', credit_card: 'Credit Card', bank_transfer: 'Bank Transfer', other: 'Other' };

    return (
        <div className="card overflow-hidden">
            {payments.length === 0 ? (
                <div className="p-12 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                    <h3 className="text-surface-900 font-medium mb-1">No payments yet</h3>
                    <p className="text-surface-500 text-sm">Collected payments will appear here</p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="bg-surface-50 border-b border-surface-200">
                            <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Member</th>
                            <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Amount</th>
                            <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Method</th>
                            <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Date</th>
                            <th className="text-left text-sm font-medium text-surface-500 px-5 py-3">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-surface-50">
                                <td className="px-5 py-4 text-surface-900">{payment.invoice?.member?.fullName || '—'}</td>
                                <td className="px-5 py-4 font-medium text-green-600">+{formatCurrency(payment.amountCents)}</td>
                                <td className="px-5 py-4 text-surface-600">{methodLabels[payment.method] || payment.method}</td>
                                <td className="px-5 py-4 text-surface-600">{new Date(payment.paidAt).toLocaleDateString('tr-TR')}</td>
                                <td className="px-5 py-4 text-surface-500 text-sm">{payment.note || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

function CollectPaymentModal({ invoice, onClose, onCollected }: { invoice: Invoice; onClose: () => void; onCollected: () => void }) {
    const [amount, setAmount] = useState((invoice.amountCents / 100).toString());
    const [method, setMethod] = useState('cash');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idempotencyKey] = useState(generateIdempotencyKey());

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await paymentsApi.collect({ invoiceId: invoice.id, amountCents: Math.round(parseFloat(amount) * 100), method, note: note || undefined }, idempotencyKey);
            onCollected();
        } catch (error: any) {
            if (error.status === 409) toast.warning('Payment already processed');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-surface-900 mb-1">Collect Payment</h2>
                <p className="text-surface-500 text-sm mb-4">{invoice.member.fullName}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Amount (TRY)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">₺</span>
                            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input pl-8" required />
                        </div>
                    </div>
                    <div>
                        <label className="label">Payment Method</label>
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input">
                            <option value="cash">Cash</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">Note (optional)</label>
                        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input" placeholder="e.g. Partial payment" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Processing...' : `Collect ${formatCurrency(parseFloat(amount || '0') * 100)}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-8 animate-pulse"><div className="h-8 w-48 bg-surface-200 rounded mb-4" /><div className="h-40 bg-surface-100 rounded" /></div>}>
            <PaymentsContent />
        </Suspense>
    );
}
