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
  const { isAuthenticated, isLoading, login } = useAuth();
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
          <button
            onClick={() => login()}
            className="w-full py-2.5 px-4 bg-lbla-blue hover:bg-lbla-dark text-white font-medium rounded-xl shadow transition"
          >
            Iniciar Sesión con LBLA ID
          </button>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center max-w-md mx-auto my-12">
        <ShieldAlert className="w-8 h-8 text-orange-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Acceso Restringido</h3>
        <p className="text-sm text-gray-600">
          Esta sección está reservada exclusivamente para directivos y administradores institucionales.
        </p>
      </div>
    );
  }

  if (requiredRole && !roles.includes(requiredRole) && !isAdmin) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center max-w-md mx-auto my-12">
        <ShieldAlert className="w-8 h-8 text-orange-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">Rol Requerido</h3>
        <p className="text-sm text-gray-600">
          Esta función requiere el rol <code className="bg-orange-100 px-1 py-0.5 rounded font-mono text-xs">{requiredRole}</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
