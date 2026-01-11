import { z } from 'zod';

export const attendanceStatusSchema = z.enum(['registered', 'attended', 'no_show', 'cancelled']);

export const createClassSchema = z.object({
    title: z.string().min(2, 'Class title must be at least 2 characters').max(100),
    trainerId: z.string().uuid().optional(),
    startTime: z.string().datetime({ message: 'Invalid start time' }),
    endTime: z.string().datetime({ message: 'Invalid end time' }),
    capacity: z.number().int().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
});

export const updateClassSchema = z.object({
    title: z.string().min(2).max(100).optional(),
    trainerId: z.string().uuid().nullable().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    capacity: z.number().int().min(1).max(200).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
});

export const markAttendanceSchema = z.object({
    memberId: z.string().uuid('Invalid member'),
    status: attendanceStatusSchema,
});

export const bulkAttendanceSchema = z.object({
    attendees: z.array(z.object({
        memberId: z.string().uuid(),
        status: attendanceStatusSchema,
    })),
});

export type CreateClassSchema = z.infer<typeof createClassSchema>;
export type UpdateClassSchema = z.infer<typeof updateClassSchema>;
export type MarkAttendanceSchema = z.infer<typeof markAttendanceSchema>;
export type BulkAttendanceSchema = z.infer<typeof bulkAttendanceSchema>;
