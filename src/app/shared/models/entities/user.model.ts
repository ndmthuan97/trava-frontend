import { UserRoles } from '../enum/user-role.enum';
import { UserStatus } from '../enum/user-status.enum';

export interface User {
  id: string;
  fullName?: string;
  email: string;
  avatarUrl: string;
  role: UserRoles;
  status: UserStatus;
  password: string;
}
