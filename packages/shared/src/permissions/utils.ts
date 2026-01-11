// Permission utility functions

import type { Role } from './roles';
import type { Permission } from './permissions';
import { ROLE_PERMISSIONS } from './permissions';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: Role): readonly Permission[] {
    return ROLE_PERMISSIONS[role];
}

/**
 * Check if user can access a resource (for route guards)
 */
export function canAccess(role: Role, resource: string, action: string): boolean {
    const permission = `${resource}.${action}` as Permission;
    return hasPermission(role, permission);
}

/**
 * Filter an array of items based on permission
 */
export function filterByPermission<T>(
    items: T[],
    role: Role,
    getPermission: (item: T) => Permission
): T[] {
    return items.filter(item => hasPermission(role, getPermission(item)));
}
