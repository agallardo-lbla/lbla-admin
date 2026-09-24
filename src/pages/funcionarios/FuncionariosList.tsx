import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  UploadCloud,
  UserPlus,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  fetchFuncionarios,
  Funcionario,
  createFuncionario,
  importFuncionariosNomina,
  CreateFuncionarioPayload,
} from '../../api/personas';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

interface FuncionariosListProps {
  onSelectFuncionario: (id: string) => void;
}

export const FuncionariosListPage: React.FC<FuncionariosListProps> = ({ onSelectFuncionario }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados Importación
  const [docentesFile, setDocentesFile] = useState<File | null>(null);
  const [asistentesFile, setAsistentesFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Estados Creación Manual
  const [formData, setFormData] = useState<CreateFuncionarioPayload>({
    run_input: '',
    nombres: '',
    apellidos: '',
    estamento: 'DOCENTE',
    cargo: '',
    departamento: 'Cuerpo Docente',
    numero_registro: '44 hrs',
    activo: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadFuncionarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFuncionarios({ q: searchQuery });
      setFuncionarios(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuncionarios();
  }, [searchQuery]);

  // Manejar importación (Dry-run o Apply)
  const handleProcessImport = async (apply: boolean) => {
    if (!docentesFile && !asistentesFile) {
      setImportError('Debe seleccionar al menos un archivo CSV (Docentes o Asistentes).');
      return;
    }
    try {
      setImportLoading(true);
      setImportError(null);
      const fd = new FormData();
      if (docentesFile) fd.append('docentes', docentesFile);
      if (asistentesFile) fd.append('asistentes', asistentesFile);
      fd.append('apply', apply ? 'true' : 'false');
      fd.append('dry_run', apply ? 'false' : 'true');

      const res = await importFuncionariosNomina(fd);
      setImportResult(res);

      if (apply && res.success) {
        await loadFuncionarios();
      }
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar la nómina.');
    } finally {
      setImportLoading(false);
    }
  };

  // Manejar creación manual
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.run_input || !formData.nombres || !formData.apellidos || !formData.cargo) {
      setCreateError('Por favor complete todos los campos obligatorios.');
      return;
    }
    try {
      setCreateLoading(true);
      setCreateError(null);
      await createFuncionario(formData);
      setShowCreateModal(false);
      setFormData({
        run_input: '',
        nombres: '',
        apellidos: '',
        estamento: 'DOCENTE',
        cargo: '',
        departamento: 'Cuerpo Docente',
        numero_registro: '44 hrs',
        activo: true,
      });
      await loadFuncionarios();
    } catch (err: any) {
      setCreateError(err.message || 'Error al registrar el funcionario.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dotación de Funcionarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cuerpo docente, directivo y asistentes de la educación registrados en Core.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setImportResult(null);
              setImportError(null);
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Nómina MINEDUC</span>
          </button>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lbla-blue hover:bg-lbla-dark text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Funcionario</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar funcionario por nombre, cargo o RUN..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </div>

      {/* Listado Principal */}
      {loading ? (
        <LoadingSpinner message="Consultando dotación de funcionarios..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadFuncionarios} />
      ) : funcionarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron funcionarios registrados.</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Cargar nómina MINEDUC
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Agregar manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">RUN</th>
                  <th className="px-6 py-3.5">Funcionario</th>
                  <th className="px-6 py-3.5">Cargo Institucional</th>
                  <th className="px-6 py-3.5">Correo Institucional</th>
                  <th className="px-6 py-3.5">Tipo</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {funcionarios.map((f) => {
                  const p = f.persona;
                  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;
                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-blue-50/40 transition cursor-pointer"
                      onClick={() => onSelectFuncionario(f.id)}
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900">
                        {runCompleto}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.nombres} {p.apellidos}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700">
                        {f.cargo}
                        {f.departamento && <span className="text-gray-400 block text-[11px]">{f.departamento}</span>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-indigo-700">
                        {p.email_institucional || <span className="text-gray-400 italic">Sin correo</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          f.es_docente ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.es_docente ? 'Docente' : 'Asistente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          f.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {f.activo ? (
                            <><CheckCircle className="w-3 h-3" /> Activo</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> Inactivo</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-400 group-hover:text-blue-600 transition inline-block">
                          <Eye className="w-4 h-4 ml-auto" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Importar Nómina MINEDUC */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <FileSpreadsheet className="w-5 h-5" />
                <h3 className="text-base text-gray-900">Actualizar Dotación de Funcionarios (MINEDUC)</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Sube las nóminas oficiales descargadas desde el portal del MINEDUC (formato CSV con delimitador punto y coma).
            </p>

            <div className="space-y-4 text-xs">
              {/* Archivo Docentes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nómina Docentes y Directivos (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setDocentesFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-xl p-1"
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">Ejemplo: lista_docentes_rbd_2375_anio_2026.csv</span>
              </div>

              {/* Archivo Asistentes */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nómina Asistentes de la Educación (CSV)
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setAsistentesFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-xl p-1"
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">Ejemplo: lista_asistentes_rbd_2375_anio_2026.csv</span>
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Resumen de Previsualización */}
              {importResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {importResult.dry_run ? 'Previsualización de Diferencias' : '¡Carga Aplicada con Éxito!'}
                  </div>
                  <ul className="text-[11px] list-disc pl-5 space-y-0.5 text-emerald-700">
                    <li>Total detectados: {importResult.stats?.total_unicos || 0} funcionarios</li>
                    <li>Nuevos registros: {importResult.stats?.creados || 0}</li>
                    <li>Registros actualizados: {importResult.stats?.actualizados || 0}</li>
                    <li>Errores: {importResult.stats?.errores || 0}</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={importLoading || (!docentesFile && !asistentesFile)}
                onClick={() => handleProcessImport(false)}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition disabled:opacity-50"
              >
                {importLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Previsualizar'}
              </button>
              <button
                type="button"
                disabled={importLoading || (!docentesFile && !asistentesFile)}
                onClick={() => handleProcessImport(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {importLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirmar y Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Funcionario Manual */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base text-gray-900">Registrar Nuevo Funcionario</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">RUN *</label>
                <input
                  type="text"
                  placeholder="12.345.678-9"
                  value={formData.run_input}
                  onChange={(e) => setFormData({ ...formData, run_input: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Carlos"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    placeholder="Ej. Pérez Soto"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estamento *</label>
                  <select
                    value={formData.estamento}
                    onChange={(e: any) => {
                      const est = e.target.value;
                      setFormData({
                        ...formData,
                        estamento: est,
                        departamento: est === 'DIRECTIVO' ? 'Equipo Directivo' : est === 'DOCENTE' ? 'Cuerpo Docente' : 'Asistentes de la Educación'
                      });
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DOCENTE">Docente</option>
                    <option value="ASISTENTE">Asistente</option>
                    <option value="DIRECTIVO">Directivo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Horas Contrato</label>
                  <input
                    type="text"
                    placeholder="44 hrs"
                    value={formData.numero_registro}
                    onChange={(e) => setFormData({ ...formData, numero_registro: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cargo Institucional *</label>
                <input
                  type="text"
                  placeholder="Ej. Docente de Matemáticas, Inspector de Patio..."
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-lbla-blue hover:bg-lbla-dark rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Guardar Funcionario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
