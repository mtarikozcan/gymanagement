export type MemberStatus = 'active' | 'frozen' | 'expired';

export interface Member {
    id: string;
    gymId: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    status: MemberStatus;
    notes: string | null;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface CreateMemberInput {
    fullName: string;
    phone?: string;
    email?: string;
    notes?: string;
    planId: string;
    startDate: string;
}

export interface UpdateMemberInput {
    fullName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    status?: MemberStatus;
}

export interface MemberWithMembership extends Member {
    currentMembership?: {
        id: string;
        planName: string;
        startDate: Date;
        endDate: Date;
        status: string;
        nextDueDate: Date | null;
    };
    overdueAmount?: number;
}

export interface MemberFilters {
    status?: MemberStatus;
    search?: string;
    hasOverdue?: boolean;
    planId?: string;
}
