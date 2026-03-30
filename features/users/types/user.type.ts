export type UserStatus = 'active' | 'invited' | 'revoked' | 'suspended';

export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id: string;
  uid?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  photoUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
  metadata?: Record<string, unknown>;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface InviteUserPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}
