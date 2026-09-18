import { coreApi } from './client';

export type SigeItemStatus =
  | 'SIN_CAMBIOS'
  | 'NUEVO'
  | 'ACTUALIZACION'
  | 'CAMBIO_CURSO'
  | 'CAMBIO_ESTADO'
  | 'CAMBIO_RELACION'
  | 'CONFLICTO'
  | 'REVISION_MANUAL'
  | 'ERROR';

export interface SigeDiffItem {
  id: string;
  row_number: number;
  status: SigeItemStatus;
  entity_type: string;
  sige_id?: string;
  run_completo: string;
  curso_codigo?: string;
  diff_details?: Record<string, any>;
  error_message?: string;
  applied: boolean;
}

export interface SigeBatch {
  id: string;
  filename: string;
  periodo_anio: number;
  status: 'PREVIEW' | 'APPLIED' | 'ROLLED_BACK' | 'FAILED';
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_count: number;
  updated_count: number;
  unchanged_count: number;
  course_change_count: number;
  status_change_count: number;
  relation_change_count: number;
  conflict_count: number;
  manual_review_count: number;
  error_count: number;
  applied_at: string | null;
  created_at: string;
  items?: SigeDiffItem[];
}

export async function uploadSigeForDiff(file: File, anio: number): Promise<SigeBatch> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('periodo_anio', anio.toString());

  return coreApi.post<SigeBatch>('/adapters/sige/diff/', formData);
}

export async function applySigeBatch(batchId: string): Promise<any> {
  return coreApi.post<any>('/adapters/sige/apply/', {
    batch_id: batchId,
    confirmed: true,
  });
}

export async function fetchSigeBatches(): Promise<SigeBatch[]> {
  const res = await coreApi.get<any>('/adapters/sige/batches/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchSigeBatchDetail(batchId: string): Promise<SigeBatch> {
  return coreApi.get<SigeBatch>(`/adapters/sige/batches/${batchId}/`);
}

export async function rollbackSigeBatch(batchId: string): Promise<any> {
  return coreApi.post<any>(`/adapters/sige/batches/${batchId}/rollback/`);
}
