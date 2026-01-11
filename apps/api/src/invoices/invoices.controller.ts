import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InvoiceStatus } from '@prisma/client';

@Controller('gyms/:gymId/invoices')
@UseGuards(RolesGuard)
export class InvoicesController {
    constructor(private invoicesService: InvoicesService) { }

    @Get()
    @Roles('staff')
    async findAll(
        @Param('gymId') gymId: string,
        @Query() query: {
            status?: InvoiceStatus;
            overdue?: string;
            memberId?: string;
            fromDate?: string;
            toDate?: string;
            page?: string;
            limit?: string;
        },
    ) {
        const filters = {
            status: query.status,
            overdue: query.overdue === 'true',
            memberId: query.memberId,
            fromDate: query.fromDate,
            toDate: query.toDate,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
        };

        return this.invoicesService.findAll(gymId, filters);
    }

    @Get('overdue')
    @Roles('staff')
    async getOverdue(@Param('gymId') gymId: string) {
        const invoices = await this.invoicesService.getOverdueQueue(gymId);
        return { invoices };
    }

    @Get(':id')
    @Roles('staff')
    async findOne(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const invoice = await this.invoicesService.findById(gymId, id);
        return { invoice };
    }

    @Post(':id/void')
    @Roles('manager')
    async void(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const invoice = await this.invoicesService.void(gymId, id);
        return { success: true, invoice };
    }
}
