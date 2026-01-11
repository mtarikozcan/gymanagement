import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAuditLogInput {
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
}

interface AuditLogFilters {
    action?: string;
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(
        gymId: string,
        actorUserId: string | null,
        input: CreateAuditLogInput,
        ipAddress?: string
    ) {
        return this.prisma.auditLog.create({
            data: {
                gymId,
                actorUserId,
                action: input.action,
                entityType: input.entityType,
                entityId: input.entityId,
                metadata: (input.metadata || {}) as any,
                ipAddress,
            },
        });
    }

    async findAll(gymId: string, filters: AuditLogFilters = {}) {
        const {
            action,
            entityType,
            entityId,
            actorUserId,
            fromDate,
            toDate,
            page = 1,
            limit = 50,
        } = filters;

        const where: any = { gymId };

        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (actorUserId) where.actorUserId = actorUserId;

        if (fromDate || toDate) {
            where.createdAt = {
                ...(fromDate ? { gte: new Date(fromDate) } : {}),
                ...(toDate ? { lte: new Date(toDate) } : {}),
            };
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    actor: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getActionTypes(gymId: string) {
        const actions = await this.prisma.auditLog.groupBy({
            by: ['action'],
            where: { gymId },
            _count: true,
        });

        return actions.map((a: { action: string; _count: number }) => ({
            action: a.action,
            count: a._count,
        }));
    }

    async getEntityTypes(gymId: string) {
        const entities = await this.prisma.auditLog.groupBy({
            by: ['entityType'],
            where: { gymId },
            _count: true,
        });

        return entities.map((e: { entityType: string; _count: number }) => ({
            entityType: e.entityType,
            count: e._count,
        }));
    }
}
