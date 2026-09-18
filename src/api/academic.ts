import { coreApi } from './client';

export interface PeriodoLectivo {
  anio: number;
  fecha_inicio: string;
  fecha_termino: string;
  activo: boolean;
  es_historico?: boolean;
}

export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  nivel: '1M' | '2M' | '3M' | '4M';
  letra: string;
  modalidad: 'HC' | 'TP_ADMIN' | 'TP_AGRO';
  periodo: number;
  estudiantes_count?: number;
}

export interface Matricula {
  id: string;
  estudiante_id: string;
  estudiante_nombre?: string;
  estudiante_run?: string;
  curso: Curso;
  periodo: number;
  fecha_matricula: string;
  estado: 'MATRICULADO' | 'RETIRADO' | 'PROMOVIDO' | 'REPROBADO' | 'ANULADO';
  numero_lista: number | null;
}

/** Catálogo Canónico Inmutable de 18 Cursos Oficiales (F0.1 Gate G-02) */
export const CANONICAL_COURSES = [
  { codigo: '1M-A', nivel: '1M', letra: 'A', nombre: '1° Medio A', modalidad: 'HC' },
  { codigo: '1M-B', nivel: '1M', letra: 'B', nombre: '1° Medio B', modalidad: 'HC' },
  { codigo: '1M-C', nivel: '1M', letra: 'C', nombre: '1° Medio C', modalidad: 'HC' },
  { codigo: '1M-D', nivel: '1M', letra: 'D', nombre: '1° Medio D', modalidad: 'HC' },
  { codigo: '1M-E', nivel: '1M', letra: 'E', nombre: '1° Medio E', modalidad: 'HC' },
  { codigo: '2M-A', nivel: '2M', letra: 'A', nombre: '2° Medio A', modalidad: 'HC' },
  { codigo: '2M-B', nivel: '2M', letra: 'B', nombre: '2° Medio B', modalidad: 'HC' },
  { codigo: '2M-C', nivel: '2M', letra: 'C', nombre: '2° Medio C', modalidad: 'HC' },
  { codigo: '2M-D', nivel: '2M', letra: 'D', nombre: '2° Medio D', modalidad: 'HC' },
  { codigo: '2M-E', nivel: '2M', letra: 'E', nombre: '2° Medio E', modalidad: 'HC' },
  { codigo: '3M-A', nivel: '3M', letra: 'A', nombre: '3° Medio A (HC)', modalidad: 'HC' },
  { codigo: '3M-B', nivel: '3M', letra: 'B', nombre: '3° Medio B (HC)', modalidad: 'HC' },
  { codigo: '3M-C', nivel: '3M', letra: 'C', nombre: '3° Medio C (TP Administración)', modalidad: 'TP_ADMIN' },
  { codigo: '3M-D', nivel: '3M', letra: 'D', nombre: '3° Medio D (TP Agropecuaria)', modalidad: 'TP_AGRO' },
  { codigo: '4M-A', nivel: '4M', letra: 'A', nombre: '4° Medio A (HC)', modalidad: 'HC' },
  { codigo: '4M-B', nivel: '4M', letra: 'B', nombre: '4° Medio B (HC)', modalidad: 'HC' },
  { codigo: '4M-C', nivel: '4M', letra: 'C', nombre: '4° Medio C (TP Administración)', modalidad: 'TP_ADMIN' },
  { codigo: '4M-D', nivel: '4M', letra: 'D', nombre: '4° Medio D (TP Agropecuaria)', modalidad: 'TP_AGRO' },
];

export async function fetchPeriodos(): Promise<PeriodoLectivo[]> {
  const res = await coreApi.get<any>('/academic/periodos/');
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchCursos(params?: { anio?: number }): Promise<Curso[]> {
  const res = await coreApi.get<any>('/academic/cursos/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchCursoEstudiantes(cursoId: string): Promise<any[]> {
  const res = await coreApi.get<any>(`/academic/cursos/${cursoId}/estudiantes/`);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchMatriculas(params?: { curso?: string; anio?: number; estado?: string }): Promise<Matricula[]> {
  const res = await coreApi.get<any>('/academic/matriculas/', params);
  return Array.isArray(res) ? res : res.results || [];
}
