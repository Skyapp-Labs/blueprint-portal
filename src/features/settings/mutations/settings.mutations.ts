import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSetting } from '../api/settings.api';
import { SETTINGS_KEYS } from '../queries/settings.queries';

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.all }),
  });
}
