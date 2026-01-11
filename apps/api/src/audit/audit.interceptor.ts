import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

// Routes that should be audited
const AUDIT_ROUTES: Record<string, { action: string; entityType: string }> = {
    'POST /api/gyms/:gymId/members': { action: 'member.created', entityType: 'member' },
    'PATCH /api/gyms/:gymId/members/:id': { action: 'member.updated', entityType: 'member' },
    'DELETE /api/gyms/:gymId/members/:id': { action: 'member.deleted', entityType: 'member' },
    'POST /api/gyms/:gymId/memberships/:id/renew': { action: 'membership.renewed', entityType: 'membership' },
    'POST /api/gyms/:gymId/memberships/:id/freeze': { action: 'membership.frozen', entityType: 'membership' },
    'POST /api/gyms/:gymId/payments/collect': { action: 'payment.collected', entityType: 'payment' },
    'POST /api/gyms/:gymId/invoices/:id/void': { action: 'invoice.voided', entityType: 'invoice' },
    'POST /api/gyms/:gymId/classes': { action: 'class.created', entityType: 'class' },
    'PATCH /api/gyms/:gymId/classes/:id': { action: 'class.updated', entityType: 'class' },
    'DELETE /api/gyms/:gymId/classes/:id': { action: 'class.deleted', entityType: 'class' },
    'POST /api/gyms/:gymId/classes/:id/attendance': { action: 'attendance.marked', entityType: 'attendance' },
    'POST /api/gyms/:gymId/trainers': { action: 'trainer.created', entityType: 'trainer' },
    'PATCH /api/gyms/:gymId/trainers/:id': { action: 'trainer.updated', entityType: 'trainer' },
    'DELETE /api/gyms/:gymId/trainers/:id': { action: 'trainer.deleted', entityType: 'trainer' },
    'POST /api/gyms/:gymId/plans': { action: 'plan.created', entityType: 'plan' },
    'PATCH /api/gyms/:gymId/plans/:id': { action: 'plan.updated', entityType: 'plan' },
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.route?.path || request.url;
        const routeKey = `${method} ${url}`;

        return next.handle().pipe(
            tap(async (response) => {
                try {
                    const auditConfig = AUDIT_ROUTES[routeKey];
                    if (!auditConfig) return;

                    const gymId = request.params.gymId || request.session?.gymId;
                    const userId = request.session?.userId;

                    if (!gymId) return;

                    // Extract entity ID from response or params
                    const entityId =
                        response?.member?.id ||
                        response?.membership?.id ||
                        response?.payment?.id ||
                        response?.invoice?.id ||
                        response?.class?.id ||
                        response?.trainer?.id ||
                        response?.plan?.id ||
                        response?.attendance?.id ||
                        request.params.id;

                    await this.auditService.log(
                        gymId,
                        userId,
                        {
                            action: auditConfig.action,
                            entityType: auditConfig.entityType,
                            entityId,
                            metadata: {
                                requestBody: this.sanitizeBody(request.body),
                                responseSuccess: response?.success,
                            },
                        },
                        request.ip
                    );
                } catch (error) {
                    // Don't fail the request if audit logging fails
                    console.error('Audit logging failed:', error);
                }
            })
        );
    }

    private sanitizeBody(body: any): any {
        if (!body) return {};
        const sanitized = { ...body };
        // Remove sensitive fields
        delete sanitized.password;
        delete sanitized.passwordHash;
        return sanitized;
    }
}
