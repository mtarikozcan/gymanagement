import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessModel } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

interface CreateGymDto {
    name: string;
    city: string;
    businessModel: BusinessModel;
}

@Injectable()
export class GymsService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthService,
    ) { }

    async create(dto: CreateGymDto, userId: string) {
        // Create gym
        const gym = await this.prisma.gym.create({
            data: {
                name: dto.name,
                city: dto.city,
                businessModel: dto.businessModel,
            },
        });

        // Make user the owner
        await this.authService.createGymOwner(userId, gym.id);

        return gym;
    }

    async findById(id: string) {
        const gym = await this.prisma.gym.findUnique({
            where: { id },
        });

        if (!gym) {
            throw new NotFoundException('Gym not found');
        }

        return gym;
    }

    async update(id: string, data: Partial<CreateGymDto>) {
        const gym = await this.prisma.gym.update({
            where: { id },
            data,
        });

        return gym;
    }

    async getStats(gymId: string) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const [
            activeMembers,
            overdueInvoices,
            todayClasses,
            todayCheckIns,
        ] = await Promise.all([
            // Active members count
            this.prisma.member.count({
                where: {
                    gymId,
                    status: 'active',
                    deletedAt: null,
                },
            }),
            // Overdue invoices
            this.prisma.invoice.findMany({
                where: {
                    gymId,
                    status: 'due',
                    dueDate: { lt: now },
                },
                include: {
                    member: {
                        select: { id: true, fullName: true, phone: true },
                    },
                },
                orderBy: { dueDate: 'asc' },
                take: 10,
            }),
            // Today's classes
            this.prisma.class.findMany({
                where: {
                    gymId,
                    startTime: { gte: todayStart, lt: todayEnd },
                    deletedAt: null,
                },
                include: {
                    trainer: { select: { id: true, fullName: true } },
                    _count: { select: { attendance: true } },
                },
                orderBy: { startTime: 'asc' },
            }),
            // Today check-ins
            this.prisma.classAttendance.count({
                where: {
                    gymId,
                    status: 'attended',
                    updatedAt: { gte: todayStart, lt: todayEnd },
                },
            }),
        ]);

        // Calculate overdue total
        const overdueTotal = overdueInvoices.reduce(
            (sum, inv) => sum + inv.amountCents,
            0,
        );

        return {
            activeMembers,
            overdueCount: overdueInvoices.length,
            overdueTotal,
            overdueInvoices: overdueInvoices.slice(0, 5),
            todayClasses: todayClasses.length,
            todayClassesList: todayClasses,
            todayCheckIns,
        };
    }

    async getActivityFeed(gymId: string, limit = 10) {
        const logs = await this.prisma.auditLog.findMany({
            where: { gymId },
            include: {
                actor: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return logs;
    }

    async getUserGyms(userId: string) {
        const gymUsers = await this.prisma.gymUser.findMany({
            where: {
                userId,
                status: 'active',
            },
            include: {
                gym: true,
            },
        });

        return gymUsers.map((gu) => ({
            ...gu.gym,
            role: gu.role,
        }));
    }
}
