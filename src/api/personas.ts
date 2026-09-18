import { coreApi } from './client';

export interface Persona {
  id: string;
  run: number;
  dv: string;
  run_formateado?: string;
  nombres: string;
  apellidos: string;
  nombre_completo?: string;
  email_institucional: string | null;
  telefono: string | null;
  perfil_estudiante: boolean;
  perfil_funcionario: boolean;
  perfil_apoderado: boolean;
  identificadores_externos?: ExternalIdentifier[];
  created_at?: string;
  updated_at?: string;
}

export interface ExternalIdentifier {
  id: string;
  sistema: 'SIGE' | 'GOOGLE_WORKSPACE' | 'RELOJ_LOCAL' | 'CPANEL_WP' | 'OTRO';
  clave_externa: string;
  metadata?: Record<string, any>;
}

export interface Estudiante {
  id: string;
  persona: Persona;
  numero_matricula: string | null;
  fecha_incorporacion: string | null;
  tiene_ficha_alerta: boolean;
  curso_actual_codigo?: string;
}

export interface Funcionario {
  id: string;
  persona: Persona;
  cargo: string;
  departamento: string | null;
  es_docente: boolean;
  horas_contrato: number;
  activo: boolean;
}

export interface Apoderado {
  id: string;
  persona: Persona;
  parentesco: string;
  telefono_emergencia: string | null;
  pupilos_count?: number;
}

export interface StudentApoderadoLink {
  id: string;
  estudiante_id: string;
  apoderado: Apoderado;
  relacion: string;
  es_titular: boolean;
  vive_con_estudiante: boolean;
  autorizado_retirar: boolean;
}

export async function fetchPersonas(params?: { q?: string; tipo?: string; page?: number }): Promise<Persona[]> {
  const res = await coreApi.get<any>('/personas/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchPersonaDetail(id: string): Promise<Persona> {
  return coreApi.get<Persona>(`/personas/${id}/`);
}

export async function createPersona(data: Partial<Persona>): Promise<Persona> {
  return coreApi.post<Persona>('/personas/', data);
}

export async function updatePersona(id: string, data: Partial<Persona>): Promise<Persona> {
  return coreApi.patch<Persona>(`/personas/${id}/`, data);
}

export async function fetchEstudiantes(params?: { q?: string; curso?: string }): Promise<Estudiante[]> {
  const res = await coreApi.get<any>('/estudiantes/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchEstudianteDetail(id: string): Promise<Estudiante> {
  return coreApi.get<Estudiante>(`/estudiantes/${id}/`);
}

export async function fetchEstudianteHistorial(id: string): Promise<any[]> {
  const res = await coreApi.get<any>(`/estudiantes/${id}/historial/`);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchEstudianteApoderados(id: string): Promise<StudentApoderadoLink[]> {
  const res = await coreApi.get<any>(`/estudiantes/${id}/apoderados/`);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchFuncionarios(params?: { q?: string; cargo?: string }): Promise<Funcionario[]> {
  const res = await coreApi.get<any>('/funcionarios/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchFuncionarioDetail(id: string): Promise<Funcionario> {
  return coreApi.get<Funcionario>(`/funcionarios/${id}/`);
}

export async function fetchApoderados(params?: { q?: string }): Promise<Apoderado[]> {
  const res = await coreApi.get<any>('/apoderados/', params);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchApoderadoDetail(id: string): Promise<Apoderado> {
  return coreApi.get<Apoderado>(`/apoderados/${id}/`);
}

export async function fetchApoderadoPupilos(id: string): Promise<any[]> {
  const res = await coreApi.get<any>(`/apoderados/${id}/pupilos/`);
  return Array.isArray(res) ? res : res.results || [];
}

export async function fetchPersonaIdentificadores(id: string): Promise<ExternalIdentifier[]> {
  const res = await coreApi.get<any>(`/personas/${id}/identificadores/`);
  return Array.isArray(res) ? res : res.results || [];
}
