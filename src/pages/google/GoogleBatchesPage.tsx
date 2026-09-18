import React, { useEffect, useState } from 'react';
import { fetchGoogleBatches, fetchGoogleBatch, GoogleSyncBatch } from '../../api/google';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { History, Eye, CheckCircle2, Clock, XCircle, FileText, ChevronRight, Layers } from 'lucide-react';

export default function GoogleBatchesPage() {
  const [batches, setBatches] = useState<GoogleSyncBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<GoogleSyncBatch | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGoogleBatches();
      setBatches(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleSelectBatch = async (batchId: string) => {
    try {
      setLoadingDetail(true);
      const detail = await fetchGoogleBatch(batchId);
      setSelectedBatch(detail);
    } catch (err: any) {
      alert(`Error al cargar detalle del lote: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando historial de sincronizaciones Google Workspace..." />;
  if (error) return <ErrorDisplay error={error} onRetry={loadBatches} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <History className="w-7 h-7 text-blue-600" />
          Historial de Sincronizaciones Google Workspace
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Registro inmutable de auditoría para todas las sesiones de análisis (Preview) y aplicación (Apply).
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay lotes registrados</p>
          <p className="text-sm mt-1">Aún no se han ejecutado análisis ni aplicaciones de sincronización.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listado de Lotes */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Lotes Ejecutados</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {batches.map((b) => {
                const isSelected = selectedBatch?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBatch(b.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          b.mode === 'APPLY'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {b.mode === 'APPLY' ? 'Aplicado (Apply)' : 'Vista Previa (Dry Run)'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(b.created_at).toLocaleDateString()} {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 truncate mb-2">ID: {b.id.substring(0, 16)}...</div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Alcance</span>
                        <span className="font-semibold">{b.scope_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Diferencias</span>
                        <span className="font-semibold text-amber-600">{b.differences_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Aplicados</span>
                        <span className="font-semibold text-emerald-600">{b.applied_count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detalle del Lote Seleccionado */}
          <div className="lg:col-span-2">
            {loadingDetail ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <LoadingSpinner message="Cargando detalle del lote..." />
              </div>
            ) : selectedBatch ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Detalle del Lote de Sincronización</h3>
                    <div className="font-mono text-xs text-slate-500">UUID: {selectedBatch.id}</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      selectedBatch.mode === 'APPLY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedBatch.mode === 'APPLY' ? 'Modo APPLY (Aplicado a Google)' : 'Modo PREVIEW (Dry Run)'}
                  </span>
                </div>

                {/* Métricas del Lote */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Actor Responsable</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedBatch.actor_user_id}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Coincidencias</span>
                    <span className="font-semibold text-emerald-600 text-sm">{selectedBatch.matches_count}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Faltan en Google</span>
                    <span className="font-semibold text-blue-600 text-sm">{selectedBatch.missing_in_google_count}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 block">Operaciones Aplicadas</span>
                    <span className="font-semibold text-emerald-700 text-sm">{selectedBatch.applied_count}</span>
                  </div>
                </div>

                {/* Ítems del Lote */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">
                    Fichas Evaluadas en este Lote ({selectedBatch.items?.length || 0})
                  </h4>
                  <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Correo Institucional</th>
                          <th className="px-4 py-2.5">Clasificación</th>
                          <th className="px-4 py-2.5">Acción</th>
                          <th className="px-4 py-2.5 text-center">Aplicado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedBatch.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-2.5 font-mono text-slate-700">
                              {item.primary_email}
                              {item.run_completo && <span className="block text-[10px] text-slate-400">RUN: {item.run_completo}</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-semibold text-slate-700">{item.classification}</span>
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-600">{item.proposed_action}</td>
                            <td className="px-4 py-2.5 text-center">
                              {item.action_applied ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">Selecciona un lote a la izquierda para inspeccionar sus detalles.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
