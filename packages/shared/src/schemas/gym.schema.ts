import { z } from 'zod';

export const businessModelSchema = z.enum(['monthly', 'pt', 'class_based']);

export const createGymSchema = z.object({
    name: z.string().min(2, 'Gym name must be at least 2 characters').max(100),
    city: z.string().min(2, 'City must be at least 2 characters').max(100),
    businessModel: businessModelSchema,
});

export const updateGymSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(100).optional(),
    businessModel: businessModelSchema.optional(),
});

export type CreateGymSchema = z.infer<typeof createGymSchema>;
export type UpdateGymSchema = z.infer<typeof updateGymSchema>;
