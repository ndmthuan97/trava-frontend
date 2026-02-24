import { InvitationStatus } from '../enum/invitation-status.enum';

export interface Invitation {
  id: string;
  spaceId: string;
  spaceName: string;
  spaceType?: number;
  spaceRole?: number;
  invitedUserId: string;
  inviterName?: string;
  inviterEmail?: string;
  inviterAvatarUrl?: string;
  status: InvitationStatus;
  expiredAt?: string;
}
