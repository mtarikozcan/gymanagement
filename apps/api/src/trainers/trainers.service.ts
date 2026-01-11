import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateTrainerDto {
    fullName: string;
    phone?: string;
    email?: string;
    specialty?: string;
}

@Injectable()
export class TrainersService {
    constructor(private prisma: PrismaService) { }

    async create(gymId: string, dto: CreateTrainerDto) {
        return this.prisma.trainer.create({
            data: {
                gymId,
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                specialty: dto.specialty,
            },
        });
    }

    async findAll(gymId: string) {
        const trainers = await this.prisma.trainer.findMany({
            where: {
                gymId,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: { classes: true },
                },
            },
            orderBy: { fullName: 'asc' },
        });

        // Get upcoming classes count
        const now = new Date();
        const trainersWithClasses = await Promise.all(
            trainers.map(async (trainer) => {
                const upcomingClasses = await this.prisma.class.count({
                    where: {
                        trainerId: trainer.id,
                        startTime: { gte: now },
                        deletedAt: null,
                    },
                });

                return {
                    ...trainer,
                    totalClasses: trainer._count.classes,
                    upcomingClasses,
                };
            })
        );

        return trainersWithClasses;
    }

    async findById(gymId: string, id: string) {
        const trainer = await this.prisma.trainer.findFirst({
            where: { id, gymId, deletedAt: null },
            include: {
                classes: {
                    where: { deletedAt: null },
                    orderBy: { startTime: 'desc' },
                    take: 20,
                },
            },
        });

        if (!trainer) {
            throw new NotFoundException('Trainer not found');
        }

        return trainer;
    }

    async update(gymId: string, id: string, dto: Partial<CreateTrainerDto>) {
        const trainer = await this.findById(gymId, id);

        return this.prisma.trainer.update({
            where: { id },
            data: dto,
        });
    }

    async delete(gymId: string, id: string) {
        const trainer = await this.findById(gymId, id);

        await this.prisma.trainer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { success: true };
    }
}
