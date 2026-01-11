import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { isRoleAtLeast } from '@pulsegym/shared';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userRole = request.session?.role as Role;

        if (!userRole) {
            throw new ForbiddenException('No role assigned');
        }

        // Check if user has any of the required roles or higher
        const hasRole = requiredRoles.some((role) => isRoleAtLeast(userRole, role));

        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
