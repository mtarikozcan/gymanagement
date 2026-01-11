import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillingPeriod } from '@prisma/client';

interface CreatePlanDto {
    name: string;
    billingPeriod: BillingPeriod;
    priceCents: number;
    currency?: string;
    durationDays: number;
}

interface UpdatePlanDto {
    name?: string;
    billingPeriod?: BillingPeriod;
    priceCents?: number;
    durationDays?: number;
    isActive?: boolean;
}

@Injectable()
export class PlansService {
    constructor(private prisma: PrismaService) { }

    async create(gymId: string, dto: CreatePlanDto) {
        return this.prisma.plan.create({
            data: {
                gymId,
                name: dto.name,
                billingPeriod: dto.billingPeriod,
                priceCents: dto.priceCents,
                currency: dto.currency || 'TRY',
                durationDays: dto.durationDays,
            },
        });
    }

    async findAll(gymId: string, activeOnly = true) {
        return this.prisma.plan.findMany({
            where: {
                gymId,
                ...(activeOnly ? { isActive: true } : {}),
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async findById(gymId: string, id: string) {
        const plan = await this.prisma.plan.findFirst({
            where: { id, gymId },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        return plan;
    }

    async update(gymId: string, id: string, dto: UpdatePlanDto) {
        const plan = await this.findById(gymId, id);

        return this.prisma.plan.update({
            where: { id },
            data: dto,
        });
    }
}
