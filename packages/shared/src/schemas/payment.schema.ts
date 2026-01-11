import { z } from 'zod';

export const paymentMethodSchema = z.enum(['cash', 'card', 'transfer', 'other']);

export const collectPaymentSchema = z.object({
    invoiceId: z.string().uuid('Invalid invoice'),
    amountCents: z.number().int().min(1, 'Amount must be positive'),
    method: paymentMethodSchema,
    note: z.string().max(200).optional(),
});

export const paymentFiltersSchema = z.object({
    method: paymentMethodSchema.optional(),
    fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CollectPaymentSchema = z.infer<typeof collectPaymentSchema>;
export type PaymentFiltersSchema = z.infer<typeof paymentFiltersSchema>;
