import { z } from 'zod';

export const createTrainerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().max(20).optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    specialty: z.string().max(100).optional(),
});

export const updateTrainerSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    specialty: z.string().max(100).optional(),
});

export type CreateTrainerSchema = z.infer<typeof createTrainerSchema>;
export type UpdateTrainerSchema = z.infer<typeof updateTrainerSchema>;
