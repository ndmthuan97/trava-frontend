import { SpaceType } from './../enum/space-type.enum';

export interface Space {
  id: string;
  name: string;
  description?: string;
  spaceType: SpaceType;
  createdBy: string;
  memberCount?: number;
}
