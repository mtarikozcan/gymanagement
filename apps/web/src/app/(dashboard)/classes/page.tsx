'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Clock,
    User,
    Users
} from 'lucide-react';
import { classesApi } from '@/lib/api/client';

interface ClassItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    trainer: { id: string; fullName: string } | null;
    attendeeCount: number;
    capacity: number | null;
    dayOfWeek: number;
}

interface ScheduleData {
    week: { start: string; end: string };
    days: Record<string, ClassItem[]>;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
}

export default function ClassesPage() {
    const router = useRouter();
    const [weekOffset, setWeekOffset] = useState(0);
    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, [weekOffset]);

    async function fetchSchedule() {
        setIsLoading(true);
        try {
            const data = await classesApi.getSchedule(weekOffset);
            setSchedule(data);
        } catch (error) {
            console.error('Failed to fetch schedule:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function getCurrentWeekLabel(): string {
        if (!schedule?.week) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - dayOfWeek + 1 + weekOffset * 7);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            return `${formatDate(monday.toISOString())} – ${formatDate(sunday.toISOString())}`;
        }
        return `${formatDate(schedule.week.start)} – ${formatDate(schedule.week.end)}`;
    }

    // Get days for the current week
    function getDays(): { date: Date; name: string; classes: ClassItem[] }[] {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1 + weekOffset * 7);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            days.push({
                date,
                name: DAYS[(i + 1) % 7 || 7],
                classes: schedule?.days?.[dateKey] || [],
            });
        }
        return days;
    }

    const daysData = getDays();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">Class Schedule</h1>
                    <p className="text-surface-500 mt-1">Manage your weekly class schedule</p>
                </div>
                <button className="btn-primary">Add Class</button>
            </div>

            {/* Week navigation */}
            <div className="card p-4 flex items-center justify-between">
                <button
                    onClick={() => setWeekOffset((w) => w - 1)}
                    className="btn-ghost gap-1"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-500" />
                    <span className="font-semibold text-surface-900">{getCurrentWeekLabel()}</span>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)} className="text-brand-600 text-sm hover:underline">
                            Today
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setWeekOffset((w) => w + 1)}
                    className="btn-ghost gap-1"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Schedule grid */}
            {isLoading ? (
                <div className="grid md:grid-cols-7 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="card p-4 h-48 animate-pulse bg-surface-100" />
                    ))}
                </div>
            ) : (
                <div className="grid md:grid-cols-7 gap-4">
                    {daysData.map(({ date, name, classes }) => {
                        const isToday = new Date().toDateString() === date.toDateString();
                        return (
                            <div
                                key={date.toISOString()}
                                className={`card ${isToday ? 'ring-2 ring-brand-500' : ''}`}
                            >
                                <div className={`p-3 border-b border-surface-100 ${isToday ? 'bg-brand-50' : 'bg-surface-50'}`}>
                                    <p className={`font-medium text-sm ${isToday ? 'text-brand-700' : 'text-surface-700'}`}>
                                        {name}
                                    </p>
                                    <p className="text-surface-500 text-xs">{formatDate(date.toISOString())}</p>
                                </div>
                                <div className="p-2 space-y-2 min-h-[150px]">
                                    {classes.length === 0 ? (
                                        <p className="text-surface-400 text-sm text-center py-8">No classes</p>
                                    ) : (
                                        classes.map((cls) => (
                                            <button
                                                key={cls.id}
                                                onClick={() => router.push(`/classes/${cls.id}`)}
                                                className="w-full text-left p-2 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
                                            >
                                                <p className="font-medium text-surface-900 text-sm">{cls.title}</p>
                                                <div className="flex items-center gap-2 mt-1 text-surface-500 text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(cls.startTime)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-surface-500 text-xs">
                                                    <User className="w-3 h-3" />
                                                    {cls.trainer?.fullName || 'No trainer'}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-surface-500 text-xs">
                                                    <Users className="w-3 h-3" />
                                                    {cls.attendeeCount}/{cls.capacity || '∞'}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
