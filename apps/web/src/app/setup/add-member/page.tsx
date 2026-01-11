'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, User, Phone, Calendar } from 'lucide-react';

// Demo plans
const PLANS = [
    { id: 'plan-1', name: 'Monthly Membership', price: 900, period: '30 days' },
    { id: 'plan-2', name: '3-Month Plan', price: 2400, period: '90 days' },
    { id: 'plan-3', name: '10 PT Sessions', price: 5000, period: '60 days' },
];

export default function AddMemberPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [planId, setPlanId] = useState(PLANS[0].id);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = name.length >= 2;

    const handleSubmit = async () => {
        if (!isValid || isSubmitting) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store the member data
        const memberData = { name, phone, planId, startDate };
        sessionStorage.setItem('first_member', JSON.stringify(memberData));

        router.push('/setup/success');
    };

    return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Card */}
                <div className="card p-8 animate-slide-up">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to dashboard
                    </button>

                    <h1 className="text-2xl font-bold text-surface-900 mb-2">
                        Add your first member
                    </h1>
                    <p className="text-surface-500 mb-8">
                        Create a real member to start managing your gym.
                    </p>

                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="label">Full name *</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Mehmet Yılmaz"
                                    className="input pl-11"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="label">Phone (optional)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+90 5XX XXX XXXX"
                                    className="input pl-11"
                                />
                            </div>
                        </div>

                        {/* Plan */}
                        <div>
                            <label className="label">Membership plan</label>
                            <div className="space-y-2">
                                {PLANS.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setPlanId(plan.id)}
                                        className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${planId === plan.id
                                                ? 'border-brand-500 bg-brand-50'
                                                : 'border-surface-200 hover:border-surface-300'
                                            }`}
                                    >
                                        <div>
                                            <p className={`font-medium ${planId === plan.id ? 'text-brand-700' : 'text-surface-900'}`}>
                                                {plan.name}
                                            </p>
                                            <p className="text-surface-500 text-sm">{plan.period}</p>
                                        </div>
                                        <span className={`font-semibold ${planId === plan.id ? 'text-brand-700' : 'text-surface-700'}`}>
                                            ₺{plan.price.toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start date */}
                        <div>
                            <label className="label">Start date</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input pl-11"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className="btn-primary w-full mt-8 gap-2 group"
                    >
                        {isSubmitting ? 'Creating...' : 'Create member'}
                        {!isSubmitting && (
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
