import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    gymId?: string;
    role?: Role;
}

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async register(email: string, name: string, password: string): Promise<SessionUser> {
        // Check if user exists
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }

    async login(email: string, password: string): Promise<SessionUser> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                gymUsers: {
                    where: { status: 'active' },
                    take: 1,
                },
            },
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const gymUser = user.gymUsers[0];

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            gymId: gymUser?.gymId,
            role: gymUser?.role,
        };
    }

    async getUser(userId: string): Promise<SessionUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                gymUsers: {
                    where: { status: 'active' },
                    take: 1,
                },
            },
        });

        if (!user) return null;

        const gymUser = user.gymUsers[0];

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            gymId: gymUser?.gymId,
            role: gymUser?.role,
        };
    }

    async getUserWithGym(userId: string, gymId: string) {
        const gymUser = await this.prisma.gymUser.findUnique({
            where: {
                gymId_userId: { gymId, userId },
            },
            include: {
                user: true,
                gym: true,
            },
        });

        return gymUser;
    }

    async createGymOwner(userId: string, gymId: string): Promise<void> {
        await this.prisma.gymUser.create({
            data: {
                userId,
                gymId,
                role: 'owner',
                status: 'active',
            },
        });
    }

    async switchGym(userId: string, gymId: string): Promise<SessionUser | null> {
        const gymUser = await this.prisma.gymUser.findUnique({
            where: {
                gymId_userId: { gymId, userId },
            },
            include: {
                user: true,
            },
        });

        if (!gymUser || gymUser.status !== 'active') {
            return null;
        }

        return {
            id: gymUser.user.id,
            email: gymUser.user.email,
            name: gymUser.user.name,
            gymId: gymUser.gymId,
            role: gymUser.role,
        };
    }
}
