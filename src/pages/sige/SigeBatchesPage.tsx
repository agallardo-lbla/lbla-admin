import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, RotateCcw, Eye, Clock } from 'lucide-react';
import { fetchSigeBatches, rollbackSigeBatch, SigeBatch } from '../../api/sige';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertBadge } from '../../components/common/AlertBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useRBAC } from '../../hooks/useRBAC';

export const SigeBatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<SigeBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Rollback modal state
  const [selectedBatch, setSelectedBatch] = useState<SigeBatch | null>(null);
  const [showRollbackModal, setShowRollbackModal] = useState<boolean>(false);
  const [rollingBack, setRollingBack] = useState<boolean>(false);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  const { canManageSige } = useRBAC();

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSigeBatches();
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

  const handleConfirmRollback = async () => {
    if (!selectedBatch) return;

    try {
      setRollingBack(true);
      setError(null);
      await rollbackSigeBatch(selectedBatch.id);
      setRollbackSuccess(`El lote ${selectedBatch.filename} fue revertido exitosamente.`);
      setShowRollbackModal(false);
      loadBatches();
    } catch (err: any) {
      setError(err);
      setShowRollbackModal(false);
    } finally {
      setRollingBack(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Lotes SIGE</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registro inmutable de procesos de sincronización y reversión histórica de nóminas oficiales.
        </p>
      </div>

      {rollbackSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
          {rollbackSuccess}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Cargando historial de lotes SIGE..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadBatches} />
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se han registrado importaciones previas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Archivo / Lote</th>
                  <th className="px-6 py-3.5">Período</th>
                  <th className="px-6 py-3.5">Filas Totales</th>
                  <th className="px-6 py-3.5">Nuevos / Modificados</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="font-semibold block">{b.filename}</span>
                      <span className="text-[11px] text-gray-400 font-mono">ID: {b.id.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {b.periodo_anio}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      {b.total_rows}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-700 font-medium">+{b.created_count}</span> /{' '}
                      <span className="text-amber-700 font-medium">~{b.updated_count}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(b.created_at).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      <AlertBadge status={b.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManageSige && b.status === 'APPLIED' && (
                        <button
                          onClick={() => {
                            setSelectedBatch(b);
                            setShowRollbackModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
                          title="Revertir Lote"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Rollback</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Reversión (Operación Sensible F5.12) */}
      <ConfirmModal
        isOpen={showRollbackModal}
        title="Confirmar Rollback de Lote SIGE"
        message="Esta acción revertirá las modificaciones introducidas por este lote de importación. Asegúrate de verificar las consecuencias antes de continuar."
        confirmLabel="Sí, Ejecutar Rollback"
        isDanger={true}
        isLoading={rollingBack}
        details={
          selectedBatch && (
            <div>
              <div>Lote: <strong>{selectedBatch.filename}</strong></div>
              <div>Filas afectadas: <strong>{selectedBatch.created_count + selectedBatch.updated_count}</strong></div>
            </div>
          )
        }
        onConfirm={handleConfirmRollback}
        onCancel={() => setShowRollbackModal(false)}
      />
    </div>
  );
};
