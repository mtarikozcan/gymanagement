import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

interface CollectPaymentDto {
    invoiceId: string;
    amountCents: number;
    method: PaymentMethod;
    note?: string;
}

interface PaymentFilters {
    method?: PaymentMethod;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async collect(
        gymId: string,
        userId: string,
        dto: CollectPaymentDto,
        idempotencyKey: string
    ) {
        // Check for duplicate payment (idempotency)
        const existing = await this.prisma.payment.findUnique({
            where: { idempotencyKey },
        });

        if (existing) {
            // Return existing payment for idempotent request
            return { payment: existing, duplicate: true };
        }

        // Verify invoice exists and is due
        const invoice = await this.prisma.invoice.findFirst({
            where: { id: dto.invoiceId, gymId },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        if (invoice.status === 'paid') {
            throw new ConflictException('Invoice already paid');
        }

        if (invoice.status === 'void') {
            throw new ConflictException('Invoice is voided');
        }

        // Create payment and update invoice
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    gymId,
                    invoiceId: dto.invoiceId,
                    collectedByUserId: userId,
                    amountCents: dto.amountCents,
                    method: dto.method,
                    note: dto.note,
                    idempotencyKey,
                },
            });

            // Check if invoice is fully paid
            const totalPayments = await tx.payment.aggregate({
                where: { invoiceId: dto.invoiceId },
                _sum: { amountCents: true },
            });

            if ((totalPayments._sum.amountCents || 0) >= invoice.amountCents) {
                await tx.invoice.update({
                    where: { id: dto.invoiceId },
                    data: { status: 'paid' },
                });
            }

            return payment;
        });

        return { payment: result, duplicate: false };
    }

    async findAll(gymId: string, filters: PaymentFilters = {}) {
        const { method, fromDate, toDate, page = 1, limit = 20 } = filters;

        const where: any = { gymId };

        if (method) {
            where.method = method;
        }

        if (fromDate || toDate) {
            where.collectedAt = {
                ...(fromDate ? { gte: new Date(fromDate) } : {}),
                ...(toDate ? { lte: new Date(toDate) } : {}),
            };
        }

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    invoice: {
                        include: {
                            member: {
                                select: { id: true, fullName: true },
                            },
                        },
                    },
                    collectedBy: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { collectedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getRevenueStats(gymId: string, fromDate: Date, toDate: Date) {
        const payments = await this.prisma.payment.groupBy({
            by: ['method'],
            where: {
                gymId,
                collectedAt: {
                    gte: fromDate,
                    lte: toDate,
                },
            },
            _sum: {
                amountCents: true,
            },
            _count: true,
        });

        const total = payments.reduce(
            (sum, p) => sum + (p._sum.amountCents || 0),
            0
        );

        return {
            total,
            byMethod: payments.map((p) => ({
                method: p.method,
                amount: p._sum.amountCents || 0,
                count: p._count,
            })),
        };
    }
}
