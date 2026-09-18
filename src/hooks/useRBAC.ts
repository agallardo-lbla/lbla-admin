import { useAuth } from '../context/AuthContext';

export function useRBAC() {
  const { user, roles, isAuthenticated } = useAuth();

  const isAdmin = roles.includes('SUPERADMIN') || roles.includes('DIRECTIVO') || roles.includes('ADMINISTRADOR_SISTEMA');
  const isDocente = roles.includes('DOCENTE');
  const isAsistente = roles.includes('ASISTENTE') || roles.includes('INSPECTORIA');

  return {
    isAuthenticated,
    user,
    roles,
    isAdmin,
    isDocente,
    isAsistente,
    // Permisos específicos de acción administrativa
    canCreatePersona: isAdmin,
    canEditPersona: isAdmin,
    canManageAcademic: isAdmin,
    canManageSige: isAdmin,
    canManageIdentity: isAdmin,
    canViewAudit: isAdmin,
    canViewFicha: isAdmin || isDocente || isAsistente,
    // Helper genérico para verificar rol
    hasRole: (requiredRole: string) => roles.includes(requiredRole),
    hasAnyRole: (requiredRoles: string[]) => requiredRoles.some(r => roles.includes(r)),
  };
}
