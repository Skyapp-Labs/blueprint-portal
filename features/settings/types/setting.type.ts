export type SettingType = 'integer' | 'string' | 'boolean' | 'json';

export interface Setting {
  key: string;
  value: string;
  type: SettingType;
  group: string;
  description?: string;
  isEditable: boolean;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
}
