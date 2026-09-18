import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Check
} from 'lucide-react';
import { uploadSigeForDiff, applySigeBatch, SigeBatch, SigeItemStatus } from '../../api/sige';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertBadge } from '../../components/common/AlertBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useRBAC } from '../../hooks/useRBAC';

interface SigeImportProps {
  onBatchApplied?: () => void;
}

export const SigeImportPage: React.FC<SigeImportProps> = ({ onBatchApplied }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [periodoAnio, setPeriodoAnio] = useState<number>(2026);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [diffBatch, setDiffBatch] = useState<SigeBatch | null>(null);

  // High-risk confirmation modal state
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  const { canManageSige } = useRBAC();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setDiffBatch(null);
      setError(null);
      setAppliedSuccess(false);
    }
  };

  const handleRunDiff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError(null);
      const result = await uploadSigeForDiff(selectedFile, periodoAnio);
      setDiffBatch(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmApply = async () => {
    if (!diffBatch) return;

    try {
      setApplying(true);
      setError(null);
      await applySigeBatch(diffBatch.id);
      setAppliedSuccess(true);
      setShowApplyModal(false);
      if (onBatchApplied) onBatchApplied();
    } catch (err: any) {
      setError(err);
      setShowApplyModal(false);
    } finally {
      setApplying(false);
    }
  };

  const categories = [
    { label: 'Sin Cambios', count: diffBatch?.unchanged_count ?? 0, status: 'SIN_CAMBIOS' as SigeItemStatus },
    { label: 'Nuevos Alumnos', count: diffBatch?.created_count ?? 0, status: 'NUEVO' as SigeItemStatus },
    { label: 'Actualizaciones', count: diffBatch?.updated_count ?? 0, status: 'ACTUALIZACION' as SigeItemStatus },
    { label: 'Cambios de Curso', count: diffBatch?.course_change_count ?? 0, status: 'CAMBIO_CURSO' as SigeItemStatus },
    { label: 'Cambios de Estado', count: diffBatch?.status_change_count ?? 0, status: 'CAMBIO_ESTADO' as SigeItemStatus },
    { label: 'Cambios de Relación', count: diffBatch?.relation_change_count ?? 0, status: 'CAMBIO_RELACION' as SigeItemStatus },
    { label: 'Conflictos', count: diffBatch?.conflict_count ?? 0, status: 'CONFLICTO' as SigeItemStatus },
    { label: 'Revisión Manual', count: diffBatch?.manual_review_count ?? 0, status: 'REVISION_MANUAL' as SigeItemStatus },
    { label: 'Errores en Nómina', count: diffBatch?.error_count ?? 0, status: 'ERROR' as SigeItemStatus },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Integración Asistida SIGE (MINEDUC)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Carga, análisis de discrepancias (Diff) y aplicación atómica controlada de nóminas oficiales.
        </p>
      </div>

      {/* Formulario de Carga y Previsualización */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <form onSubmit={handleRunDiff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Archivo Oficial SIGE (.csv o .xlsx)
              </label>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                disabled={loading}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-lbla-blue hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-xl p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Año Escolar / Período
              </label>
              <input
                type="number"
                value={periodoAnio}
                onChange={(e) => setPeriodoAnio(parseInt(e.target.value) || 2026)}
                disabled={loading}
                className="w-full text-xs font-bold px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              {selectedFile ? `Seleccionado: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Formatos soportados: CSV delimitado por punto y coma/coma o Excel XLSX.'}
            </span>

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-lbla-blue hover:bg-lbla-dark text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{loading ? 'Analizando Nómina...' : 'Ejecutar Previsualización (Diff)'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && <ErrorDisplay error={error} />}

      {/* Resultado de la Previsualización (Diff) */}
      {diffBatch && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Resumen del Análisis Diff</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">{diffBatch.filename}</h3>
                <span className="text-xs text-gray-500">
                  Total de filas procesadas: <strong className="text-gray-800">{diffBatch.total_rows}</strong> &bull; Válidas: <strong>{diffBatch.valid_rows}</strong> &bull; Inválidas: <strong>{diffBatch.invalid_rows}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <AlertBadge status={diffBatch.status} />

                {canManageSige && diffBatch.status === 'PREVIEW' && !appliedSuccess && (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aplicar Nómina a Core</span>
                  </button>
                )}
              </div>
            </div>

            {appliedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Nómina aplicada exitosamente a la base canónica de Core bajo transacción atómica.</span>
              </div>
            )}

            {/* Cuadrícula de 9 Categorías */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.status}
                  className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/60 flex items-center justify-between"
                >
                  <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{cat.count}</span>
                    <AlertBadge status={cat.status} label="" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Anomalías o Conflictos si existen */}
          {diffBatch.items && diffBatch.items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Muestra de Filas Analizadas
                </h4>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Fila</th>
                      <th className="px-4 py-2.5">RUN</th>
                      <th className="px-4 py-2.5">Curso</th>
                      <th className="px-4 py-2.5">Clasificación Diff</th>
                      <th className="px-4 py-2.5">Detalles / Anomalía</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {diffBatch.items.slice(0, 50).map((it) => (
                      <tr key={it.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-mono text-gray-400">{it.row_number}</td>
                        <td className="px-4 py-2 font-mono font-medium text-gray-900">{it.run_completo}</td>
                        <td className="px-4 py-2 font-semibold text-lbla-blue">{it.curso_codigo || '—'}</td>
                        <td className="px-4 py-2">
                          <AlertBadge status={it.status} />
                        </td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-xs">
                          {it.error_message || (it.diff_details ? JSON.stringify(it.diff_details) : '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación para Operación de Alto Riesgo (F5.12) */}
      <ConfirmModal
        isOpen={showApplyModal}
        title="Confirmar Aplicación de Nómina SIGE"
        message="Esta acción mutará de forma permanente y transaccional los registros de Personas, Estudiantes y Matrículas en LBLA Core conforme a las discrepancias detectadas."
        confirmLabel="Sí, Aplicar a Core"
        cancelLabel="Revisar Nuevamente"
        isDanger={false}
        isLoading={applying}
        details={
          diffBatch && (
            <div>
              <div>Archivo: <strong>{diffBatch.filename}</strong></div>
              <div>Período: <strong>{diffBatch.periodo_anio}</strong></div>
              <div>Nuevos: <strong>{diffBatch.created_count}</strong> | Actualizaciones: <strong>{diffBatch.updated_count}</strong></div>
              <div>Cambios de Curso: <strong>{diffBatch.course_change_count}</strong></div>
            </div>
          )
        }
        onConfirm={handleConfirmApply}
        onCancel={() => setShowApplyModal(false)}
      />
    </div>
  );
};
