export type MembershipStatus = 'active' | 'expired' | 'frozen';

export interface Membership {
    id: string;
    gymId: string;
    memberId: string;
    planId: string;
    startDate: Date;
    endDate: Date;
    status: MembershipStatus;
    nextDueDate: Date | null;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateMembershipInput {
    memberId: string;
    planId: string;
    startDate: string;
}

export interface RenewMembershipInput {
    planId?: string;
    startDate?: string;
}

export interface FreezeMembershipInput {
    reason?: string;
    resumeDate?: string;
}

export interface MembershipWithDetails extends Membership {
    member: {
        id: string;
        fullName: string;
    };
    plan: {
        id: string;
        name: string;
        priceCents: number;
    };
}
