import { z } from 'zod';

export const membershipStatusSchema = z.enum(['active', 'expired', 'frozen']);

export const createMembershipSchema = z.object({
    memberId: z.string().uuid('Invalid member'),
    planId: z.string().uuid('Invalid plan'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const renewMembershipSchema = z.object({
    planId: z.string().uuid().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const freezeMembershipSchema = z.object({
    reason: z.string().max(200).optional(),
    resumeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateMembershipSchema = z.infer<typeof createMembershipSchema>;
export type RenewMembershipSchema = z.infer<typeof renewMembershipSchema>;
export type FreezeMembershipSchema = z.infer<typeof freezeMembershipSchema>;
