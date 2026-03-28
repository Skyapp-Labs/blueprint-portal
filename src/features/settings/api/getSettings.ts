import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { Setting } from '../types/setting.type';

export async function getSettings(): Promise<Setting[]> {
  return apiClient.get<Setting[]>(ENDPOINTS.SETTINGS.BASE);
}

export async function updateSetting(key: string, value: string): Promise<{ key: string; value: string; message: string }> {
  return apiClient.patch(ENDPOINTS.SETTINGS.BY_KEY(key), { value });
}
