import { z } from 'zod';

export const memberStatusSchema = z.enum(['active', 'frozen', 'expired']);

export const createMemberSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  planId: z.string().uuid('Invalid plan'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const updateMemberSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  status: memberStatusSchema.optional(),
});

export const memberFiltersSchema = z.object({
  status: memberStatusSchema.optional(),
  search: z.string().max(100).optional(),
  hasOverdue: z.boolean().optional(),
  planId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateMemberSchema = z.infer<typeof createMemberSchema>;
export type UpdateMemberSchema = z.infer<typeof updateMemberSchema>;
export type MemberFiltersSchema = z.infer<typeof memberFiltersSchema>;
