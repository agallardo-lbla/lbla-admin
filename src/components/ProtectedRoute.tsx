import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

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
  const { isAuthenticated, isLoading, login, logout, user } = useAuth();
  const { isAdmin, roles } = useRBAC();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Verificando sesión institucional..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 text-lbla-blue rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Autenticación Requerida</h2>
          <p className="text-sm text-gray-600 mb-6">
            Para acceder a la consola central LBLA Admin debes iniciar sesión mediante LBLA ID.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => login('google')}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar con Google Workspace</span>
            </button>
            <button
              onClick={() => login()}
              className="w-full py-2.5 px-4 bg-lbla-blue hover:bg-lbla-dark text-white font-medium rounded-xl shadow transition text-sm"
            >
              Iniciar Sesión con LBLA ID
            </button>
          </div>
        </div>
      </div>
    );
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
