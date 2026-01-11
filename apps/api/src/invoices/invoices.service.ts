import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

interface InvoiceFilters {
    status?: InvoiceStatus;
    overdue?: boolean;
    memberId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    async findAll(gymId: string, filters: InvoiceFilters = {}) {
        const { status, overdue, memberId, fromDate, toDate, page = 1, limit = 20 } = filters;

        const where: any = { gymId };

        if (status) {
            where.status = status;
        }

        if (overdue) {
            where.status = 'due';
            where.dueDate = { lt: new Date() };
        }

        if (memberId) {
            where.memberId = memberId;
        }

        if (fromDate || toDate) {
            where.dueDate = {
                ...(fromDate ? { gte: new Date(fromDate) } : {}),
                ...(toDate ? { lte: new Date(toDate) } : {}),
            };
        }

        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: {
                    member: {
                        select: { id: true, fullName: true, phone: true },
                    },
                    payments: true,
                },
                orderBy: { dueDate: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.invoice.count({ where }),
        ]);

        // Calculate overdue info
        const now = new Date();
        const invoicesWithOverdue = invoices.map((inv) => ({
            ...inv,
            daysOverdue:
                inv.status === 'due' && new Date(inv.dueDate) < now
                    ? Math.floor(
                        (now.getTime() - new Date(inv.dueDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    : 0,
            paidAmount: inv.payments.reduce((sum, p) => sum + p.amountCents, 0),
        }));

        return {
            invoices: invoicesWithOverdue,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getOverdueQueue(gymId: string, limit = 10) {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                gymId,
                status: 'due',
                dueDate: { lt: new Date() },
            },
            include: {
                member: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
            orderBy: { dueDate: 'asc' },
            take: limit,
        });

        const now = new Date();
        return invoices.map((inv) => ({
            ...inv,
            daysOverdue: Math.floor(
                (now.getTime() - new Date(inv.dueDate).getTime()) /
                (1000 * 60 * 60 * 24)
            ),
        }));
    }

    async findById(gymId: string, id: string) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, gymId },
            include: {
                member: true,
                payments: {
                    include: {
                        collectedBy: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return invoice;
    }

    async void(gymId: string, id: string) {
        const invoice = await this.findById(gymId, id);

        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'void' },
        });

        return updated;
    }
}
