export enum UserStatus {
  Active = 0,
  Inactive = 1,
}

export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.Active]: 'Active',
  [UserStatus.Inactive]: 'Inactive',
};
