import { apiClient } from './client';

export interface GoogleStatus {
  ok: boolean;
  message: string;
  domain: string;
  mock_mode: boolean;
  org_units_count: number;
  users_count: number;
  groups_count: number;
}

export interface GoogleDirectoryUser {
  id: string;
  primaryEmail: string;
  name: {
    fullName: string;
    givenName: string;
    familyName: string;
  };
  orgUnitPath: string;
  suspended: boolean;
  isAdmin?: boolean;
  externalIds?: Array<{ type: string; value: string }>;
}

export interface GoogleSyncItem {
  id: string;
  google_user_id: string;
  primary_email: string;
  run_completo: string;
  classification: 'COINCIDE' | 'FALTA_EN_GOOGLE' | 'FALTA_EN_CORE' | 'DIFERENCIA' | 'CONFLICTO' | 'REVISION_MANUAL';
  entity_type: 'ESTUDIANTE' | 'FUNCIONARIO' | 'DESCONOCIDO';
  core_data: Record<string, any>;
  google_data: Record<string, any>;
  differences: Array<{ field: string; core_expected: any; google_value: any; reason?: string }>;
  proposed_action: 'NONE' | 'CREATE' | 'UPDATE_OU' | 'SUSPEND' | 'REACTIVATE' | 'MANUAL_REVIEW';
  action_applied: boolean;
  applied_at?: string;
  error_message?: string;
}

export interface GoogleSyncBatch {
  id: string;
  created_at: string;
  completed_at?: string;
  actor_user_id: string;
  mode: 'PREVIEW' | 'APPLY';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  scope_type: 'ALL' | 'STUDENTS' | 'STAFF';
  total_core_evaluated: number;
  total_google_evaluated: number;
  matches_count: number;
  missing_in_google_count: number;
  missing_in_core_count: number;
  differences_count: number;
  conflicts_count: number;
  manual_review_count: number;
  applied_count: number;
  error_count: number;
  summary: Record<string, any>;
  items?: GoogleSyncItem[];
}

export async function fetchGoogleStatus(): Promise<GoogleStatus> {
  return apiClient.get<GoogleStatus>('/google-workspace/status/', undefined, { timeout: 60000 });
}

export async function fetchGoogleUsers(params: {
  query?: string;
  org_unit_path?: string;
  page_token?: string;
  max_results?: number;
} = {}): Promise<{ users: GoogleDirectoryUser[]; next_page_token?: string; total_estimated?: number }> {
  const queryParts: string[] = [];
  if (params.query) queryParts.push(`query=${encodeURIComponent(params.query)}`);
  if (params.org_unit_path) queryParts.push(`org_unit_path=${encodeURIComponent(params.org_unit_path)}`);
  if (params.page_token) queryParts.push(`page_token=${encodeURIComponent(params.page_token)}`);
  if (params.max_results) queryParts.push(`max_results=${params.max_results}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<{ users: GoogleDirectoryUser[]; next_page_token?: string; total_estimated?: number }>(
    `/google-workspace/users/${qs}`,
    undefined,
    { timeout: 60000 }
  );
}

export async function runGooglePreview(scope_type: 'ALL' | 'STUDENTS' | 'STAFF' = 'ALL'): Promise<GoogleSyncBatch> {
  const formData = new FormData();
  formData.append('scope_type', scope_type);
  return apiClient.post<GoogleSyncBatch>('/google-workspace/sync/preview/', formData, { timeout: 180000 });
}

export async function fetchGoogleBatches(): Promise<GoogleSyncBatch[]> {
  const res = await apiClient.get<any>('/google-workspace/sync/batches/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchGoogleBatch(id: string): Promise<GoogleSyncBatch> {
  return apiClient.get<GoogleSyncBatch>(`/google-workspace/sync/batches/${id}/`);
}

export async function applyGoogleBatch(
  id: string,
  confirmed: boolean = true,
  options?: { actions?: string[]; item_ids?: string[] }
): Promise<GoogleSyncBatch> {
  const formData = new FormData();
  formData.append('confirmed', String(confirmed));
  if (options?.actions && options.actions.length > 0) {
    options.actions.forEach((a) => formData.append('actions', a));
  }
  if (options?.item_ids && options.item_ids.length > 0) {
    options.item_ids.forEach((itemId) => formData.append('item_ids', itemId));
  }
  return apiClient.post<GoogleSyncBatch>(`/google-workspace/sync/batches/${id}/apply/`, formData, { timeout: 180000 });
}

export async function suspendGoogleUser(userKey: string, reason: string): Promise<GoogleDirectoryUser> {
  return apiClient.post<GoogleDirectoryUser>(`/google-workspace/users/${encodeURIComponent(userKey)}/suspend/`, { reason });
}

export async function reactivateGoogleUser(userKey: string, reason: string): Promise<GoogleDirectoryUser> {
  return apiClient.post<GoogleDirectoryUser>(`/google-workspace/users/${encodeURIComponent(userKey)}/reactivate/`, { reason });
}
