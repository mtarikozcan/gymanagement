import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('gyms/:gymId/audit')
@UseGuards(RolesGuard)
export class AuditController {
    constructor(private auditService: AuditService) { }

    @Get()
    @Roles('admin')
    async findAll(
        @Param('gymId') gymId: string,
        @Query() query: {
            action?: string;
            entityType?: string;
            entityId?: string;
            actorUserId?: string;
            fromDate?: string;
            toDate?: string;
            page?: string;
            limit?: string;
        },
    ) {
        const filters = {
            action: query.action,
            entityType: query.entityType,
            entityId: query.entityId,
            actorUserId: query.actorUserId,
            fromDate: query.fromDate,
            toDate: query.toDate,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 50,
        };

        return this.auditService.findAll(gymId, filters);
    }

    @Get('actions')
    @Roles('admin')
    async getActionTypes(@Param('gymId') gymId: string) {
        const actions = await this.auditService.getActionTypes(gymId);
        return { actions };
    }

    @Get('entities')
    @Roles('admin')
    async getEntityTypes(@Param('gymId') gymId: string) {
        const entities = await this.auditService.getEntityTypes(gymId);
        return { entities };
    }
}
