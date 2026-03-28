export interface FeatureModule {
  id: string;
  slug: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  slug: string;
  name: string;
  description?: string;
  moduleId: string;
  featureModule?: FeatureModule;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  slug: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  slug: string;
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface SetRolePermissionsPayload {
  permissionIds: string[];
}
