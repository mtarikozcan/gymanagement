export type BillingPeriod = 'monthly' | 'weekly' | 'session_pack';

export interface Plan {
    id: string;
    gymId: string;
    name: string;
    billingPeriod: BillingPeriod;
    priceCents: number;
    currency: string;
    durationDays: number;
    isActive: boolean;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePlanInput {
    name: string;
    billingPeriod: BillingPeriod;
    priceCents: number;
    currency?: string;
    durationDays: number;
}

export interface UpdatePlanInput {
    name?: string;
    billingPeriod?: BillingPeriod;
    priceCents?: number;
    durationDays?: number;
    isActive?: boolean;
}
