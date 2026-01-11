export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface Payment {
    id: string;
    gymId: string;
    invoiceId: string;
    collectedByUserId: string;
    amountCents: number;
    method: PaymentMethod;
    note: string | null;
    idempotencyKey: string;
    collectedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CollectPaymentInput {
    invoiceId: string;
    amountCents: number;
    method: PaymentMethod;
    note?: string;
}

export interface PaymentWithDetails extends Payment {
    invoice: {
        id: string;
        amountCents: number;
        dueDate: Date;
    };
    member: {
        id: string;
        fullName: string;
    };
    collectedBy: {
        id: string;
        name: string;
    };
}
