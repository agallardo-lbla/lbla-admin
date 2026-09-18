import React from 'react';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 flex items-center justify-between px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-lbla-blue flex items-center justify-center text-white font-bold text-lg shadow-sm">
          L
        </div>
        <div>
          <span className="font-bold text-gray-900 tracking-tight text-base">LBLA ADMIN</span>
          <span className="hidden sm:inline-block ml-2 text-xs text-gray-500 font-medium border-l border-gray-300 pl-2">
            Liceo Bicentenario Latinoamericano
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 leading-tight">
                {user.preferred_username}
              </div>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                {user.roles.slice(0, 2).map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200">
              <User className="w-4 h-4" />
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500 font-medium">No autenticado</span>
        )}
      </div>
    </header>
  );
};
