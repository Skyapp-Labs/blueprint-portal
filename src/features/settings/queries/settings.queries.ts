import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../api/settings.api';

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.all,
    queryFn: getSettings,
  });
}
