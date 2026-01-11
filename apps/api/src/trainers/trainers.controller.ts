import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

interface CreateTrainerDto {
    fullName: string;
    phone?: string;
    email?: string;
    specialty?: string;
}

@Controller('gyms/:gymId/trainers')
@UseGuards(RolesGuard)
export class TrainersController {
    constructor(private trainersService: TrainersService) { }

    @Post()
    @Roles('manager')
    async create(
        @Param('gymId') gymId: string,
        @Body() dto: CreateTrainerDto,
    ) {
        const trainer = await this.trainersService.create(gymId, dto);
        return { success: true, trainer };
    }

    @Get()
    @Roles('viewer')
    async findAll(@Param('gymId') gymId: string) {
        const trainers = await this.trainersService.findAll(gymId);
        return { trainers };
    }

    @Get(':id')
    @Roles('viewer')
    async findOne(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        const trainer = await this.trainersService.findById(gymId, id);
        return { trainer };
    }

    @Patch(':id')
    @Roles('manager')
    async update(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
        @Body() dto: Partial<CreateTrainerDto>,
    ) {
        const trainer = await this.trainersService.update(gymId, id, dto);
        return { success: true, trainer };
    }

    @Delete(':id')
    @Roles('manager')
    async delete(
        @Param('gymId') gymId: string,
        @Param('id') id: string,
    ) {
        return this.trainersService.delete(gymId, id);
    }
}
