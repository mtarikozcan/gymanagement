import {
    Controller,
    Post,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('gyms/:gymId/memberships')
@UseGuards(RolesGuard)
export class MembershipsController {
    constructor(private membershipsService: MembershipsService) { }

    @Post(':id/renew')
    @Roles('staff')
    async renew(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: { planId?: string; startDate?: string },
    ) {
        const result = await this.membershipsService.renew(gymId, id, dto);
        return { success: true, ...result };
    }

    @Post(':id/freeze')
    @Roles('staff')
    async freeze(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: { reason?: string; resumeDate?: string },
    ) {
        const membership = await this.membershipsService.freeze(gymId, id, dto);
        return { success: true, membership };
    }

    @Post(':id/unfreeze')
    @Roles('staff')
    async unfreeze(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const membership = await this.membershipsService.unfreeze(gymId, id);
        return { success: true, membership };
    }
}
