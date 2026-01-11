'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect
    if (isAuthenticated) {
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail('demo@pulsegym.app');
        setPassword('Demo123!');
    };

    return (
        <>
            {/* Form */}
            <div className="card p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="label">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input pl-11"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input pl-11 pr-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full"
                    >
                        {isLoading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button className="text-brand-600 text-sm hover:underline">
                        Forgot password?
                    </button>
                </div>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-surface-100 rounded-lg">
                <p className="text-surface-500 text-sm mb-2 text-center">Demo credentials:</p>
                <div className="flex items-center justify-between">
                    <code className="text-surface-700 text-sm">demo@pulsegym.app / Demo123!</code>
                    <button
                        onClick={handleDemoLogin}
                        className="text-brand-600 text-sm font-medium hover:underline"
                    >
                        Fill
                    </button>
                </div>
            </div>

            {/* Sign up link */}
            <p className="text-center mt-6 text-surface-500 text-sm">
                Don&apos;t have an account?{' '}
                <button
                    onClick={() => router.push('/setup')}
                    className="text-brand-600 font-medium hover:underline"
                >
                    Create your gym
                </button>
            </p>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 bg-brand-500 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
                    <p className="text-surface-500 mt-1">Sign in to your PulseGym account</p>
                </div>

                <Suspense fallback={<div className="card p-8 animate-pulse h-80" />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
