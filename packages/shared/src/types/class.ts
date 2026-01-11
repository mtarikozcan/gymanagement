export type AttendanceStatus = 'registered' | 'attended' | 'no_show' | 'cancelled';

export interface GymClass {
    id: string;
    gymId: string;
    title: string;
    trainerId: string | null;
    startTime: Date;
    endTime: Date;
    capacity: number | null;
    description: string | null;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface CreateClassInput {
    title: string;
    trainerId?: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    description?: string;
}

export interface UpdateClassInput {
    title?: string;
    trainerId?: string;
    startTime?: string;
    endTime?: string;
    capacity?: number;
    description?: string;
}

export interface ClassAttendance {
    id: string;
    gymId: string;
    classId: string;
    memberId: string;
    status: AttendanceStatus;
    markedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface MarkAttendanceInput {
    memberId: string;
    status: AttendanceStatus;
}

export interface ClassWithDetails extends GymClass {
    trainer: {
        id: string;
        fullName: string;
    } | null;
    attendees: number;
    registered: number;
}

export interface WeekSchedule {
    weekStart: Date;
    weekEnd: Date;
    days: {
        date: Date;
        dayName: string;
        classes: ClassWithDetails[];
    }[];
}
