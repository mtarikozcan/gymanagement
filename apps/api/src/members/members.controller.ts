import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CurrentGym } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberStatus } from '@prisma/client';

interface CreateMemberDto {
    fullName: string;
    phone?: string;
    email?: string;
    notes?: string;
    planId: string;
    startDate: string;
}

interface UpdateMemberDto {
    fullName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    status?: MemberStatus;
}

interface MemberFiltersDto {
    status?: MemberStatus;
    search?: string;
    hasOverdue?: string;
    planId?: string;
    page?: string;
    limit?: string;
}

@Controller('gyms/:gymId/members')
@UseGuards(RolesGuard)
export class MembersController {
    constructor(private membersService: MembersService) { }

    @Post()
    @Roles('staff')
    async create(
        @Param('gymId') gymId: string,
        @Body() dto: CreateMemberDto,
    ) {
        const result = await this.membersService.create(gymId, dto);
        return { success: true, ...result };
    }

    @Get()
    @Roles('viewer')
    async findAll(
        @Param('gymId') gymId: string,
        @Query() query: MemberFiltersDto,
    ) {
        const filters = {
            status: query.status,
            search: query.search,
            hasOverdue: query.hasOverdue === 'true',
            planId: query.planId,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
        };

        return this.membersService.findAll(gymId, filters);
    }

    @Get(':id')
    @Roles('viewer')
    async findOne(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const member = await this.membersService.findById(gymId, id);
        return { member };
    }

    @Patch(':id')
    @Roles('staff')
    async update(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: UpdateMemberDto,
    ) {
        const member = await this.membersService.update(gymId, id, dto);
        return { success: true, member };
    }

    @Delete(':id')
    @Roles('manager')
    async delete(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        return this.membersService.delete(gymId, id);
    }
}
