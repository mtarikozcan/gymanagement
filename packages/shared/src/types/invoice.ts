export type InvoiceStatus = 'due' | 'paid' | 'void';

export interface Invoice {
    id: string;
    gymId: string;
    memberId: string;
    membershipId: string | null;
    amountCents: number;
    currency: string;
    dueDate: Date;
    status: InvoiceStatus;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateInvoiceInput {
    memberId: string;
    membershipId?: string;
    amountCents: number;
    currency?: string;
    dueDate: string;
}

export interface InvoiceWithMember extends Invoice {
    member: {
        id: string;
        fullName: string;
        phone: string | null;
    };
}

export interface InvoiceFilters {
    status?: InvoiceStatus;
    overdue?: boolean;
    memberId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface OverdueInvoice extends InvoiceWithMember {
    daysOverdue: number;
}
