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
import { ClassesService } from './classes.service';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AttendanceStatus } from '@prisma/client';

interface CreateClassDto {
    title: string;
    trainerId?: string;
    startTime: string;
    endTime: string;
    capacity?: number;
    description?: string;
}

@Controller('gyms/:gymId/classes')
@UseGuards(RolesGuard)
export class ClassesController {
    constructor(private classesService: ClassesService) { }

    @Post()
    @Roles('staff')
    async create(
        @Param('gymId') gymId: string,
        @Body() dto: CreateClassDto,
    ) {
        const gymClass = await this.classesService.create(gymId, dto);
        return { success: true, class: gymClass };
    }

    @Get('schedule')
    @Roles('viewer')
    async getSchedule(
        @Param('gymId') gymId: string,
        @Query('weekStart') weekStart?: string,
    ) {
        const date = weekStart ? new Date(weekStart) : undefined;
        return this.classesService.getWeekSchedule(gymId, date);
    }

    @Get(':id')
    @Roles('viewer')
    async findOne(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const gymClass = await this.classesService.findById(gymId, id);
        return { class: gymClass };
    }

    @Patch(':id')
    @Roles('staff')
    async update(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: Partial<CreateClassDto>,
    ) {
        const gymClass = await this.classesService.update(gymId, id, dto);
        return { success: true, class: gymClass };
    }

    @Delete(':id')
    @Roles('manager')
    async delete(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        return this.classesService.delete(gymId, id);
    }

    @Post(':id/attendance')
    @Roles('staff')
    async markAttendance(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: { memberId: string; status: AttendanceStatus },
        @CurrentUser('id') userId: string,
    ) {
        const attendance = await this.classesService.markAttendance(gymId, id, dto, userId);
        return { success: true, attendance };
    }

    @Post(':id/attendance/bulk')
    @Roles('staff')
    async bulkMarkAttendance(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: { attendees: { memberId: string; status: AttendanceStatus }[] },
        @CurrentUser('id') userId: string,
    ) {
        const results = await this.classesService.bulkMarkAttendance(gymId, id, dto.attendees, userId);
        return { success: true, attendance: results };
    }
}
