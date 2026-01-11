export type AuditAction =
    | 'gym.created'
    | 'gym.updated'
    | 'user.invited'
    | 'user.suspended'
    | 'role.changed'
    | 'member.created'
    | 'member.updated'
    | 'member.deleted'
    | 'membership.created'
    | 'membership.renewed'
    | 'membership.frozen'
    | 'membership.expired'
    | 'invoice.created'
    | 'invoice.voided'
    | 'invoice.paid'
    | 'payment.collected'
    | 'class.created'
    | 'class.updated'
    | 'class.deleted'
    | 'attendance.marked'
    | 'trainer.created'
    | 'trainer.updated'
    | 'trainer.deleted'
    | 'plan.created'
    | 'plan.updated';

export type EntityType =
    | 'gym'
    | 'user'
    | 'member'
    | 'membership'
    | 'invoice'
    | 'payment'
    | 'class'
    | 'attendance'
    | 'trainer'
    | 'plan';

export interface AuditLog {
    id: string;
    gymId: string;
    actorUserId: string | null;
    action: AuditAction;
    entityType: EntityType;
    entityId: string | null;
    metadata: Record<string, unknown>;
    ipAddress: string | null;
    createdAt: Date;
}

export interface AuditLogWithActor extends AuditLog {
    actor: {
        id: string;
        name: string;
        email: string;
    } | null;
}

export interface AuditLogFilters {
    action?: AuditAction;
    entityType?: EntityType;
    entityId?: string;
    actorUserId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface CreateAuditLogInput {
    action: AuditAction;
    entityType: EntityType;
    entityId?: string;
    metadata?: Record<string, unknown>;
}
