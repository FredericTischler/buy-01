import { User, UserRole } from './user.model';

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload extends AuthCredentials {
  role: Extract<UserRole, 'CLIENT' | 'SELLER'>;
  confirmPassword: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  avatarMediaId?: string | null;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: 'Bearer' | string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  exp: number;
  iat?: number;
  roles: UserRole[];
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
