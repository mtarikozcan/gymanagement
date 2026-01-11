import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    Headers,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaymentMethod } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface CollectPaymentDto {
    invoiceId: string;
    amountCents: number;
    method: PaymentMethod;
    note?: string;
}

@Controller('gyms/:gymId/payments')
@UseGuards(RolesGuard)
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('collect')
    @Roles('staff')
    async collect(
        @Param('gymId') gymId: string,
        @Body() dto: CollectPaymentDto,
        @CurrentUser('id') userId: string,
        @Headers('idempotency-key') idempotencyKey?: string,
    ) {
        // Generate idempotency key if not provided
        const key = idempotencyKey || uuidv4();

        const result = await this.paymentsService.collect(gymId, userId, dto, key);

        return {
            success: true,
            payment: result.payment,
            duplicate: result.duplicate,
        };
    }

    @Get()
    @Roles('staff')
    async findAll(
        @Param('gymId') gymId: string,
        @Query() query: {
            method?: PaymentMethod;
            fromDate?: string;
            toDate?: string;
            page?: string;
            limit?: string;
        },
    ) {
        const filters = {
            method: query.method,
            fromDate: query.fromDate,
            toDate: query.toDate,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
        };

        return this.paymentsService.findAll(gymId, filters);
    }
}
