import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  ArrowUpDown,
  ShieldCheck,
  Filter,
  Play,
  Layers,
  HelpCircle,
  Eye,
  Search,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function GoogleComparisonPage() {
  const [scope, setScope] = useState<'ALL' | 'STUDENTS' | 'STAFF'>('ALL');
  const [currentBatch, setCurrentBatch] = useState<GoogleSyncBatch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // Filtros
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Modales y ejecución de acciones
  const [applyModalType, setApplyModalType] = useState<'TRANSFERS' | 'CREATES' | 'ALL' | 'SINGLE' | null>(null);
  const [selectedItemForAction, setSelectedItemForAction] = useState<GoogleSyncItem | null>(null);
  const [applying, setApplying] = useState<boolean>(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Cargar automáticamente el último lote analizado
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
      setFilterGrade('ALL');
      setSearchQuery('');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const items = useMemo(() => currentBatch?.items || [], [currentBatch]);

  // Conteo de operaciones pendientes por tipo
  const pendingTransfers = useMemo(() => {
    return items.filter(
      (i) => !i.action_applied && i.proposed_action === 'UPDATE_OU' && !['CONFLICTO', 'REVISION_MANUAL', 'FALTA_EN_CORE'].includes(i.classification)
    );
  }, [items]);

  const pendingCreates = useMemo(() => {
    return items.filter(
      (i) => !i.action_applied && i.proposed_action === 'CREATE' && !['CONFLICTO', 'REVISION_MANUAL', 'FALTA_EN_CORE'].includes(i.classification)
    );
  }, [items]);

  const safeApplicableCount = pendingTransfers.length + pendingCreates.length;

  // Filtrado reactivo de ítems
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filtro por clasificación
      if (filterClass === 'TRANSFERS') {
        const isTransfer = item.proposed_action === 'UPDATE_OU' || item.classification === 'DIFERENCIA';
        if (!isTransfer) return false;
      } else if (filterClass === 'CONFLICTS') {
        if (item.classification !== 'CONFLICTO' && item.classification !== 'REVISION_MANUAL') return false;
      } else if (filterClass !== 'ALL') {
        if (item.classification !== filterClass) return false;
      }

      // 2. Filtro por Curso / Estamento
      if (filterGrade !== 'ALL') {
        const cursoStr = (item.core_data?.curso || item.core_data?.expected_ou || item.google_data?.orgUnitPath || '').toUpperCase();
        if (filterGrade === '1_MEDIO' && !cursoStr.includes('1') && !cursoStr.includes('1°')) return false;
        if (filterGrade === '2_MEDIO' && !cursoStr.includes('2') && !cursoStr.includes('2°')) return false;
        if (filterGrade === '3_MEDIO' && !cursoStr.includes('3') && !cursoStr.includes('3°')) return false;
        if (filterGrade === '4_MEDIO' && !cursoStr.includes('4') && !cursoStr.includes('4°')) return false;
        if (filterGrade === 'FUNCIONARIOS' && item.entity_type !== 'FUNCIONARIO' && !cursoStr.includes('FUNCIONARIO')) return false;
      }

      // 3. Filtro por Búsqueda de texto
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const email = (item.primary_email || '').toLowerCase();
        const coreName = (item.core_data?.nombre || '').toLowerCase();
        const googleName = (item.google_data?.name?.fullName || '').toLowerCase();
        const run = (item.run_completo || '').toLowerCase();
        const matches = email.includes(q) || coreName.includes(q) || googleName.includes(q) || run.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [items, filterClass, filterGrade, searchQuery]);

  // Ejecución de modal por tipo
  const handleExecuteModalAction = async () => {
    if (!currentBatch) return;
    try {
      setApplying(true);
      let options: { actions?: string[]; item_ids?: string[] } = {};

      if (applyModalType === 'TRANSFERS') {
        options = { actions: ['UPDATE_OU'] };
      } else if (applyModalType === 'CREATES') {
        options = { actions: ['CREATE'] };
      } else if (applyModalType === 'SINGLE' && selectedItemForAction) {
        options = { item_ids: [selectedItemForAction.id] };
      }

      const updated = await applyGoogleBatch(currentBatch.id, true, options);
      setCurrentBatch(updated);
      setApplyModalType(null);
      setSelectedItemForAction(null);

      if (updated.error_count > 0) {
        alert(`Sincronización procesada: se ejecutaron ${updated.applied_count} operaciones, pero hubo ${updated.error_count} error(es).`);
      } else if (applyModalType === 'TRANSFERS') {
        alert(`¡Traslados de curso aplicados exitosamente en Google Workspace! (${updated.applied_count} ejecutados)`);
      } else if (applyModalType === 'CREATES') {
        alert(`¡Cuentas institucionales creadas exitosamente en Google Workspace! (${updated.applied_count} cuentas creadas)`);
      } else if (applyModalType === 'SINGLE') {
        alert('¡Operación individual aplicada exitosamente!');
      } else {
        alert(`¡Sincronización aplicada exitosamente! Se ejecutaron ${updated.applied_count} operaciones.`);
      }
    } catch (err: any) {
      alert(`Error al aplicar cambios: ${err.message || 'Error desconocido'}`);
    } finally {
      setApplying(false);
    }
  };

  // Ejecución directa de una fila individual
  const handleApplySingleDirect = async (item: GoogleSyncItem) => {
    if (!currentBatch) return;
    try {
      setActionInProgressId(item.id);
      const updated = await applyGoogleBatch(currentBatch.id, true, { item_ids: [item.id] });
      setCurrentBatch(updated);
      const updatedItem = updated.items?.find((i) => i.id === item.id);
      if (updatedItem?.error_message) {
        alert(`Error al aplicar en Google Workspace: ${updatedItem.error_message}`);
      } else {
        alert(`Operación aplicada exitosamente para ${item.primary_email}`);
      }
    } catch (err: any) {
      alert(`Error al aplicar cambio para ${item.primary_email}: ${err.message || 'Error desconocido'}`);
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-7 h-7 text-blue-600" />
            Mesa de Comparación: Core ↔ Google Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Control autónomo de sincronización: aplica traslados de curso, creación de cuentas o cambios individuales.
          </p>
        </div>

        {/* Acciones principales y Selectores */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            disabled={loading || applying}
          >
            <option value="ALL">Todos los Estamentos</option>
            <option value="STUDENTS">Solo Estudiantes</option>
            <option value="STAFF">Solo Funcionarios</option>
          </select>

          <button
            onClick={handleRunPreview}
            disabled={loading || applying}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {currentBatch ? 'Re-analizar (Dry Run)' : 'Ejecutar Análisis'}
          </button>

          {/* Botón Opción A: Aplicar solo traslados de curso */}
          {pendingTransfers.length > 0 && (
            <button
              onClick={() => setApplyModalType('TRANSFERS')}
              disabled={applying || loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              title="Aplica la actualización de curso/OU a los alumnos que cambiaron de nivel o paralelo"
            >
              <ArrowUpDown className="w-4 h-4" />
              Aplicar Traslados ({pendingTransfers.length})
            </button>
          )}

          {/* Botón Opción B: Crear cuentas nuevas faltantes */}
          {pendingCreates.length > 0 && (
            <button
              onClick={() => setApplyModalType('CREATES')}
              disabled={applying || loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              title="Crea las cuentas faltantes en Google Workspace con contraseña institucional inicial"
            >
              <UserPlus className="w-4 h-4" />
              Crear Cuentas ({pendingCreates.length})
            </button>
          )}
        </div>
      </div>

      {/* Banner de Ayuda Didáctica Desplegable */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-slate-700">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowHelp(!showHelp)}>
          <div className="flex items-center gap-2 font-semibold text-blue-900 text-sm">
            <Info className="w-4 h-4 text-blue-600" />
            ¿Por qué existen estas opciones y qué significa cada ajuste?
          </div>
          <button className="text-blue-700 font-medium flex items-center gap-1">
            {showHelp ? 'Ocultar explicación' : 'Ver explicación'}
            {showHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showHelp && (
          <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <span className="font-bold text-indigo-700 text-xs uppercase block mb-1">
                Opción A: Traslados de Curso (Mover OU)
              </span>
              <p>
                Alumnos que <strong>ya tienen cuenta en Google Workspace</strong>, pero su Unidad Organizativa (OU) corresponde al año anterior o a otro paralelo (ej. estaban en <em>1°C 2025</em> y pasaron a <em>2°A 2026</em>, o cambiaron de <em>3°C</em> a <em>3°A</em>).
              </p>
              <p className="mt-1 text-slate-500">
                Al presionar <strong>"Aplicar Traslados"</strong>, solo se mueven sus carpetas en Google sin alterar contraseñas ni tocar a nadie más.
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <span className="font-bold text-emerald-700 text-xs uppercase block mb-1">
                Opción B: Creación de Cuentas Nuevas
              </span>
              <p>
                Alumnos matriculados en Core que no tenían correo institucional. La gran mayoría son <strong>incorporaciones nuevas de 2°, 3° y 4° Medio</strong>.
              </p>
              <p className="mt-1 text-slate-500">
                <em>Nota sobre 1° Medio:</em> El 97% de los alumnos de 1° Medio ya tiene su cuenta operativa y figura en verde en <strong>"Coinciden"</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorDisplay error={error} onRetry={handleRunPreview} />}

      {loading && <LoadingSpinner message="Ejecutando comparación determinista entre LBLA Core y Google Workspace..." />}

      {!currentBatch && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay análisis en curso</p>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Haz clic en <span className="font-semibold text-blue-600">"Ejecutar Análisis"</span> para consultar Core y Google Workspace, clasificar diferencias y generar la propuesta de cambios de forma 100% segura.
          </p>
        </div>
      )}

      {currentBatch && !loading && (
        <>
          {/* Métricas del Lote */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Evaluados</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-800">{items.length}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Registros analizados</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <span className="text-xs font-medium text-emerald-700 block">Coinciden</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">{currentBatch.matches_count}</span>
              <span className="text-[11px] text-emerald-500 block mt-0.5">Sin discrepancias</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
              <span className="text-xs font-medium text-indigo-700 block">Traslados Pendientes</span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-600">{pendingTransfers.length}</span>
              <span className="text-[11px] text-indigo-500 block mt-0.5">Cambio de Curso/OU</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
              <span className="text-xs font-medium text-blue-700 block">Faltan en Google</span>
              <span className="text-xl sm:text-2xl font-bold text-blue-600">{pendingCreates.length}</span>
              <span className="text-[11px] text-blue-500 block mt-0.5">Pendientes de Alta</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
              <span className="text-xs font-medium text-purple-700 block">Faltan en Core</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600">{currentBatch.missing_in_core_count}</span>
              <span className="text-[11px] text-purple-500 block mt-0.5">Cuentas en Google</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
              <span className="text-xs font-medium text-rose-700 block">Conflictos / Rev.</span>
              <span className="text-xl sm:text-2xl font-bold text-rose-600">
                {currentBatch.conflicts_count + currentBatch.manual_review_count}
              </span>
              <span className="text-[11px] text-rose-500 block mt-0.5">Excluidos de Apply</span>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Pestañas por Clasificación */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'Todas las Fichas', count: items.length },
                  { id: 'COINCIDE', label: 'Coinciden', count: currentBatch.matches_count },
                  { id: 'TRANSFERS', label: 'Traslados de Curso', count: pendingTransfers.length },
                  { id: 'FALTA_EN_GOOGLE', label: 'Faltan en Google', count: pendingCreates.length },
                  { id: 'FALTA_EN_CORE', label: 'Faltan en Core', count: currentBatch.missing_in_core_count },
                  { id: 'CONFLICTS', label: 'Conflictos', count: currentBatch.conflicts_count + currentBatch.manual_review_count },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterClass(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
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

              {/* Filtro por Curso / Nivel */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Curso:</span>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="ALL">Todos los Cursos</option>
                  <option value="1_MEDIO">1° Medio</option>
                  <option value="2_MEDIO">2° Medio</option>
                  <option value="3_MEDIO">3° Medio</option>
                  <option value="4_MEDIO">4° Medio</option>
                  <option value="FUNCIONARIOS">Solo Funcionarios</option>
                </select>
              </div>
            </div>

            {/* Buscador de texto */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, correo institucional o RUN..."
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-2"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Tabla Comparativa con Acciones Granulares */}
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
                    <th className="px-6 py-3.5 text-center">Acción Directa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                        No se encontraron registros con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const isTransfer = item.proposed_action === 'UPDATE_OU';
                      const isCreate = item.proposed_action === 'CREATE';
                      const isActionLoading = actionInProgressId === item.id;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Columna: Persona / Correo */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">
                              {item.core_data?.nombre || item.google_data?.name?.fullName || 'Desconocido'}
                            </div>
                            <div className="font-mono text-xs text-blue-600">{item.primary_email}</div>
                            {item.run_completo && (
                              <span className="font-mono text-[11px] text-slate-400">RUN: {item.run_completo}</span>
                            )}
                          </td>

                          {/* Columna: Clasificación */}
                          <td className="px-6 py-4">
                            <ClassificationBadge classification={item.classification} />
                          </td>

                          {/* Columna: Datos en Core */}
                          <td className="px-6 py-4 text-xs">
                            {item.core_data && Object.keys(item.core_data).length > 0 ? (
                              <div className="space-y-0.5">
                                <div>
                                  <span className="text-slate-400">Estamento:</span>{' '}
                                  <span className="font-medium text-slate-700">{item.entity_type}</span>
                                </div>
                                {item.core_data.curso && (
                                  <div>
                                    <span className="text-slate-400">Curso:</span>{' '}
                                    <span className="font-semibold text-slate-800">{item.core_data.curso}</span>
                                  </div>
                                )}
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

                          {/* Columna: Datos en Google Workspace */}
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

                          {/* Columna: Acción Propuesta con Detalle */}
                          <td className="px-6 py-4">
                            <ProposedActionBadge action={item.proposed_action} />
                            {isTransfer && item.core_data?.expected_ou && item.google_data?.orgUnitPath && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                <span className="line-through text-slate-400">{item.google_data.orgUnitPath.split('/').pop()}</span>
                                <span className="text-indigo-600 font-medium"> → {item.core_data.expected_ou.split('/').pop()}</span>
                              </div>
                            )}
                          </td>

                          {/* Columna: Acción Directa e Individual */}
                          <td className="px-6 py-4 text-center">
                            {item.action_applied ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aplicado
                              </span>
                            ) : isTransfer ? (
                              <button
                                onClick={() => handleApplySingleDirect(item)}
                                disabled={isActionLoading || applying}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50"
                                title="Actualizar inmediatamente la Unidad Organizativa de este alumno"
                              >
                                {isActionLoading ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3" />
                                )}
                                Mover Curso
                              </button>
                            ) : isCreate ? (
                              <button
                                onClick={() => handleApplySingleDirect(item)}
                                disabled={isActionLoading || applying}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
                                title="Crear la cuenta de este usuario en Google Workspace"
                              >
                                {isActionLoading ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserPlus className="w-3 h-3" />
                                )}
                                Crear Cuenta
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Al día</span>
                            )}
                            {item.error_message && (
                              <div className="text-[10px] text-rose-600 mt-1 font-mono max-w-[160px] truncate" title={item.error_message}>
                                Error: {item.error_message}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal para Aplicar Traslados de Cursos (Opción A) */}
      <ConfirmModal
        isOpen={applyModalType === 'TRANSFERS'}
        onCancel={() => setApplyModalType(null)}
        onConfirm={handleExecuteModalAction}
        title="Confirmar Traslados de Curso (Opción A)"
        message={`¿Deseas aplicar el traslado de curso para los ${pendingTransfers.length} alumnos detectados?`}
        confirmLabel="Confirmar Traslados de Curso"
        isLoading={applying}
        details={
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Operaciones a ejecutar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Se actualizará la Unidad Organizativa (OU) en Google Workspace al curso 2026 correspondiente.</li>
              <li><strong>NO se creará ninguna cuenta nueva</strong> ni se modificarán contraseñas.</li>
              <li>Los 87 alumnos sin cuenta no serán tocados en esta operación.</li>
            </ul>
          </div>
        }
      />

      {/* Modal para Crear Cuentas Faltantes (Opción B) */}
      <ConfirmModal
        isOpen={applyModalType === 'CREATES'}
        onCancel={() => setApplyModalType(null)}
        onConfirm={handleExecuteModalAction}
        title="Confirmar Creación de Cuentas Faltantes (Opción B)"
        message={`¿Deseas crear las ${pendingCreates.length} cuentas institucionales faltantes en Google Workspace?`}
        confirmLabel="Confirmar Creación de Cuentas"
        isLoading={applying}
        details={
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Operaciones a ejecutar:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Se darán de alta las cuentas en su respectiva Unidad Organizativa de Google.</li>
              <li>Se asignará la contraseña institucional inicial estandarizada con requerimiento de cambio en el primer inicio.</li>
              <li>Los traslados de curso pendientes que no hayan sido aplicados permanecerán intactos.</li>
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
      return <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">Mover Curso</span>;
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
