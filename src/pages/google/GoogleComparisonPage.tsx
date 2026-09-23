import React, { useState, useEffect } from 'react';
import {
  runGooglePreview,
  applyGoogleBatch,
  fetchGoogleBatches,
  fetchGoogleBatch,
  GoogleSyncBatch,
  GoogleSyncItem,
} from '../../api/google';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  UserMinus,
  ArrowRight,
  ShieldCheck,
  Filter,
  Play,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function GoogleComparisonPage() {
  const [scope, setScope] = useState<'ALL' | 'STUDENTS' | 'STAFF'>('ALL');
  const [currentBatch, setCurrentBatch] = useState<GoogleSyncBatch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Filtro por clasificación
  const [filterClass, setFilterClass] = useState<string>('ALL');

  // Modal para aplicar cambios
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);

  // Cargar automáticamente el último lote analizado en modo auditoría (Opción C)
  useEffect(() => {
    let isMounted = true;
    const loadRecentBatch = async () => {
      try {
        setLoading(true);
        const batches = await fetchGoogleBatches();
        if (isMounted && batches && batches.length > 0) {
          const latestBatch = await fetchGoogleBatch(batches[0].id);
          if (isMounted) {
            setCurrentBatch(latestBatch);
          }
        }
      } catch (err: any) {
        // Silencioso al cargar inicial si aún no hay lotes
        console.info('No hay lotes previos de Google Workspace:', err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadRecentBatch();
    return () => { isMounted = false; };
  }, []);

  const handleRunPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const batch = await runGooglePreview(scope);
      setCurrentBatch(batch);
      setFilterClass('ALL');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBatch = async () => {
    if (!currentBatch) return;
    try {
      setApplying(true);
      const updated = await applyGoogleBatch(currentBatch.id, true);
      setCurrentBatch(updated);
      setIsApplyModalOpen(false);
      alert(`¡Sincronización aplicada exitosamente! Se ejecutaron ${updated.applied_count} operaciones en Google Workspace.`);
    } catch (err: any) {
      alert(`Error al aplicar cambios: ${err.message || 'Error desconocido'}`);
    } finally {
      setApplying(false);
    }
  };

  const items = currentBatch?.items || [];
  const filteredItems = items.filter((item) => {
    if (filterClass === 'ALL') return true;
    if (filterClass === 'CONFLICTS') return item.classification === 'CONFLICTO' || item.classification === 'REVISION_MANUAL';
    return item.classification === filterClass;
  });

  // Conteo de elementos aplicables de forma segura (excluye conflictos y revisiones)
  const safeApplicableCount = items.filter(
    (i) => !i.action_applied && ['CREATE', 'UPDATE_OU', 'REACTIVATE', 'SUSPEND'].includes(i.proposed_action) && !['CONFLICTO', 'REVISION_MANUAL', 'FALTA_EN_CORE'].includes(i.classification)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-blue-600" />
            Mesa de Comparación: Core ↔ Google Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Análisis determinista de discrepancias con generación de propuestas en modo seguro (Dry Run).
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-3">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            disabled={loading || applying}
          >
            <option value="ALL">Todos los Estamentos</option>
            <option value="STUDENTS">Solo Estudiantes</option>
            <option value="STAFF">Solo Funcionarios</option>
          </select>

          <button
            onClick={handleRunPreview}
            disabled={loading || applying}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {currentBatch ? 'Re-analizar (Dry Run)' : 'Ejecutar Análisis (Preview)'}
          </button>

          {currentBatch && currentBatch.mode === 'PREVIEW' && safeApplicableCount > 0 && (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              disabled={applying}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aplicar Cambios ({safeApplicableCount})
            </button>
          )}
        </div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={handleRunPreview} />}

      {loading && <LoadingSpinner message="Ejecutando comparación determinista entre LBLA Core y Google Workspace..." />}

      {!currentBatch && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay análisis en curso</p>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Haz clic en <span className="font-semibold text-blue-600">"Ejecutar Análisis (Preview)"</span> para consultar Core y Google Workspace, clasificar diferencias y generar la propuesta de cambios sin riesgo.
          </p>
        </div>
      )}

      {currentBatch && !loading && (
        <>
          {/* Métricas del Lote */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Evaluados</span>
              <span className="text-2xl font-bold text-slate-800">{items.length}</span>
              <span className="text-xs text-slate-400 block mt-1">Registros analizados</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <span className="text-xs font-medium text-emerald-700 block">Coinciden</span>
              <span className="text-2xl font-bold text-emerald-600">{currentBatch.matches_count}</span>
              <span className="text-xs text-emerald-500 block mt-1">Sin discrepancias</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
              <span className="text-xs font-medium text-blue-700 block">Faltan en Google</span>
              <span className="text-2xl font-bold text-blue-600">{currentBatch.missing_in_google_count}</span>
              <span className="text-xs text-blue-500 block mt-1">Propuesta: Alta</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
              <span className="text-xs font-medium text-amber-700 block">Diferencias</span>
              <span className="text-2xl font-bold text-amber-600">{currentBatch.differences_count}</span>
              <span className="text-xs text-amber-500 block mt-1">Cambio de OU / Estado</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
              <span className="text-xs font-medium text-purple-700 block">Faltan en Core</span>
              <span className="text-2xl font-bold text-purple-600">{currentBatch.missing_in_core_count}</span>
              <span className="text-xs text-purple-500 block mt-1">Cuentas en Google</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
              <span className="text-xs font-medium text-rose-700 block">Conflictos / Rev.</span>
              <span className="text-2xl font-bold text-rose-600">
                {currentBatch.conflicts_count + currentBatch.manual_review_count}
              </span>
              <span className="text-xs text-rose-500 block mt-1">Excluidos de Apply</span>
            </div>
          </div>

          {/* Filtro por Pestañas */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'ALL', label: 'Todas las Fichas', count: items.length },
              { id: 'COINCIDE', label: 'Coincide Plenamente', count: currentBatch.matches_count },
              { id: 'FALTA_EN_GOOGLE', label: 'Falta en Google', count: currentBatch.missing_in_google_count },
              { id: 'DIFERENCIA', label: 'Diferencias (OU/Estado)', count: currentBatch.differences_count },
              { id: 'FALTA_EN_CORE', label: 'Falta en Core', count: currentBatch.missing_in_core_count },
              { id: 'CONFLICTS', label: 'Conflictos / Revisión', count: currentBatch.conflicts_count + currentBatch.manual_review_count },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterClass(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  filterClass === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    filterClass === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tabla Comparativa */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Persona / Correo</th>
                    <th className="px-6 py-3.5">Clasificación</th>
                    <th className="px-6 py-3.5">Datos en Core</th>
                    <th className="px-6 py-3.5">Datos en Google Workspace</th>
                    <th className="px-6 py-3.5">Acción Propuesta</th>
                    <th className="px-6 py-3.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {item.core_data?.nombre || item.google_data?.name?.fullName || 'Desconocido'}
                          </div>
                          <div className="font-mono text-xs text-blue-600">{item.primary_email}</div>
                          {item.run_completo && (
                            <span className="font-mono text-[11px] text-slate-400">RUN: {item.run_completo}</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <ClassificationBadge classification={item.classification} />
                        </td>

                        <td className="px-6 py-4 text-xs">
                          {item.core_data && Object.keys(item.core_data).length > 0 ? (
                            <div className="space-y-0.5">
                              <div><span className="text-slate-400">Estamento:</span> <span className="font-medium text-slate-700">{item.entity_type}</span></div>
                              {item.core_data.curso && <div><span className="text-slate-400">Curso:</span> <span className="font-medium text-slate-700">{item.core_data.curso}</span></div>}
                              {item.core_data.expected_ou && (
                                <div className="font-mono text-[11px] text-slate-500 truncate max-w-xs" title={item.core_data.expected_ou}>
                                  OU: {item.core_data.expected_ou}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No existe en Core</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs">
                          {item.google_data && Object.keys(item.google_data).length > 0 ? (
                            <div className="space-y-0.5">
                              <div>
                                <span className="text-slate-400">Cuenta:</span>{' '}
                                <span className={`font-semibold ${item.google_data.suspended ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {item.google_data.suspended ? 'Suspendida' : 'Activa'}
                                </span>
                              </div>
                              {item.google_data.orgUnitPath && (
                                <div className="font-mono text-[11px] text-slate-500 truncate max-w-xs" title={item.google_data.orgUnitPath}>
                                  OU: {item.google_data.orgUnitPath}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No tiene cuenta Google</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <ProposedActionBadge action={item.proposed_action} />
                        </td>

                        <td className="px-6 py-4 text-center">
                          {item.action_applied ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aplicado
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Pendiente</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmación para Aplicar Lote */}
      <ConfirmModal
        isOpen={isApplyModalOpen}
        onCancel={() => setIsApplyModalOpen(false)}
        onConfirm={handleApplyBatch}
        title="Confirmar Aplicación a Google Workspace"
        message={`¿Estás seguro de que deseas aplicar los cambios a Google Workspace? Se ejecutarán ${safeApplicableCount} operaciones seguras autorizadas.`}
        confirmLabel="Confirmar y Aplicar Cambios"
        isLoading={applying}
        details={
          <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Salvaguardas de Seguridad Automáticas:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Las cuentas con <strong>CONFLICTO</strong> o <strong>REVISIÓN MANUAL</strong> quedan estrictamente excluidas.</li>
              <li>Las cuentas clasificadas como <strong>FALTA_EN_CORE</strong> NO serán eliminadas.</li>
              <li>Cada operación se registrará de manera inmutable en el registro de auditoría institucional (`AuditLog`).</li>
            </ul>
          </div>
        }
      />
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: string }) {
  switch (classification) {
    case 'COINCIDE':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Coincide</span>;
    case 'FALTA_EN_GOOGLE':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Falta en Google</span>;
    case 'DIFERENCIA':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Diferencia</span>;
    case 'FALTA_EN_CORE':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">Falta en Core</span>;
    case 'CONFLICTO':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">Conflicto</span>;
    case 'REVISION_MANUAL':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">Revisión Manual</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">{classification}</span>;
  }
}

function ProposedActionBadge({ action }: { action: string }) {
  switch (action) {
    case 'CREATE':
      return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">Crear Cuenta</span>;
    case 'UPDATE_OU':
      return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">Mover OU</span>;
    case 'REACTIVATE':
      return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Reactivar</span>;
    case 'SUSPEND':
      return <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">Suspender</span>;
    case 'MANUAL_REVIEW':
      return <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">Revisión Humana</span>;
    default:
      return <span className="text-xs text-slate-400">Sin Acción</span>;
  }
}
