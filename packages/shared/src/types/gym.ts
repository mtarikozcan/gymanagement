// Business model types for gym operations
export type BusinessModel = 'monthly' | 'pt' | 'class_based';

export interface Gym {
    id: string;
    name: string;
    city: string;
    businessModel: BusinessModel;
    isDemo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateGymInput {
    name: string;
    city: string;
    businessModel: BusinessModel;
}

export interface UpdateGymInput {
    name?: string;
    city?: string;
    businessModel?: BusinessModel;
}
