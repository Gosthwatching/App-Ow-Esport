export interface AuthenticatedUser {
  sub: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}
