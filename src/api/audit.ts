import { coreApi } from './client';

export interface AuditLogItem {
  id: string;
  actor_user_id: string;
  actor_role: string;
  client_app: string;
  action_type: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'DIFF' | 'APPLY' | 'ROLLBACK';
  target_entity: string;
  target_id: string | null;
  target_run: string | null;
  accessed_fields: string[];
  ip_address: string;
  timestamp: string;
}

export async function fetchAuditLogs(params?: {
  action_type?: string;
  actor_user_id?: string;
  target_entity?: string;
  page?: number;
}): Promise<AuditLogItem[]> {
  const res = await coreApi.get<any>('/audit/logs/', params);
  return Array.isArray(res) ? res : res.results || [];
}
