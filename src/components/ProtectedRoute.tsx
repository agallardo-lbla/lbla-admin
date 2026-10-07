import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import { LoginPage } from '../pages/Login';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  adminOnly = false,
}) => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const { isAdmin, roles } = useRBAC();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Verificando sesión institucional..." />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-orange-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Acceso Restringido</h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta sección está reservada exclusivamente para directivos y administradores institucionales.
        </p>
        <div className="text-xs text-slate-600 bg-white/80 rounded-lg p-3 border border-orange-200 mb-5 text-left">
          <div>Usuario actual: <strong className="text-slate-800">{user?.preferred_username || user?.email}</strong></div>
          <div className="mt-1">Roles asignados: <code className="text-orange-700 font-mono text-[11px]">{roles.length > 0 ? roles.join(', ') : 'Ninguno'}</code></div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white hover:bg-orange-100/50 border border-orange-300 text-orange-800 font-semibold rounded-lg text-xs shadow-xs transition"
        >
          Cerrar Sesión y Cambiar de Cuenta
        </button>
      </div>
    );
  }

  if (requiredRole && !roles.includes(requiredRole) && !isAdmin) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center max-w-md mx-auto my-12 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-orange-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Rol Requerido</h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta función requiere el rol <code className="bg-orange-100 px-1 py-0.5 rounded font-mono text-xs">{requiredRole}</code>.
        </p>
        <button
          onClick={() => logout()}
          className="w-full py-2 px-4 bg-white hover:bg-orange-100/50 border border-orange-300 text-orange-800 font-semibold rounded-lg text-xs shadow-xs transition"
        >
          Cerrar Sesión y Cambiar de Cuenta
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
