'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Phone,
    Mail,
    Calendar,
    MoreVertical
} from 'lucide-react';
import { trainersApi } from '@/lib/api/client';
import { usePermissions } from '@/lib/auth/context';
import { toast } from '@/components/ui/toast';

interface Trainer {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    specialty: string | null;
    classCount?: number;
}

export default function TrainersPage() {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchTrainers();
    }, []);

    async function fetchTrainers() {
        setIsLoading(true);
        try {
            const data = await trainersApi.list();
            setTrainers(data?.trainers || []);
        } catch (error) {
            console.error('Failed to fetch trainers:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Trainers</h1>
                    <p className="text-surface-500 mt-1">{trainers.length} trainers</p>
                </div>
                {hasPermission('member.create') && (
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary gap-2">
                        <Plus className="w-4 h-4" />
                        Add trainer
                    </button>
                )}
            </div>

            {/* Trainers grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-5 h-40 animate-pulse bg-surface-100" />
                    ))}
                </div>
            ) : trainers.length === 0 ? (
                <div className="card p-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-surface-300" />
                    <h3 className="text-surface-900 font-medium mb-1">No trainers yet</h3>
                    <p className="text-surface-500 text-sm mb-4">Add your first trainer to get started</p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        Add Trainer
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trainers.map((trainer) => (
                        <div key={trainer.id} className="card p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center">
                                        <span className="text-surface-600 font-medium">
                                            {trainer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-900">{trainer.fullName}</h3>
                                        {trainer.specialty && (
                                            <p className="text-brand-600 text-sm">{trainer.specialty}</p>
                                        )}
                                    </div>
                                </div>
                                <button className="p-1 hover:bg-surface-100 rounded">
                                    <MoreVertical className="w-4 h-4 text-surface-400" />
                                </button>
                            </div>

                            <div className="mt-4 space-y-2">
                                {trainer.phone && (
                                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                                        <Phone className="w-4 h-4" />
                                        {trainer.phone}
                                    </div>
                                )}
                                {trainer.email && (
                                    <div className="flex items-center gap-2 text-surface-500 text-sm">
                                        <Mail className="w-4 h-4" />
                                        {trainer.email}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                                <span className="text-surface-500 text-sm">
                                    {trainer.classCount || 0} classes this week
                                </span>
                                <button
                                    onClick={() => router.push(`/classes?trainer=${trainer.id}`)}
                                    className="text-brand-600 text-sm font-medium hover:underline"
                                >
                                    View schedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateTrainerModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchTrainers();
                        toast.success('Trainer created');
                    }}
                />
            )}
        </div>
    );
}

function CreateTrainerModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await trainersApi.create({ fullName, phone, email, specialty });
            onCreated();
        } catch (error) {
            console.error('Failed to create trainer:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="card p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-surface-900 mb-4">Add New Trainer</h2>

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
                        />
                    </div>

                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="label">Specialty</label>
                        <input
                            type="text"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            className="input"
                            placeholder="e.g. Yoga, Cardio, Pilates"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !fullName} className="btn-primary flex-1">
                            {isSubmitting ? 'Creating...' : 'Create Trainer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
