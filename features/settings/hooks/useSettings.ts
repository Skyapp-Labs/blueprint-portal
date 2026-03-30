import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSetting } from '../api/getSettings';

export const SETTINGS_KEYS = {
  all: ['settings'] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEYS.all,
    queryFn: getSettings,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.all }),
  });
}
