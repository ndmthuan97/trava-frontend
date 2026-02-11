export enum UserRoles {
  SYSTEM_ADMIN = 0,
  USER = 1,
}

export const UserRoleLabels: Record<UserRoles, string> = {
  [UserRoles.SYSTEM_ADMIN]: 'Admin',
  [UserRoles.USER]: 'User',
};
