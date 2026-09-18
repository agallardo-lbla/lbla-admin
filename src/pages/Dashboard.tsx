import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { fetchDashboardStats, DashboardStats } from '../api/dashboard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { AlertBadge } from '../components/common/AlertBadge';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading && !stats) {
    return <LoadingSpinner message="Cargando métricas consolidadas de Core..." />;
  }

  if (error && !stats) {
    return <ErrorDisplay error={error} onRetry={loadStats} />;
  }

  const kpis = [
    {
      title: 'Personas Registradas',
      count: stats?.total_personas ?? 0,
      icon: Users,
      color: 'bg-blue-500',
      path: '/personas',
      subtext: 'Padrón civil institucional',
    },
    {
      title: 'Estudiantes',
      count: stats?.total_estudiantes ?? 0,
      icon: GraduationCap,
      color: 'bg-emerald-500',
      path: '/estudiantes',
      subtext: 'Alumnos con perfil activo',
    },
    {
      title: 'Funcionarios',
      count: stats?.total_funcionarios ?? 0,
      icon: Briefcase,
      color: 'bg-indigo-500',
      path: '/funcionarios',
      subtext: 'Docentes y asistentes',
    },
    {
      title: 'Apoderados',
      count: stats?.total_apoderados ?? 0,
      icon: UserCheck,
      color: 'bg-amber-500',
      path: '/apoderados',
      subtext: 'Vínculos familiares activos',
    },
    {
      title: 'Cursos Canónicos',
      count: stats?.total_cursos ?? 0,
      icon: BookOpen,
      color: 'bg-teal-500',
      path: '/academico/cursos',
      subtext: '18 cursos canónicos',
    },
    {
      title: 'Matrículas Activas',
      count: stats?.total_matriculas_activas ?? 0,
      icon: Calendar,
      color: 'bg-sky-500',
      path: '/academico/matriculas',
      subtext: 'Período lectivo en curso',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-1">
            Métricas cuantitativas e indicadores canónicos consolidados en LBLA Core.
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Indicadores</span>
        </button>
      </div>

      {/* Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={() => onNavigate(kpi.path)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.title}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{kpi.count}</h3>
                </div>
                <div className={`p-3 rounded-xl text-white ${kpi.color} shadow-sm group-hover:scale-105 transition`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                <span>{kpi.subtext}</span>
                <span className="text-lbla-blue group-hover:translate-x-0.5 transition inline-flex items-center">
                  Ver detalle <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección Inferior: Estado SIGE y Auditoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Última importación SIGE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Última Nómina SIGE</h3>
            </div>
            <button
              onClick={() => onNavigate('/sige')}
              className="text-xs font-semibold text-lbla-blue hover:underline"
            >
              Administrar SIGE &rarr;
            </button>
          </div>

          {stats?.latest_sige_batch ? (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200/60 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 truncate max-w-[200px]" title={stats.latest_sige_batch.filename}>
                  {stats.latest_sige_batch.filename}
                </span>
                <AlertBadge status={stats.latest_sige_batch.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200/60">
                <div>
                  <span className="block text-gray-400">Total Filas:</span>
                  <span className="font-semibold text-gray-800">{stats.latest_sige_batch.total_rows}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Fecha Carga:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(stats.latest_sige_batch.created_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">
              No se han registrado importaciones SIGE en este período.
            </p>
          )}
        </div>

        {/* Resumen de Seguridad y Auditoría */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Auditoría Institucional (Ley 19.628)</h3>
            </div>
            <button
              onClick={() => onNavigate('/seguridad/auditoria')}
              className="text-xs font-semibold text-lbla-blue hover:underline"
            >
              Ver Registros &rarr;
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 text-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs">Eventos Registrados en Core:</span>
              <span className="text-lg font-bold text-gray-900">{stats?.recent_audit_events_count ?? 0}</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed pt-2 border-t border-gray-200/60">
              Todos los accesos a datos de carácter personal y operaciones de alto impacto son persistidos de forma inmutable y append-only conforme al marco legal vigente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
