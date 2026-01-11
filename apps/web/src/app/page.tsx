'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, BarChart3, Users, Calendar } from 'lucide-react';

export default function HomePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900">
            {/* Header */}
            <header className="px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <span className="text-white font-semibold text-lg">PulseGym</span>
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-surface-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        Sign in
                    </button>
                </div>
            </header>

            {/* Hero */}
            <main className="px-6 pt-20 pb-32">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full mb-8">
                        <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse-soft" />
                        <span className="text-brand-400 text-sm font-medium">Professional gym management</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Run your gym from
                        <br />
                        <span className="text-brand-400">one control panel</span>
                    </h1>

                    <p className="text-xl text-surface-400 mb-12 max-w-2xl mx-auto">
                        Members, payments, classes, trainers, and reports — all in one place.
                        See your control panel in 2 minutes.
                    </p>

                    <button
                        onClick={() => router.push('/setup')}
                        className="btn-primary text-lg px-8 py-4 gap-2 group"
                    >
                        Create my gym
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-6 text-surface-500 text-sm">
                        No credit card required • Free to start
                    </p>
                </div>

                {/* Features */}
                <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-4 gap-6">
                    {[
                        { icon: Users, label: 'Members', desc: 'Track every member' },
                        { icon: BarChart3, label: 'Payments', desc: 'Never miss a due' },
                        { icon: Calendar, label: 'Classes', desc: 'Schedule & attendance' },
                        { icon: Shield, label: 'Control', desc: 'Roles & audit logs' },
                    ].map(({ icon: Icon, label, desc }) => (
                        <div
                            key={label}
                            className="p-6 rounded-xl bg-surface-800/50 border border-surface-700/50 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-brand-500/10 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-brand-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">{label}</h3>
                            <p className="text-surface-400 text-sm">{desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-surface-800">
                <div className="max-w-6xl mx-auto text-center text-surface-500 text-sm">
                    © {new Date().getFullYear()} PulseGym. Professional gym management.
                </div>
            </footer>
        </div>
    );
}
