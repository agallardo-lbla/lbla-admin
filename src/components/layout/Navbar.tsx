import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const fullName =
    [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim() ||
    [user?.given_name, user?.family_name].filter(Boolean).join(' ').trim() ||
    user?.name ||
    user?.preferred_username ||
    user?.email ||
    'Usuario';

  const userInitial = fullName.charAt(0).toUpperCase() || 'U';
  const primaryRole = user?.rol || user?.roles?.[0] || 'FUNCIONARIO';

  return (
    <header
      className="bg-[#334E9B] sticky top-0 z-40 h-[60px] flex items-center justify-between px-6 shrink-0"
      style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.15)' }}
    >
      {/* Zona Izquierda: Toggle Móvil + Squircle Protagonista (38x38px) + Títulos + Escudo Secundario (26px) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Alternar menú de navegación"
          className="lg:hidden p-1.5 rounded-lg text-white hover:bg-white/10 transition focus:outline-none"
        >
          <Menu className="w-5 h-5 text-[#FFFFFF]" />
        </button>

        <div
          className="w-[38px] h-[38px] rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center bg-white/10"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
          }}
        >
          <img
            src="/img/logo_admin.png"
            alt="Admin"
            className="w-full h-full object-cover block"
          />
        </div>

        <div className="flex flex-col justify-center leading-tight">
          <span className="text-[#EFF1F7] text-[1.08rem] font-extrabold tracking-[-0.01em] leading-[1.15]">
            Admin
          </span>
          <span className="text-[#F8E475] text-[0.72rem] font-semibold tracking-[0.01em] leading-[1.2]">
            Liceo Bicentenario Latinoamericano
          </span>
        </div>

        <div
          className="hidden sm:block mx-1 shrink-0"
          style={{
            width: '1px',
            height: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
          }}
          aria-hidden="true"
        />

        <img
          src="/img/logo_lbla.png"
          alt="Escudo Liceo Bicentenario Latinoamericano"
          className="hidden sm:block h-[26px] w-auto object-contain shrink-0"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.20))' }}
        />
      </div>

      {/* Zona Derecha: Identidad del Usuario, Rol y Acción Salir */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {userInitial}
            </div>

            <span className="hidden md:inline-block text-[#FFFFFF] font-bold text-sm leading-tight">
              {fullName}
            </span>

            <span className="bg-[#10204D]/35 text-[#F8E475] border border-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
              {primaryRole}
            </span>

            <button
              type="button"
              onClick={logout}
              title="Cerrar Sesión"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut size={15} className="shrink-0" />
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-white/80 font-medium">No autenticado</span>
        )}
      </div>
    </header>
  );
};
