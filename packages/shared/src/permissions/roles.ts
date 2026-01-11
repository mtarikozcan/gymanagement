// RBAC Role definitions for PulseGym

export const ROLES = ['owner', 'admin', 'manager', 'staff', 'trainer', 'viewer'] as const;
export type Role = typeof ROLES[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
    owner: 100,
    admin: 90,
    manager: 70,
    staff: 50,
    trainer: 40,
    viewer: 10,
};

export const ROLE_LABELS: Record<Role, string> = {
    owner: 'Owner',
    admin: 'Admin',
    manager: 'Manager',
    staff: 'Front Desk',
    trainer: 'Trainer',
    viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
    owner: 'Full control over the gym, including billing and ownership transfer',
    admin: 'Full operational control, user management, and settings',
    manager: 'Day-to-day operations, members, payments, and classes',
    staff: 'Member management, payments, and check-ins',
    trainer: 'Own classes and attendance only',
    viewer: 'Read-only access to dashboard and reports',
};

export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canManageRole(managerRole: Role, targetRole: Role): boolean {
    // Can only manage roles below your level
    return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}
