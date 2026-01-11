'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SetupPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-brand-500 w-6' : 'bg-surface-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="card p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-6 bg-brand-50 rounded-2xl flex items-center justify-center">
                            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">P</span>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-surface-900 mb-3">
                            Let's set up your gym
                        </h1>
                        <p className="text-surface-500">
                            See your control panel in 2 minutes.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3 mb-8">
                        {[
                            'Track members & payments in one place',
                            'Never miss an overdue payment',
                            'Schedule classes and mark attendance',
                            'Enterprise-grade audit trails',
                        ].map((benefit) => (
                            <div key={benefit} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                                <span className="text-surface-600 text-sm">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/setup/identity')}
                        className="btn-primary w-full gap-2 group"
                    >
                        Create my gym
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-surface-400 text-xs mt-4">
                        No credit card required
                    </p>
                </div>

                {/* Already have account */}
                <p className="text-center mt-6 text-surface-500 text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={() => router.push('/login')}
                        className="text-brand-600 font-medium hover:underline"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
