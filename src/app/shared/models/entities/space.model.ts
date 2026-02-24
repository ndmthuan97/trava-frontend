import { SpaceRole } from './../enum/space-role.enum';
import { SpaceType } from './../enum/space-type.enum';

export interface Space {
  id: string;
  name: string;
  description?: string;
  spaceType: SpaceType;
  createdBy: string;
  role?: SpaceRole;
}
