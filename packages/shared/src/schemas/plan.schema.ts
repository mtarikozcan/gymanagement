import { z } from 'zod';

export const billingPeriodSchema = z.enum(['monthly', 'weekly', 'session_pack']);

export const createPlanSchema = z.object({
    name: z.string().min(2, 'Plan name must be at least 2 characters').max(50),
    billingPeriod: billingPeriodSchema,
    priceCents: z.number().int().min(0, 'Price must be positive'),
    currency: z.string().length(3).default('TRY'),
    durationDays: z.number().int().min(1, 'Duration must be at least 1 day').max(365),
});

export const updatePlanSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    billingPeriod: billingPeriodSchema.optional(),
    priceCents: z.number().int().min(0).optional(),
    durationDays: z.number().int().min(1).max(365).optional(),
    isActive: z.boolean().optional(),
});

export type CreatePlanSchema = z.infer<typeof createPlanSchema>;
export type UpdatePlanSchema = z.infer<typeof updatePlanSchema>;
