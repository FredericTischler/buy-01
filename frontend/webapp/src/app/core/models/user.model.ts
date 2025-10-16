export type UserRole = 'CLIENT' | 'SELLER' | 'ADMIN';

export interface UserProfile {
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface User {
  id: string;
  email: string;
  roles: UserRole[];
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}
