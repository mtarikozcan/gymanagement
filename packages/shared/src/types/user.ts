import type { Role } from '../permissions/roles';

export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface GymUser {
    id: string;
    gymId: string;
    userId: string;
    role: Role;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    email: string;
    name: string;
    password: string;
}

export interface InviteUserInput {
    email: string;
    name: string;
    role: Role;
}
