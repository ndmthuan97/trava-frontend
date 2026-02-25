export enum SpaceRole {
  Owner = 0,
  Member = 1,
}

export const SpaceRoleLabels: Record<SpaceRole, string> = {
  [SpaceRole.Owner]: 'Owner',
  [SpaceRole.Member]: 'Member',
};
