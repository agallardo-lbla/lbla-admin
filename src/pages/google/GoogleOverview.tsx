import React, { useEffect, useState } from 'react';
import { fetchGoogleStatus, GoogleStatus } from '../../api/google';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  Users,
  FolderTree,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Layers,
  History
} from 'lucide-react';

interface GoogleOverviewProps {
  onNavigate?: (path: string) => void;
}

export default function GoogleOverview({ onNavigate }: GoogleOverviewProps) {
  const [statusData, setStatusData] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const goTo = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.assign(path);
    }
  };

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGoogleStatus();
      setStatusData(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) return <LoadingSpinner message="Consultando estado de integración Google Workspace..." />;
  if (error) return <ErrorDisplay error={error} onRetry={loadStatus} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Cloud className="w-7 h-7 text-blue-600" />
            Integración Google Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión sincronizada del dominio institucional{' '}
            <span className="font-semibold text-blue-700">@{statusData?.domain}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar Estado
          </button>
          <button
            onClick={() => goTo('/google-workspace/comparacion')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Mesa de Comparación
          </button>
        </div>
      </div>

      {/* Estado del Adaptador y Modo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusData?.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {statusData?.ok ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {statusData?.ok ? 'Adaptador Operativo y Conectado' : 'Conexión No Disponible'}
                </h3>
                {statusData?.mock_mode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Modo Sandbox (Mock)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Google Live SDK
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{statusData?.message}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Dominio Activo</span>
            <span className="font-mono text-sm font-bold text-slate-700">@{statusData?.domain}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Cuentas en Directorio</span>
            <div className="text-2xl font-bold text-slate-800">{statusData?.users_count ?? 0}</div>
            <span className="text-xs text-slate-400">Estudiantes y funcionarios</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Unidades Organizativas (OUs)</span>
            <div className="text-2xl font-bold text-slate-800">{statusData?.org_units_count ?? 0}</div>
            <span className="text-xs text-slate-400">Estructura por cursos y estamentos</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Grupos Institucionales</span>
            <div className="text-2xl font-bold text-slate-800">{statusData?.groups_count ?? 0}</div>
            <span className="text-xs text-slate-400">Cursos y listas de distribución</span>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => goTo('/google-workspace/usuarios')}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">Directorio de Cuentas</h4>
          <p className="text-xs text-slate-500">
            Explora las cuentas institucionales registradas en Google Workspace, estados y OUs.
          </p>
        </div>

        <div
          onClick={() => goTo('/google-workspace/comparacion')}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">Mesa de Comparación (Diff)</h4>
          <p className="text-xs text-slate-500">
            Ejecuta el análisis determinista entre Core y Google, previsualiza propuestas y aplica cambios autorizados.
          </p>
        </div>

        <div
          onClick={() => goTo('/google-workspace/sincronizaciones')}
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <History className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">Historial de Sincronizaciones</h4>
          <p className="text-xs text-slate-500">
            Consulta los lotes ejecutados en modo Preview y Apply con métricas y auditoría completa.
          </p>
        </div>
      </div>

      {/* Alerta de Principios de Seguridad */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">Principios de Integración Controlada (Fase 6)</p>
          <p>
            1. <strong>LBLA Core es la única fuente canónica</strong> para personas, cursos y matrículas. Google Workspace no es fuente de verdad académica.
          </p>
          <p>
            2. <strong>Cero escritura automática masiva:</strong> Toda operación requiere previsualización previa (Dry Run) y confirmación explícita del operador.
          </p>
          <p>
            3. <strong>Cero borrado automático:</strong> Las cuentas sin correspondencia en Core se catalogan como revisión manual y nunca se eliminan automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
