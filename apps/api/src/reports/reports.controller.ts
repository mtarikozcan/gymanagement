import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('gyms/:gymId/reports')
@UseGuards(RolesGuard)
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('revenue')
    @Roles('manager')
    async getRevenue(
        @Param('gymId') gymId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const now = new Date();
        const fromDate = from
            ? new Date(from)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const toDate = to ? new Date(to) : now;

        return this.reportsService.getRevenueSummary(gymId, fromDate, toDate);
    }

    @Get('overdue')
    @Roles('manager')
    async getOverdue(@Param('gymId') gymId: string) {
        return this.reportsService.getOverdueSummary(gymId);
    }

    @Get('churn')
    @Roles('manager')
    async getChurn(
        @Param('gymId') gymId: string,
        @Query('months') months?: string,
    ) {
        const monthCount = months ? parseInt(months) : 6;
        return this.reportsService.getMembershipChurn(gymId, monthCount);
    }

    @Get('occupancy')
    @Roles('manager')
    async getOccupancy(
        @Param('gymId') gymId: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const now = new Date();
        const fromDate = from
            ? new Date(from)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const toDate = to ? new Date(to) : now;

        return this.reportsService.getClassOccupancy(gymId, fromDate, toDate);
    }
}
