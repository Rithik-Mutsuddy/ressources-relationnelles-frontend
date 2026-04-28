export type UserRole =
  | 'ROLE_USER'
  | 'ROLE_MODERATOR'
  | 'ROLE_ADMIN'
  | 'ROLE_SUPER_ADMIN';

export type AuthProvider = 'local' | 'france_connect';

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  roles: UserRole[];
  authProvider: AuthProvider;
  isVerified: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  fc_id_token?: string;
}