import { z } from 'zod';

export const invoiceStatusSchema = z.enum(['due', 'paid', 'void']);

export const createInvoiceSchema = z.object({
    memberId: z.string().uuid('Invalid member'),
    membershipId: z.string().uuid().optional(),
    amountCents: z.number().int().min(1, 'Amount must be positive'),
    currency: z.string().length(3).default('TRY'),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const invoiceFiltersSchema = z.object({
    status: invoiceStatusSchema.optional(),
    overdue: z.boolean().optional(),
    memberId: z.string().uuid().optional(),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInvoiceSchema = z.infer<typeof createInvoiceSchema>;
export type InvoiceFiltersSchema = z.infer<typeof invoiceFiltersSchema>;
