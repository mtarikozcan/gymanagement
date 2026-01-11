import { toast } from '@/components/ui/toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_PREFIX = '/api';

// Store for current gym context
let currentGymId: string | null = null;

export function setCurrentGymId(gymId: string | null) {
    currentGymId = gymId;
}

export function getCurrentGymId(): string | null {
    return currentGymId;
}

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public data?: any
    ) {
        super(data?.message || statusText);
        this.name = 'ApiError';
    }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: any;
    showErrorToast?: boolean;
}

async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { body, showErrorToast = true, ...init } = options;

    const config: RequestInit = {
        ...init,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...init.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${API_PREFIX}${endpoint}`, config);

    if (!response.ok) {
        let data;
        try {
            data = await response.json();
        } catch {
            data = { message: response.statusText };
        }

        const error = new ApiError(response.status, response.statusText, data);

        if (showErrorToast) {
            toast.error(data.message || 'An error occurred');
        }

        throw error;
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

// Helper to build gym-scoped paths
function gymPath(path: string): string {
    if (!currentGymId) {
        console.warn('No gymId set, API call may fail');
        return path;
    }
    return `/gyms/${currentGymId}${path}`;
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'POST', body }),

    patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PATCH', body }),

    put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'PUT', body }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Auth endpoints (not gym-scoped)
export const authApi = {
    login: (email: string, password: string) =>
        api.post<{ user: any; gym: any }>('/auth/login', { email, password }),

    logout: () =>
        api.post<void>('/auth/logout'),

    me: () =>
        api.get<{ user: any; gym: any } | null>('/auth/me', { showErrorToast: false }),

    register: (email: string, name: string, password: string) =>
        api.post<{ user: any }>('/auth/register', { email, name, password }),
};

// Members endpoints (gym-scoped)
export const membersApi = {
    list: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.search) searchParams.set('search', params.search);
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return api.get<{ members: any[]; pagination: any }>(gymPath(`/members${query ? `?${query}` : ''}`));
    },

    get: (id: string) =>
        api.get<any>(gymPath(`/members/${id}`)),

    create: (data: { fullName: string; phone?: string; email?: string; notes?: string }) =>
        api.post<any>(gymPath('/members'), data),

    update: (id: string, data: any) =>
        api.patch<any>(gymPath(`/members/${id}`), data),

    delete: (id: string) =>
        api.delete<void>(gymPath(`/members/${id}`)),
};

// Memberships endpoints (gym-scoped)
export const membershipsApi = {
    create: (data: { memberId: string; planId: string; startDate: string }) =>
        api.post<any>(gymPath('/memberships'), data),

    renew: (id: string, data: { planId: string; startDate: string }) =>
        api.post<any>(gymPath(`/memberships/${id}/renew`), data),

    freeze: (id: string) =>
        api.post<any>(gymPath(`/memberships/${id}/freeze`)),

    unfreeze: (id: string) =>
        api.post<any>(gymPath(`/memberships/${id}/unfreeze`)),
};

// Plans endpoints (gym-scoped)
export const plansApi = {
    list: (activeOnly = true) =>
        api.get<any[]>(gymPath(`/plans${activeOnly ? '?active=true' : ''}`)),

    get: (id: string) =>
        api.get<any>(gymPath(`/plans/${id}`)),

    create: (data: any) =>
        api.post<any>(gymPath('/plans'), data),

    update: (id: string, data: any) =>
        api.patch<any>(gymPath(`/plans/${id}`), data),
};

// Invoices endpoints (gym-scoped)
export const invoicesApi = {
    list: (params?: { status?: string; memberId?: string; page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.set('status', params.status);
        if (params?.memberId) searchParams.set('memberId', params.memberId);
        if (params?.page) searchParams.set('page', params.page.toString());
        const query = searchParams.toString();
        return api.get<{ invoices: any[]; pagination: any }>(gymPath(`/invoices${query ? `?${query}` : ''}`));
    },

    getOverdue: () =>
        api.get<{ invoices: any[] }>(gymPath('/invoices/overdue')),

    void: (id: string) =>
        api.post<any>(gymPath(`/invoices/${id}/void`)),
};

// Payments endpoints (gym-scoped)
export const paymentsApi = {
    list: (params?: { page?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        const query = searchParams.toString();
        return api.get<{ payments: any[]; pagination: any }>(gymPath(`/payments${query ? `?${query}` : ''}`));
    },

    collect: (data: { invoiceId: string; amountCents: number; method: string; note?: string }, idempotencyKey: string) =>
        api.post<any>(gymPath('/payments/collect'), data, {
            headers: { 'idempotency-key': idempotencyKey },
        }),
};

// Classes endpoints (gym-scoped)
export const classesApi = {
    getSchedule: (weekOffset = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + weekOffset * 7);
        const weekStart = date.toISOString().split('T')[0];
        return api.get<any>(gymPath(`/classes/schedule?weekStart=${weekStart}`));
    },

    get: (id: string) =>
        api.get<any>(gymPath(`/classes/${id}`)),

    create: (data: any) =>
        api.post<any>(gymPath('/classes'), data),

    update: (id: string, data: any) =>
        api.patch<any>(gymPath(`/classes/${id}`), data),

    delete: (id: string) =>
        api.delete<void>(gymPath(`/classes/${id}`)),

    markAttendance: (classId: string, memberId: string, status: string) =>
        api.post<any>(gymPath(`/classes/${classId}/attendance`), { memberId, status }),

    bulkMarkAttendance: (classId: string, records: { memberId: string; status: string }[]) =>
        api.post<any>(gymPath(`/classes/${classId}/attendance/bulk`), { attendees: records }),
};

// Trainers endpoints (gym-scoped)
export const trainersApi = {
    list: () =>
        api.get<{ trainers: any[] }>(gymPath('/trainers')),

    get: (id: string) =>
        api.get<any>(gymPath(`/trainers/${id}`)),

    create: (data: { fullName: string; phone?: string; email?: string; specialty?: string }) =>
        api.post<any>(gymPath('/trainers'), data),

    update: (id: string, data: any) =>
        api.patch<any>(gymPath(`/trainers/${id}`), data),

    delete: (id: string) =>
        api.delete<void>(gymPath(`/trainers/${id}`)),
};

// Gym / Stats endpoints (gym-scoped)
export const gymApi = {
    getStats: () =>
        api.get<any>(gymPath('/stats')),

    getActivityFeed: (limit = 10) =>
        api.get<{ logs: any[] }>(gymPath(`/audit?limit=${limit}`)),
};

// Reports endpoints (gym-scoped)
export const reportsApi = {
    getRevenue: (params?: { fromDate?: string; toDate?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.fromDate) searchParams.set('fromDate', params.fromDate);
        if (params?.toDate) searchParams.set('toDate', params.toDate);
        const query = searchParams.toString();
        return api.get<any>(gymPath(`/reports/revenue${query ? `?${query}` : ''}`));
    },

    getOverdue: () =>
        api.get<any>(gymPath('/reports/overdue')),

    getChurn: () =>
        api.get<any>(gymPath('/reports/churn')),

    getOccupancy: () =>
        api.get<any>(gymPath('/reports/occupancy')),
};

// Audit endpoints (gym-scoped)
export const auditApi = {
    list: (params?: { action?: string; entityType?: string; page?: number; limit?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.action) searchParams.set('action', params.action);
        if (params?.entityType) searchParams.set('entityType', params.entityType);
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        const query = searchParams.toString();
        return api.get<{ logs: any[]; pagination: any }>(gymPath(`/audit${query ? `?${query}` : ''}`));
    },

    getActionTypes: () =>
        api.get<{ actions: any[] }>(gymPath('/audit/actions')),

    getEntityTypes: () =>
        api.get<{ entities: any[] }>(gymPath('/audit/entities')),
};
