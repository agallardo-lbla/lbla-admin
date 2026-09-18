import React from 'react';
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
  Cloud
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { isAdmin } = useRBAC();

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
    <aside className="w-64 bg-white border-r border-gray-200 shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Navegación Institucional
        </div>

        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const hasChildren = item.children && item.children.length > 0;
          const isDirectActive = currentPath === item.path;
          const isChildActive = hasChildren && item.children?.some((c) => currentPath === c.path);

          if (hasChildren) {
            return (
              <div key={item.label} className="pt-2">
                <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                </div>
                <div className="pl-6 space-y-0.5 mt-0.5">
                  {item.children?.map((child) => {
                    const active = currentPath === child.path;
                    return (
                      <button
                        key={child.path}
                        onClick={() => onNavigate(child.path)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                          active
                            ? 'bg-lbla-blue/10 text-lbla-blue font-semibold'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span>{child.label}</span>
                        {active && <ChevronRight className="w-3 h-3 text-lbla-blue" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path!)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${
                isDirectActive
                  ? 'bg-lbla-blue text-white shadow-xs font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isDirectActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-100 px-3">
        <div className="text-[10px] text-gray-400 font-mono">
          <div>LBLA Core API v1</div>
          <div>OIDC / PKCE S256</div>
        </div>
      </div>
    </aside>
  );
};
