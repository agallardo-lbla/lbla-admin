import { coreApi } from './client';

export interface IdentityUser {
  id: string;
  username: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION' | 'DEACTIVATED';
  roles: string[];
  app_permissions?: Record<string, string[]>;
  is_active: boolean;
  is_locked: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  persona_id: string | null;
  federated_provider: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRole {
  id: string;
  name: string;
  description: string;
}

export interface ApplicationCatalogItem {
  client_id: string;
  name: string;
  description: string;
  available_roles: ApplicationRole[];
}

export interface IdentityAuditLog {
  id: string;
  event_type: string;
  identity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, any>;
  created_at: string;
}

export async function fetchIdentities(params?: { q?: string; is_active?: boolean }): Promise<IdentityUser[]> {
  const res = await coreApi.get<any>('/identity/users/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchIdentityDetail(id: string): Promise<IdentityUser> {
  return coreApi.get<IdentityUser>(`/identity/users/${id}/`);
}

export async function fetchApplicationCatalog(): Promise<ApplicationCatalogItem[]> {
  const res = await coreApi.get<any>('/identity/users/applications/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function updateUserPermissions(
  id: string,
  data: {
    roles?: string[];
    app_permissions?: Record<string, string[]>;
  }
): Promise<IdentityUser> {
  return coreApi.patch<IdentityUser>(`/identity/users/${id}/permissions/`, data);
}

export async function lockIdentity(id: string, durationMinutes = 15): Promise<IdentityUser> {
  return coreApi.post<IdentityUser>(`/identity/users/${id}/lock/`, { duration_minutes: durationMinutes });
}

export async function unlockIdentity(id: string): Promise<IdentityUser> {
  return coreApi.post<IdentityUser>(`/identity/users/${id}/unlock/`, {});
}

export async function fetchIdentityAuditLogs(params?: { event_type?: string; identity_id?: string }): Promise<IdentityAuditLog[]> {
  const res = await coreApi.get<any>('/identity/audit-logs/', params);
  return Array.isArray(res) ? res : res.results || [];
}

