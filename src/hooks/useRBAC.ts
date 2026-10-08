import { useAuth } from '../context/AuthContext';

export const SUPERADMIN_EMAILS = [
  'agallardo@lbla.cl',
  'jnavarro@lbla.cl',
  'admin@lbla.cl',
];

export function useRBAC() {
  const { user, roles, isAuthenticated } = useAuth();

  const userEmail = (user?.email || '').trim().toLowerCase();

  // Solo los tres superadministradores autorizados o rol canónico SUPERADMIN
  const isSuperAdmin = SUPERADMIN_EMAILS.includes(userEmail) || roles.includes('SUPERADMIN');
  const isDirectivo = roles.includes('DIRECTIVO');
  const isDocente = roles.includes('DOCENTE');
  const isAsistente = roles.includes('ASISTENTE') || roles.includes('INSPECTORIA');
  const isEstudiante = roles.includes('ESTUDIANTE') || userEmail.endsWith('@estudiante.liceolbla.cl');

  // Personal funcionario institucional (acceso de solo lectura en admin.lbla.cl)
  const isStaff = isSuperAdmin || isDirectivo || isDocente || isAsistente;

  return {
    isAuthenticated,
    user,
    roles,
    isSuperAdmin,
    isAdmin: isSuperAdmin, // Solo Superadmin posee permisos de administración/mutación
    isDirectivo,
    isDocente,
    isAsistente,
    isEstudiante,
    isStaff,
    // Permisos de mutación administrativa: estrictamente restringidos a los 3 superadmins
    canCreatePersona: isSuperAdmin,
    canEditPersona: isSuperAdmin,
    canDeletePersona: isSuperAdmin,
    canManageStaff: isSuperAdmin,
    canImportStaff: isSuperAdmin,
    canManageAcademic: isSuperAdmin,
    canManageSige: isSuperAdmin,
    canManageIdentity: isSuperAdmin,
    canViewAudit: isSuperAdmin,
    // Permisos de consulta institucional: funcionarios autorizados
    canViewFicha: isStaff,
    canViewPersonas: isStaff,
    // Helper genérico para verificar rol
    hasRole: (requiredRole: string) => roles.includes(requiredRole),
    hasAnyRole: (requiredRoles: string[]) => requiredRoles.some((r) => roles.includes(r)),
  };
}
