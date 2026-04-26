import { useQuery } from '@tanstack/react-query';
import { getUsers, getUserById } from '../api/users.api';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (page: number, limit: number) => ['users', 'list', page, limit] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: USER_KEYS.list(page, limit),
    queryFn: () => getUsers(page, limit),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}
