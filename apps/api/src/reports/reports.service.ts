import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getRevenueSummary(gymId: string, fromDate: Date, toDate: Date) {
        const payments = await this.prisma.payment.findMany({
            where: {
                gymId,
                collectedAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            include: {
                invoice: {
                    include: {
                        membership: {
                            include: { plan: true },
                        },
                    },
                },
            },
        });

        // Group by date
        const byDate: Record<string, number> = {};
        const byMethod: Record<string, number> = {};
        const byPlan: Record<string, { name: string; amount: number }> = {};

        let total = 0;

        for (const payment of payments) {
            const dateKey = new Date(payment.collectedAt).toISOString().split('T')[0];
            byDate[dateKey] = (byDate[dateKey] || 0) + payment.amountCents;
            byMethod[payment.method] = (byMethod[payment.method] || 0) + payment.amountCents;
            total += payment.amountCents;

            if (payment.invoice.membership?.plan) {
                const planId = payment.invoice.membership.plan.id;
                if (!byPlan[planId]) {
                    byPlan[planId] = { name: payment.invoice.membership.plan.name, amount: 0 };
                }
                byPlan[planId].amount += payment.amountCents;
            }
        }

        return {
            total,
            count: payments.length,
            byDate: Object.entries(byDate).map(([date, amount]) => ({ date, amount })),
            byMethod: Object.entries(byMethod).map(([method, amount]) => ({ method, amount })),
            byPlan: Object.values(byPlan),
        };
    }

    async getOverdueSummary(gymId: string) {
        const now = new Date();

        const invoices = await this.prisma.invoice.findMany({
            where: {
                gymId,
                status: 'due',
                dueDate: { lt: now },
            },
            include: {
                member: { select: { id: true, fullName: true } },
            },
        });

        const total = invoices.reduce((sum, inv) => sum + inv.amountCents, 0);

        // Group by age
        const byAge = {
            '1-7days': { count: 0, amount: 0 },
            '8-14days': { count: 0, amount: 0 },
            '15-30days': { count: 0, amount: 0 },
            '30+days': { count: 0, amount: 0 },
        };

        for (const inv of invoices) {
            const daysOverdue = Math.floor(
                (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysOverdue <= 7) {
                byAge['1-7days'].count++;
                byAge['1-7days'].amount += inv.amountCents;
            } else if (daysOverdue <= 14) {
                byAge['8-14days'].count++;
                byAge['8-14days'].amount += inv.amountCents;
            } else if (daysOverdue <= 30) {
                byAge['15-30days'].count++;
                byAge['15-30days'].amount += inv.amountCents;
            } else {
                byAge['30+days'].count++;
                byAge['30+days'].amount += inv.amountCents;
            }
        }

        return {
            total,
            count: invoices.length,
            byAge: Object.entries(byAge).map(([range, data]) => ({ range, ...data })),
            topOverdue: invoices.slice(0, 10),
        };
    }

    async getMembershipChurn(gymId: string, months = 6) {
        const results = [];
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const [expired, renewed, newMembers] = await Promise.all([
                // Expired memberships
                this.prisma.membership.count({
                    where: {
                        gymId,
                        endDate: { gte: monthStart, lte: monthEnd },
                        status: 'expired',
                    },
                }),
                // Renewed memberships
                this.prisma.membership.count({
                    where: {
                        gymId,
                        updatedAt: { gte: monthStart, lte: monthEnd },
                        status: 'active',
                    },
                }),
                // New members
                this.prisma.member.count({
                    where: {
                        gymId,
                        createdAt: { gte: monthStart, lte: monthEnd },
                    },
                }),
            ]);

            results.push({
                month: monthStart.toISOString().substring(0, 7),
                expired,
                renewed,
                newMembers,
                churnRate: expired > 0 && renewed > 0 ? (expired / (expired + renewed)) * 100 : 0,
            });
        }

        return results.reverse();
    }

    async getClassOccupancy(gymId: string, fromDate: Date, toDate: Date) {
        const classes = await this.prisma.class.findMany({
            where: {
                gymId,
                startTime: { gte: fromDate, lte: toDate },
                deletedAt: null,
            },
            include: {
                trainer: { select: { id: true, fullName: true } },
                _count: { select: { attendance: true } },
            },
        });

        const classesWithOccupancy = classes.map((c) => ({
            id: c.id,
            title: c.title,
            trainer: c.trainer,
            startTime: c.startTime,
            capacity: c.capacity,
            attendees: c._count.attendance,
            occupancy: c.capacity ? (c._count.attendance / c.capacity) * 100 : null,
        }));

        // Average occupancy
        const classesWithCapacity = classesWithOccupancy.filter((c) => c.capacity);
        const avgOccupancy =
            classesWithCapacity.length > 0
                ? classesWithCapacity.reduce((sum, c) => sum + (c.occupancy || 0), 0) /
                classesWithCapacity.length
                : 0;

        return {
            classes: classesWithOccupancy,
            totalClasses: classes.length,
            avgOccupancy,
        };
    }
}
