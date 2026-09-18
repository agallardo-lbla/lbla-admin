import { coreApi } from './client';

export interface DashboardStats {
  total_personas: number;
  total_estudiantes: number;
  total_funcionarios: number;
  total_apoderados: number;
  total_periodos: number;
  total_cursos: number;
  total_matriculas_activas: number;
  latest_sige_batch: {
    id: string;
    filename: string;
    status: string;
    total_rows: number;
    applied_at: string | null;
    created_at: string;
  } | null;
  recent_audit_events_count: number;
  timestamp: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return coreApi.get<DashboardStats>('/dashboard/stats/');
}
