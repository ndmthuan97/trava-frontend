export enum SpaceType {
  Personal = 0,
  Team = 1,
}

export const SpaceTypeLabels: Record<SpaceType, string> = {
  [SpaceType.Personal]: 'Personal',
  [SpaceType.Team]: 'Team',
};
