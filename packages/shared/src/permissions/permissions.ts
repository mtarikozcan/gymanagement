// Permission definitions for PulseGym RBAC

import type { Role } from './roles';

export const PERMISSIONS = [
    // Dashboard
    'dashboard.view',
    'dashboard.view_full',

    // Members
    'members.view',
    'members.create',
    'members.update',
    'members.delete',

    // Memberships
    'memberships.view',
    'memberships.create',
    'memberships.renew',
    'memberships.freeze',

    // Payments
    'payments.view',
    'payments.collect',
    'payments.export',
    'payments.void',

    // Invoices
    'invoices.view',
    'invoices.create',
    'invoices.void',

    // Classes
    'classes.view',
    'classes.create',
    'classes.update',
    'classes.delete',
    'classes.view_own',

    // Attendance
    'attendance.view',
    'attendance.mark',
    'attendance.mark_own',

    // Trainers
    'trainers.view',
    'trainers.create',
    'trainers.update',
    'trainers.delete',

    // Reports
    'reports.view',
    'reports.view_limited',
    'reports.export',

    // Settings
    'settings.view',
    'settings.update',
    'settings.gym_profile',
    'settings.plans',
    'settings.integrations',

    // Users & Roles
    'users.view',
    'users.invite',
    'users.suspend',
    'roles.manage',

    // Audit
    'audit.view',
    'audit.export',
] as const;

export type Permission = typeof PERMISSIONS[number];

// Permission matrix by role
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
    owner: PERMISSIONS, // Full access

    admin: [
        'dashboard.view', 'dashboard.view_full',
        'members.view', 'members.create', 'members.update', 'members.delete',
        'memberships.view', 'memberships.create', 'memberships.renew', 'memberships.freeze',
        'payments.view', 'payments.collect', 'payments.export', 'payments.void',
        'invoices.view', 'invoices.create', 'invoices.void',
        'classes.view', 'classes.create', 'classes.update', 'classes.delete',
        'attendance.view', 'attendance.mark',
        'trainers.view', 'trainers.create', 'trainers.update', 'trainers.delete',
        'reports.view', 'reports.export',
        'settings.view', 'settings.update', 'settings.gym_profile', 'settings.plans', 'settings.integrations',
        'users.view', 'users.invite', 'users.suspend', 'roles.manage',
        'audit.view', 'audit.export',
    ],

    manager: [
        'dashboard.view', 'dashboard.view_full',
        'members.view', 'members.create', 'members.update',
        'memberships.view', 'memberships.create', 'memberships.renew', 'memberships.freeze',
        'payments.view', 'payments.collect', 'payments.export',
        'invoices.view', 'invoices.create',
        'classes.view', 'classes.create', 'classes.update', 'classes.delete',
        'attendance.view', 'attendance.mark',
        'trainers.view', 'trainers.create', 'trainers.update',
        'reports.view',
        'settings.view',
        'users.view',
        'audit.view',
    ],

    staff: [
        'dashboard.view',
        'members.view', 'members.create', 'members.update',
        'memberships.view', 'memberships.renew', 'memberships.freeze',
        'payments.view', 'payments.collect',
        'invoices.view',
        'classes.view',
        'attendance.view', 'attendance.mark',
        'trainers.view',
        'reports.view_limited',
    ],

    trainer: [
        'dashboard.view',
        'members.view',
        'classes.view_own',
        'attendance.mark_own',
        'reports.view_limited',
    ],

    viewer: [
        'dashboard.view',
        'members.view',
        'classes.view',
        'trainers.view',
        'reports.view_limited',
    ],
};
