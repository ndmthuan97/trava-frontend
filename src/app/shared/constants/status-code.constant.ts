export enum StatusCode {
  Success = 2000,
  Created = 2001,
  Updated = 2002,
  Deleted = 2003,
  NoContent = 2004,

  // Error
  ModelInvalid = 4000,
  Unauthorized = 4001,
  Forbidden = 4003,
  SystemError = 5000,

  InvalidToken = 4004,
  EmailAlreadyExists = 4005,
  ProvidedInformationIsInValid = 4006,
  UserNotExists = 4007,
  UserNotConfirmed = 4008,
  InvalidCredentials = 4009,
  UserAccountLocked = 4010,
  ConfirmEmailTokenInvalidOrExpired = 4011,
  UserAlreadyConfirmed = 4012,
  NewPasswordSameAsOld = 4013,
  OtpInvalidOrExpired = 4014,
  TwoFactorIsAlreadyEnabled = 4015,
  TwoFactorIsAlreadyDisabled = 4016,
  UserIdNotFound = 4017,
  AccessTokenInvalidOrExpired = 4018,
  UnauthorizedAction = 4019,

  //Space Error
  SpaceNotFound = 4100,
  SpaceNameAlreadyExists = 4101,

  //TaskItem Error
  TaskItemNotFound = 4200,
  ParentTaskItemNotFound = 4201,
  TaskItemTitleAlreadyExists = 4202,
  ParentTaskItemNotExistInSpace = 4203,
  AssignedUserNotInSpace = 4204,

  //Space Invitation Error
  SpaceInvitationNotFound = 4300,
  InvalidInvitationStatusTransition = 4301,
}

export const StatusCodeMessage: Record<StatusCode, string> = {
  [StatusCode.Success]: 'Success',
  [StatusCode.Created]: 'Created successfully',
  [StatusCode.Updated]: 'Updated successfully',
  [StatusCode.Deleted]: 'Deleted successfully',
  [StatusCode.NoContent]: 'No content',

  // Error
  [StatusCode.ModelInvalid]: 'Invalid data',
  [StatusCode.Unauthorized]: 'Unauthorized',
  [StatusCode.Forbidden]: 'Forbidden',
  [StatusCode.SystemError]: 'System error',

  [StatusCode.InvalidToken]: 'Invalid token',
  [StatusCode.EmailAlreadyExists]: 'Email already exists',
  [StatusCode.ProvidedInformationIsInValid]: 'Provided information is invalid',
  [StatusCode.UserNotExists]: 'User does not exist',
  [StatusCode.UserNotConfirmed]: 'User is not confirmed',
  [StatusCode.InvalidCredentials]: 'Invalid credentials',
  [StatusCode.UserAccountLocked]: 'User account is locked',
  [StatusCode.ConfirmEmailTokenInvalidOrExpired]: 'Confirm email token is invalid or expired',
  [StatusCode.UserAlreadyConfirmed]: 'User is already confirmed',
  [StatusCode.NewPasswordSameAsOld]: 'New password cannot be the same as the old password',
  [StatusCode.OtpInvalidOrExpired]: 'OTP code is invalid or expired',
  [StatusCode.TwoFactorIsAlreadyEnabled]: 'Two-factor authentication is already enabled',
  [StatusCode.TwoFactorIsAlreadyDisabled]: 'Two-factor authentication is already disabled',
  [StatusCode.UserIdNotFound]: 'User ID not found',
  [StatusCode.AccessTokenInvalidOrExpired]: 'Access token is invalid or expired',
  [StatusCode.UnauthorizedAction]: 'Unauthorized action',

  // Space Error
  [StatusCode.SpaceNotFound]: 'Space not found',
  [StatusCode.SpaceNameAlreadyExists]: 'Space name already exists',

  // TaskItem Error
  [StatusCode.TaskItemNotFound]: 'Task item not found',
  [StatusCode.ParentTaskItemNotFound]: 'Parent task item not found',
  [StatusCode.TaskItemTitleAlreadyExists]: 'Task item title already exists',
  [StatusCode.ParentTaskItemNotExistInSpace]: 'Parent task item does not exist in space',
  [StatusCode.AssignedUserNotInSpace]: 'Assigned user is not in the space',

  // Space Invitation Error
  [StatusCode.SpaceInvitationNotFound]: 'Space invitation not found',
  [StatusCode.InvalidInvitationStatusTransition]: 'Invalid invitation status transition',
};
