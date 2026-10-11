import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  BookOpen,
  FileSpreadsheet,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Cloud,
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen = false,
  onClose,
}) => {
  const { isAdmin } = useRBAC();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Académico': true,
    'Integración SIGE': true,
    'Google Workspace': true,
  });

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (onClose) {
      onClose();
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, public: true },
    { label: 'Personas', path: '/personas', icon: Users, public: true },
    { label: 'Estudiantes', path: '/estudiantes', icon: GraduationCap, public: true },
    { label: 'Funcionarios', path: '/funcionarios', icon: Briefcase, public: true },
    { label: 'Apoderados', path: '/apoderados', icon: UserCheck, public: true },
    {
      label: 'Académico',
      icon: BookOpen,
      public: true,
      children: [
        { label: 'Períodos Lectivos', path: '/academico/periodos' },
        { label: 'Cursos (18 canónicos)', path: '/academico/cursos' },
        { label: 'Matrículas', path: '/academico/matriculas' },
      ],
    },
    {
      label: 'Integración SIGE',
      icon: FileSpreadsheet,
      adminOnly: true,
      children: [
        { label: 'Importar Nómina', path: '/sige' },
        { label: 'Historial de Lotes', path: '/sige/historial' },
      ],
    },
    {
      label: 'Google Workspace',
      icon: Cloud,
      adminOnly: true,
      children: [
        { label: 'Visión General', path: '/google-workspace' },
        { label: 'Directorio de Cuentas', path: '/google-workspace/usuarios' },
        { label: 'Mesa de Comparación', path: '/google-workspace/comparacion' },
        { label: 'Historial de Sincronización', path: '/google-workspace/sincronizaciones' },
      ],
    },
    {
      label: 'LBLA ID (Identidad)',
      path: '/identidad',
      icon: KeyRound,
      adminOnly: true,
    },
    {
      label: 'Auditoría',
      path: '/seguridad/auditoria',
      icon: ShieldAlert,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 top-[60px] bg-black/45 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 bg-[#15224A] border-r border-black/20 shrink-0 min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 transition-transform duration-200 z-30 ${
          isOpen
            ? 'fixed top-[60px] left-0 bottom-0 translate-x-0 overflow-y-auto'
            : 'hidden lg:flex'
        }`}
      >
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Navegación Institucional
          </div>

          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const hasChildren = item.children && item.children.length > 0;
            const isDirectActive = currentPath === item.path;
            const isChildActive =
              hasChildren && item.children?.some((c) => currentPath === c.path);
            const isExpanded = expandedMenus[item.label] ?? true;

            if (hasChildren) {
              const GroupIcon = item.icon;
              return (
                <div key={item.label} className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                      isChildActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <GroupIcon
                        size={18}
                        className={isChildActive ? 'text-[#F8E475]' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pl-4 space-y-1 mt-1">
                      {item.children?.map((child) => {
                        const active = currentPath === child.path;
                        return (
                          <button
                            key={child.path}
                            type="button"
                            onClick={() => handleItemClick(child.path)}
                            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                              active
                                ? 'bg-[#334E9B]/40 border-l-[3px] border-[#F8E475] text-white font-semibold'
                                : 'text-[#E2E8F0] hover:bg-white/[0.07] hover:text-white border-l-[3px] border-transparent'
                            }`}
                          >
                            <span>{child.label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 text-[#F8E475]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleItemClick(item.path!)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium transition flex items-center gap-3 cursor-pointer ${
                  isDirectActive
                    ? 'bg-[#334E9B]/40 border-l-[3px] border-[#F8E475] text-white font-semibold'
                    : 'text-[#E2E8F0] hover:bg-white/[0.07] hover:text-white border-l-[3px] border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={isDirectActive ? 'text-[#F8E475] shrink-0' : 'text-[#E2E8F0]/75 shrink-0'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10 px-3 mt-4">
          <div className="text-[10px] text-slate-400 font-mono">
            <div>LBLA Core API v1</div>
            <div>OIDC / PKCE S256</div>
          </div>
        </div>
      </aside>
    </>
  );
};
