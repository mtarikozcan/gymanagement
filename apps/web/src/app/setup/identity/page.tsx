'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react';

export default function IdentityPage() {
    const router = useRouter();
    const [gymName, setGymName] = useState('');
    const [city, setCity] = useState('');
    const [isValid, setIsValid] = useState(false);

    const handleNameChange = (value: string) => {
        setGymName(value);
        setIsValid(value.length >= 2 && city.length >= 2);
    };

    const handleCityChange = (value: string) => {
        setCity(value);
        setIsValid(gymName.length >= 2 && value.length >= 2);
    };

    const handleContinue = () => {
        if (isValid) {
            sessionStorage.setItem('setup_gym', JSON.stringify({ name: gymName, city }));
            router.push('/setup/model');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex">
            {/* Left: Form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    {/* Progress */}
                    <div className="flex items-center justify-center gap-2 mb-12">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-2 rounded-full transition-all ${step <= 2 ? 'bg-brand-500' : 'bg-surface-300'
                                    } ${step === 2 ? 'w-6' : 'w-2'}`}
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
                            Give your gym an identity
                        </h1>
                        <p className="text-surface-500 mb-8">
                            This will be shown to your members and staff.
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="label">Gym name</label>
                                <input
                                    type="text"
                                    value={gymName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="FitPulse Studio"
                                    className="input"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="label">City</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => handleCityChange(e.target.value)}
                                    placeholder="İstanbul"
                                    className="input"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={!isValid}
                            className="btn-primary w-full mt-8 gap-2 group"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="hidden lg:flex flex-1 bg-surface-900 items-center justify-center p-12">
                <div className="max-w-sm w-full">
                    <p className="text-surface-400 text-sm mb-4">Live preview</p>

                    {/* Mock Dashboard Header */}
                    <div className="bg-surface-800 rounded-xl p-4 border border-surface-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                                {gymName ? (
                                    <span className="text-white font-bold">
                                        {gymName.charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <Building2 className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">
                                    {gymName || 'Your Gym Name'}
                                </h3>
                                <p className="text-surface-400 text-sm">
                                    {city || 'City'}
                                </p>
                            </div>
                        </div>

                        {/* Mock KPIs */}
                        <div className="grid grid-cols-2 gap-3">
                            {['Active Members', 'Today Classes', 'Overdue', 'Check-ins'].map((label) => (
                                <div key={label} className="bg-surface-700/50 rounded-lg p-3">
                                    <p className="text-surface-400 text-xs mb-1">{label}</p>
                                    <p className="text-white font-semibold">--</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
