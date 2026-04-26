import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { User, CreateUserPayload, UpdateUserPayload, InviteUserPayload } from '../types/user.type';

export async function getUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
  return apiClient.get<PaginatedResponse<User>>(ENDPOINTS.USERS.BASE, {
    params: { page, limit },
  });
}

export async function getUserById(id: string): Promise<User> {
  return apiClient.get<User>(ENDPOINTS.USERS.BY_ID(id));
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  return apiClient.post<User>(ENDPOINTS.USERS.BASE, payload);
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  return apiClient.patch<User>(ENDPOINTS.USERS.BY_ID(id), payload);
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(ENDPOINTS.USERS.BY_ID(id));
}

export async function deactivateUser(id: string): Promise<User> {
  return apiClient.post<User>(ENDPOINTS.USERS.DEACTIVATE(id));
}

export async function activateUser(id: string): Promise<User> {
  return apiClient.post<User>(ENDPOINTS.USERS.ACTIVATE(id));
}

export async function inviteUser(payload: InviteUserPayload): Promise<User> {
  return apiClient.post<User>(ENDPOINTS.USERS.INVITE, payload);
}

export async function resendInvite(id: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(ENDPOINTS.USERS.RESEND_INVITE(id));
}

export async function revokeInvite(id: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(ENDPOINTS.USERS.REVOKE_INVITE(id));
}
