/**
 * Comparing required roles and user's roles to protect the method
 * @param {Role[]} userRoles - User's roles to check
 * @param {Role[]} requiredRoles - Roles user must have
 * @return {Boolean} Is user's roles sastisfy with required roles
 */
export function matchingRoles(
	userRoles: Role[],
	requiredRoles: Role[],
): boolean {
	return requiredRoles.every((i) => userRoles.some((j) => i === j));
}

export enum Role {
	USER = 'User',
	ADMIN = 'Admin',
	STAFF = 'Staff',
}
