import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RenewMembershipDto {
    planId?: string;
    startDate?: string;
}

interface FreezeMembershipDto {
    reason?: string;
    resumeDate?: string;
}

@Injectable()
export class MembershipsService {
    constructor(private prisma: PrismaService) { }

    async renew(gymId: string, membershipId: string, dto: RenewMembershipDto) {
        const membership = await this.prisma.membership.findFirst({
            where: { id: membershipId, gymId },
            include: { plan: true, member: true },
        });

        if (!membership) {
            throw new NotFoundException('Membership not found');
        }

        const plan = dto.planId
            ? await this.prisma.plan.findUnique({ where: { id: dto.planId } })
            : membership.plan;

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        const startDate = dto.startDate
            ? new Date(dto.startDate)
            : new Date(membership.endDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        const result = await this.prisma.$transaction(async (tx) => {
            // Update current membership
            const updated = await tx.membership.update({
                where: { id: membershipId },
                data: {
                    planId: plan.id,
                    startDate,
                    endDate,
                    status: 'active',
                    nextDueDate: endDate,
                },
            });

            // Update member status
            await tx.member.update({
                where: { id: membership.memberId },
                data: { status: 'active' },
            });

            // Create renewal invoice
            const invoice = await tx.invoice.create({
                data: {
                    gymId,
                    memberId: membership.memberId,
                    membershipId,
                    amountCents: plan.priceCents,
                    currency: plan.currency,
                    dueDate: startDate,
                    status: 'due',
                },
            });

            return { membership: updated, invoice };
        });

        return result;
    }

    async freeze(gymId: string, membershipId: string, dto: FreezeMembershipDto) {
        const membership = await this.prisma.membership.findFirst({
            where: { id: membershipId, gymId },
        });

        if (!membership) {
            throw new NotFoundException('Membership not found');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.membership.update({
                where: { id: membershipId },
                data: { status: 'frozen' },
            });

            await tx.member.update({
                where: { id: membership.memberId },
                data: { status: 'frozen' },
            });

            return updated;
        });

        return result;
    }

    async unfreeze(gymId: string, membershipId: string) {
        const membership = await this.prisma.membership.findFirst({
            where: { id: membershipId, gymId, status: 'frozen' },
        });

        if (!membership) {
            throw new NotFoundException('Frozen membership not found');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.membership.update({
                where: { id: membershipId },
                data: { status: 'active' },
            });

            await tx.member.update({
                where: { id: membership.memberId },
                data: { status: 'active' },
            });

            return updated;
        });

        return result;
    }
}
