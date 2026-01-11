export interface Trainer {
    id: string;
    gymId: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    specialty: string | null;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

export interface CreateTrainerInput {
    fullName: string;
    phone?: string;
    email?: string;
    specialty?: string;
}

export interface UpdateTrainerInput {
    fullName?: string;
    phone?: string;
    email?: string;
    specialty?: string;
}

export interface TrainerWithClasses extends Trainer {
    upcomingClasses: number;
    totalClasses: number;
}
