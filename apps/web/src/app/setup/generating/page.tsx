'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
    { label: 'Creating dashboard', duration: 800 },
    { label: 'Preparing memberships', duration: 600 },
    { label: 'Setting up payments', duration: 700 },
    { label: 'Configuring classes', duration: 500 },
    { label: 'Final touches', duration: 400 },
];

export default function GeneratingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState<number[]>([]);

    useEffect(() => {
        const runSteps = async () => {
            for (let i = 0; i < STEPS.length; i++) {
                setCurrentStep(i);
                await new Promise((resolve) => setTimeout(resolve, STEPS[i].duration));
                setCompleted((prev) => [...prev, i]);
            }

            // Wait a moment, then navigate
            await new Promise((resolve) => setTimeout(resolve, 500));

            // In real app, we'd call the API here to create the gym
            // For now, just navigate to dashboard
            router.push('/setup/dashboard');
        };

        runSteps();
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className="h-2 rounded-full bg-brand-500 w-2"
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="card p-8 text-center">
                    {/* Animated logo */}
                    <div className="w-20 h-20 mx-auto mb-8 relative">
                        <div className="absolute inset-0 bg-brand-500 rounded-2xl animate-pulse-soft" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">P</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-surface-900 mb-2">
                        Setting up your control panel
                    </h1>
                    <p className="text-surface-500 mb-8">
                        This will only take a moment.
                    </p>

                    {/* Steps */}
                    <div className="space-y-4 text-left">
                        {STEPS.map((step, index) => {
                            const isCompleted = completed.includes(index);
                            const isCurrent = currentStep === index && !isCompleted;

                            return (
                                <div
                                    key={step.label}
                                    className={`flex items-center gap-3 transition-opacity ${index > currentStep ? 'opacity-40' : 'opacity-100'
                                        }`}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-brand-500" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                                        ) : (
                                            <div className="w-3 h-3 rounded-full bg-surface-300" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-sm ${isCompleted
                                                ? 'text-surface-900 font-medium'
                                                : isCurrent
                                                    ? 'text-surface-700'
                                                    : 'text-surface-400'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cancel link */}
                <p className="text-center mt-6">
                    <button
                        onClick={() => router.push('/setup')}
                        className="text-surface-400 hover:text-surface-600 text-sm transition-colors"
                    >
                        Cancel setup
                    </button>
                </p>
            </div>
        </div>
    );
}
