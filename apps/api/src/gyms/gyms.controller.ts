import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { GymsService } from './gyms.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, CurrentGym } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BusinessModel } from '@prisma/client';

interface CreateGymDto {
    name: string;
    city: string;
    businessModel: BusinessModel;
}

@Controller('gyms')
export class GymsController {
    constructor(private gymsService: GymsService) { }

    @Post()
    async create(
        @Body() dto: CreateGymDto,
        @CurrentUser('id') userId: string,
        @Req() req: Request,
    ) {
        const gym = await this.gymsService.create(dto, userId);

        // Update session
        (req.session as any).gymId = gym.id;
        (req.session as any).role = 'owner';

        return { success: true, gym };
    }

    @Get('mine')
    async getMyGyms(@CurrentUser('id') userId: string) {
        const gyms = await this.gymsService.getUserGyms(userId);
        return { gyms };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const gym = await this.gymsService.findById(id);
        return { gym };
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async update(
        @Param('id') id: string,
        @Body() dto: Partial<CreateGymDto>,
    ) {
        const gym = await this.gymsService.update(id, dto);
        return { success: true, gym };
    }

    @Get(':id/stats')
    async getStats(@Param('id') id: string) {
        const stats = await this.gymsService.getStats(id);
        return stats;
    }

    @Get(':id/activity')
    async getActivity(@Param('id') id: string) {
        const activity = await this.gymsService.getActivityFeed(id);
        return { activity };
    }
}
