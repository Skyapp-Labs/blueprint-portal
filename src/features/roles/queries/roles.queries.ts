import { useQuery } from '@tanstack/react-query';
import { getRoles, getRoleById, getPermissions, getModules } from '../api/roles.api';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
  detail: (id: string) => ['roles', 'detail', id] as const,
  permissions: () => ['permissions', 'list'] as const,
  modules: () => ['modules', 'list'] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: ROLE_KEYS.list(),
    queryFn: getRoles,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ROLE_KEYS.detail(id),
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
}

export function usePermissions(moduleId?: string) {
  return useQuery({
    queryKey: [...ROLE_KEYS.permissions(), moduleId],
    queryFn: () => getPermissions(moduleId),
  });
}

export function useModules() {
  return useQuery({
    queryKey: ROLE_KEYS.modules(),
    queryFn: getModules,
  });
}
