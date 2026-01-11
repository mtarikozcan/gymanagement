'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Calendar, Dumbbell, Users } from 'lucide-react';

type BusinessModel = 'monthly' | 'pt' | 'class_based';

const MODELS = [
    {
        id: 'monthly' as const,
        icon: Calendar,
        title: 'Monthly Memberships',
        description: 'Members pay monthly for unlimited access',
    },
    {
        id: 'pt' as const,
        icon: Dumbbell,
        title: 'PT Sessions',
        description: 'Members buy personal training session packs',
    },
    {
        id: 'class_based' as const,
        icon: Users,
        title: 'Class-Based',
        description: 'Members book and pay per class',
    },
];

export default function ModelPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<BusinessModel | null>(null);

    const handleContinue = () => {
        if (selected) {
            const gym = JSON.parse(sessionStorage.getItem('setup_gym') || '{}');
            sessionStorage.setItem('setup_gym', JSON.stringify({ ...gym, businessModel: selected }));
            router.push('/setup/generating');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-2 rounded-full transition-all ${step <= 3 ? 'bg-brand-500' : 'bg-surface-300'
                                } ${step === 3 ? 'w-6' : 'w-2'}`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="card p-8 animate-slide-up">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <h1 className="text-2xl font-bold text-surface-900 mb-2">
                        How does your gym operate?
                    </h1>
                    <p className="text-surface-500 mb-8">
                        Choose your primary business model. You can change this later.
                    </p>

                    <div className="space-y-3">
                        {MODELS.map(({ id, icon: Icon, title, description }) => (
                            <button
                                key={id}
                                onClick={() => setSelected(id)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selected === id
                                        ? 'border-brand-500 bg-brand-50'
                                        : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === id ? 'bg-brand-500' : 'bg-surface-100'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 ${selected === id ? 'text-white' : 'text-surface-500'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <h3
                                            className={`font-semibold ${selected === id ? 'text-brand-700' : 'text-surface-900'
                                                }`}
                                        >
                                            {title}
                                        </h3>
                                        <p className="text-surface-500 text-sm mt-0.5">{description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={!selected}
                        className="btn-primary w-full mt-8 gap-2 group"
                    >
                        Build my system
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
