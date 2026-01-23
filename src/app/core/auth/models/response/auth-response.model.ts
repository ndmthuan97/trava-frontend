export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string;
}
