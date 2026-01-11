import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission, type Permission } from '@pulsegym/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.session?.role as Role;

        if (!userRole) {
            throw new ForbiddenException('No role assigned');
        }

        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every((permission) =>
            hasPermission(userRole as any, permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
