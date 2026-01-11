import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberStatus } from '@prisma/client';

interface CreateMemberDto {
    fullName: string;
    phone?: string;
    email?: string;
    notes?: string;
    planId: string;
    startDate: string;
}

interface UpdateMemberDto {
    fullName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    status?: MemberStatus;
}

interface MemberFilters {
    status?: MemberStatus;
    search?: string;
    hasOverdue?: boolean;
    planId?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class MembersService {
    constructor(private prisma: PrismaService) { }

    async create(gymId: string, dto: CreateMemberDto) {
        // Get the plan to calculate end date
        const plan = await this.prisma.plan.findUnique({
            where: { id: dto.planId },
        });

        if (!plan) {
            throw new NotFoundException('Plan not found');
        }

        const startDate = new Date(dto.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);

        // Create member and membership in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const member = await tx.member.create({
                data: {
                    gymId,
                    fullName: dto.fullName,
                    phone: dto.phone,
                    email: dto.email,
                    notes: dto.notes,
                    status: 'active',
                },
            });

            const membership = await tx.membership.create({
                data: {
                    gymId,
                    memberId: member.id,
                    planId: dto.planId,
                    startDate,
                    endDate,
                    status: 'active',
                    nextDueDate: endDate,
                },
            });

            // Create first invoice
            const invoice = await tx.invoice.create({
                data: {
                    gymId,
                    memberId: member.id,
                    membershipId: membership.id,
                    amountCents: plan.priceCents,
                    currency: plan.currency,
                    dueDate: startDate,
                    status: 'due',
                },
            });

            return { member, membership, invoice };
        });

        return result;
    }

    async findAll(gymId: string, filters: MemberFilters = {}) {
        const { status, search, hasOverdue, planId, page = 1, limit = 20 } = filters;

        const where: any = {
            gymId,
            deletedAt: null,
        };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [members, total] = await Promise.all([
            this.prisma.member.findMany({
                where,
                include: {
                    memberships: {
                        where: { status: 'active' },
                        include: { plan: true },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                    invoices: {
                        where: { status: 'due' },
                        select: { amountCents: true, dueDate: true },
                    },
                },
                orderBy: { fullName: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.member.count({ where }),
        ]);

        // Map to include current membership and overdue info
        const membersWithDetails = members.map((member) => {
            const currentMembership = member.memberships[0];
            const overdueInvoices = member.invoices.filter(
                (inv) => new Date(inv.dueDate) < new Date()
            );
            const overdueAmount = overdueInvoices.reduce(
                (sum, inv) => sum + inv.amountCents,
                0
            );

            return {
                id: member.id,
                fullName: member.fullName,
                phone: member.phone,
                email: member.email,
                status: member.status,
                createdAt: member.createdAt,
                currentMembership: currentMembership
                    ? {
                        id: currentMembership.id,
                        planName: currentMembership.plan.name,
                        startDate: currentMembership.startDate,
                        endDate: currentMembership.endDate,
                        status: currentMembership.status,
                    }
                    : null,
                overdueAmount,
                hasOverdue: overdueAmount > 0,
            };
        });

        // Filter by overdue if requested
        const filteredMembers = hasOverdue
            ? membersWithDetails.filter((m) => m.hasOverdue)
            : membersWithDetails;

        return {
            members: filteredMembers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findById(gymId: string, id: string) {
        const member = await this.prisma.member.findFirst({
            where: { id, gymId, deletedAt: null },
            include: {
                memberships: {
                    include: { plan: true },
                    orderBy: { createdAt: 'desc' },
                },
                invoices: {
                    include: {
                        payments: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                classAttendance: {
                    include: {
                        class: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        return member;
    }

    async update(gymId: string, id: string, dto: UpdateMemberDto) {
        const member = await this.prisma.member.findFirst({
            where: { id, gymId, deletedAt: null },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        const updated = await this.prisma.member.update({
            where: { id },
            data: dto,
        });

        return updated;
    }

    async delete(gymId: string, id: string) {
        const member = await this.prisma.member.findFirst({
            where: { id, gymId, deletedAt: null },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        // Soft delete
        await this.prisma.member.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                status: 'expired',
            },
        });

        return { success: true };
    }
}
