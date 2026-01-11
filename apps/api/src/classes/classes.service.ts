import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

interface CreateClassDto {
    title: string;
    trainerId?: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    description?: string;
}

interface MarkAttendanceDto {
    memberId: string;
    status: AttendanceStatus;
}

@Injectable()
export class ClassesService {
    constructor(private prisma: PrismaService) { }

    async create(gymId: string, dto: CreateClassDto) {
        return this.prisma.class.create({
            data: {
                gymId,
                title: dto.title,
                trainerId: dto.trainerId,
                startTime: new Date(dto.startTime),
                endTime: new Date(dto.endTime),
                capacity: dto.capacity,
                description: dto.description,
            },
            include: {
                trainer: { select: { id: true, fullName: true } },
            },
        });
    }

    async getWeekSchedule(gymId: string, weekStart?: Date) {
        const start = weekStart || this.getWeekStart(new Date());
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        const classes = await this.prisma.class.findMany({
            where: {
                gymId,
                startTime: { gte: start, lt: end },
                deletedAt: null,
            },
            include: {
                trainer: { select: { id: true, fullName: true } },
                _count: { select: { attendance: true } },
            },
            orderBy: { startTime: 'asc' },
        });

        // Group by day
        const days: { date: Date; dayName: string; classes: any[] }[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);

            const dayClasses = classes.filter((c) => {
                const classDate = new Date(c.startTime);
                return classDate.toDateString() === date.toDateString();
            });

            days.push({
                date,
                dayName: dayNames[date.getDay()],
                classes: dayClasses.map((c) => ({
                    ...c,
                    attendees: c._count.attendance,
                })),
            });
        }

        return {
            weekStart: start,
            weekEnd: end,
            days,
        };
    }

    async findById(gymId: string, id: string) {
        const gymClass = await this.prisma.class.findFirst({
            where: { id, gymId, deletedAt: null },
            include: {
                trainer: true,
                attendance: {
                    include: {
                        member: { select: { id: true, fullName: true } },
                        markedBy: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!gymClass) {
            throw new NotFoundException('Class not found');
        }

        return gymClass;
    }

    async update(gymId: string, id: string, dto: Partial<CreateClassDto>) {
        await this.findById(gymId, id);

        return this.prisma.class.update({
            where: { id },
            data: {
                title: dto.title,
                trainerId: dto.trainerId,
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                capacity: dto.capacity,
                description: dto.description,
            },
            include: {
                trainer: { select: { id: true, fullName: true } },
            },
        });
    }

    async delete(gymId: string, id: string) {
        await this.findById(gymId, id);

        await this.prisma.class.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { success: true };
    }

    async markAttendance(gymId: string, classId: string, dto: MarkAttendanceDto, userId: string) {
        const gymClass = await this.findById(gymId, classId);

        // Check capacity if registering
        if (dto.status === 'registered' && gymClass.capacity) {
            const registered = gymClass.attendance.filter(
                (a) => a.status === 'registered' || a.status === 'attended'
            ).length;

            if (registered >= gymClass.capacity) {
                throw new ConflictException('Class is at capacity');
            }
        }

        // Upsert attendance
        const attendance = await this.prisma.classAttendance.upsert({
            where: {
                classId_memberId: {
                    classId,
                    memberId: dto.memberId,
                },
            },
            create: {
                gymId,
                classId,
                memberId: dto.memberId,
                status: dto.status,
                markedByUserId: userId,
            },
            update: {
                status: dto.status,
                markedByUserId: userId,
            },
            include: {
                member: { select: { id: true, fullName: true } },
            },
        });

        return attendance;
    }

    async bulkMarkAttendance(
        gymId: string,
        classId: string,
        attendees: MarkAttendanceDto[],
        userId: string
    ) {
        await this.findById(gymId, classId);

        const results = await Promise.all(
            attendees.map((dto) => this.markAttendance(gymId, classId, dto, userId))
        );

        return results;
    }

    private getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }
}
