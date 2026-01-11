import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BillingPeriod } from '@prisma/client';

interface CreatePlanDto {
    name: string;
    billingPeriod: BillingPeriod;
    priceCents: number;
    currency?: string;
    durationDays: number;
}

@Controller('gyms/:gymId/plans')
@UseGuards(RolesGuard)
export class PlansController {
    constructor(private plansService: PlansService) { }

    @Post()
    @Roles('admin')
    async create(
        @Param('gymId') gymId: string,
        @Body() dto: CreatePlanDto,
    ) {
        const plan = await this.plansService.create(gymId, dto);
        return { success: true, plan };
    }

    @Get()
    @Roles('viewer')
    async findAll(
        @Param('gymId') gymId: string,
        @Query('all') all?: string,
    ) {
        const plans = await this.plansService.findAll(gymId, all !== 'true');
        return { plans };
    }

    @Get(':id')
    @Roles('viewer')
    async findOne(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const plan = await this.plansService.findById(gymId, id);
        return { plan };
    }

    @Patch(':id')
    @Roles('admin')
    async update(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: Partial<CreatePlanDto>,
    ) {
        const plan = await this.plansService.update(gymId, id, dto);
        return { success: true, plan };
    }
}
