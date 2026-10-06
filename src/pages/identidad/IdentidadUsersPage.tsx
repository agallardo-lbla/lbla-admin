import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  History,
  Sliders,
  ShieldCheck,
  Users,
  RefreshCw,
  Sparkles,
  Clock,
  Building,
  BookOpen,
  Laptop,
  ShoppingBag,
  Filter,
  CheckCircle2
} from 'lucide-react';
import {
  fetchIdentities,
  lockIdentity,
  unlockIdentity,
  fetchIdentityAuditLogs,
  fetchStaffAccounts,
  syncStaffDirectory,
  IdentityUser,
  IdentityAuditLog,
  StaffAccountItem,
} from '../../api/identity';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PermisosModal, PermisosTargetUser } from '../../components/identidad/PermisosModal';
import { useRBAC } from '../../hooks/useRBAC';

type TabType = 'staff' | 'identities' | 'audit';

export const IdentidadUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('staff');

  // Estados de Identidades LBLA ID
  const [identities, setIdentities] = useState<IdentityUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<IdentityAuditLog[]>([]);
  const [loadingIdentities, setLoadingIdentities] = useState(true);
  const [identitiesError, setIdentitiesError] = useState<any>(null);
  const [identitiesSearch, setIdentitiesSearch] = useState('');

  // Estados de Cuentas de Funcionarios (Pre-aprovisionamiento)
  const [staffAccounts, setStaffAccounts] = useState<StaffAccountItem[]>([]);
  const [lastSyncInfo, setLastSyncInfo] = useState<any>(null);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState<any>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPROVISIONED' | 'PREPARED' | 'ACTIVE'>('ALL');
  const [estamentoFilter, setEstamentoFilter] = useState<'ALL' | 'DOCENTE' | 'ASISTENTE' | 'DIRECTIVO'>('ALL');
  const [syncingDirectory, setSyncingDirectory] = useState(false);

  // Modales
  const [selectedUser, setSelectedUser] = useState<IdentityUser | null>(null);
  const [modalAction, setModalAction] = useState<'lock' | 'unlock' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Permisos Modal target (puede ser IdentityUser o StaffAccountItem)
  const [permisosTarget, setPermisosTarget] = useState<PermisosTargetUser | null>(null);

  const { canManageIdentity, hasRole } = useRBAC();
  const isSuperAdmin = hasRole('SUPERADMIN');

  // Carga de cuentas de funcionarios
  const loadStaffData = async () => {
    try {
      setLoadingStaff(true);
      setStaffError(null);
      const res = await fetchStaffAccounts({
        q: staffSearch,
        provisioning_status: statusFilter !== 'ALL' ? statusFilter : undefined,
        estamento: estamentoFilter !== 'ALL' ? estamentoFilter : undefined,
      });
      setStaffAccounts(res.results || []);
      setLastSyncInfo(res.last_sync || null);
    } catch (err: any) {
      setStaffError(err);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Carga de identidades generales y auditoría
  const loadIdentitiesData = async () => {
    try {
      setLoadingIdentities(true);
      setIdentitiesError(null);
      const [users, logs] = await Promise.all([
        fetchIdentities({ q: identitiesSearch }),
        fetchIdentityAuditLogs(),
      ]);
      setIdentities(users);
      setAuditLogs(logs);
    } catch (err: any) {
      setIdentitiesError(err);
    } finally {
      setLoadingIdentities(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, [staffSearch, statusFilter, estamentoFilter]);

  useEffect(() => {
    loadIdentitiesData();
  }, [identitiesSearch]);

  const handleSyncDirectory = async () => {
    try {
      setSyncingDirectory(true);
      setFeedbackMsg(null);
      const res = await syncStaffDirectory();
      setFeedbackMsg(`Sincronización completada: ${res.total_core_evaluated} funcionarios evaluados contra Google Workspace.`);
      await loadStaffData();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setStaffError(err.message || 'Error al sincronizar directorio con Google Workspace.');
    } finally {
      setSyncingDirectory(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedUser || !modalAction) return;

    try {
      setActionLoading(true);
      if (modalAction === 'lock') {
        await lockIdentity(selectedUser.id, 30);
        setFeedbackMsg(`La cuenta ${selectedUser.username} fue bloqueada exitosamente por 30 minutos.`);
      } else {
        await unlockIdentity(selectedUser.id);
        setFeedbackMsg(`La cuenta ${selectedUser.username} fue desbloqueada y restablecida.`);
      }
      setModalAction(null);
      await loadIdentitiesData();
      await loadStaffData();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setIdentitiesError(err);
      setModalAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Contadores para métricas
  const totalStaff = staffAccounts.length;
  const unprovisionedCount = staffAccounts.filter(s => s.provisioning_status === 'UNPROVISIONED').length;
  const preparedCount = staffAccounts.filter(s => s.provisioning_status === 'PREPARED').length;
  const activeCount = staffAccounts.filter(s => s.provisioning_status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-7 h-7 text-lbla-blue" />
              <span>Gestión de Identidades y Accesos (LBLA ID)</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administración de cuentas institucionales, pre-asignación de permisos por aplicación y proveedor SSO.
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cuentas de Funcionarios</span>
            </button>
            <button
              onClick={() => setActiveTab('identities')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'identities'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Identidades Registradas</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Auditoría SSO</span>
            </button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 1: CUENTAS DE FUNCIONARIOS (PRE-ASIGNACIÓN & GESTIÓN DE PERMISOS) */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Banner de Sincronización del Directorio Institucional */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-sm border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Fuente Oficial Canónica
                </span>
                <span className="text-xs text-blue-200">
                  Google Workspace Directory (@liceolatinoamericano.cl / @lbla.cl) & LBLA Core
                </span>
              </div>
              <h3 className="text-base font-bold">Directorio de Personal y Asignación Anticipada</h3>
              <p className="text-xs text-blue-200 leading-relaxed">
                Permite configurar los permisos satélites (CRA, Recepción, Labs, MiPyme, Reloj) antes de que el funcionario inicie sesión por primera vez.
              </p>
              {lastSyncInfo && (
                <div className="text-[11px] text-blue-300 pt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Última verificación de directorio: {new Date(lastSyncInfo.completed_at).toLocaleString('es-CL')} ({lastSyncInfo.matches_count} coincidencias validadas).
                  </span>
                </div>
              )}
            </div>

            {isSuperAdmin && (
              <button
                onClick={handleSyncDirectory}
                disabled={syncingDirectory}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition shadow-sm shrink-0 border border-blue-400/30 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncingDirectory ? 'animate-spin' : ''}`} />
                <span>{syncingDirectory ? 'Sincronizando con Google...' : 'Sincronizar Directorio'}</span>
              </button>
            )}
          </div>

          {/* Tarjetas de Indicadores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
              <span className="text-xs font-semibold text-gray-500 block">Total Funcionarios</span>
              <span className="text-2xl font-bold text-gray-900 mt-1 block">{totalStaff}</span>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Padrón laboral activo</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-xs font-semibold text-amber-700 block">Sin Identidad</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">{unprovisionedCount}</span>
              <span className="text-[11px] text-amber-600 mt-0.5 block">Pendientes de asignación</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs">
              <span className="text-xs font-semibold text-blue-700 block">Identidades Preparadas</span>
              <span className="text-2xl font-bold text-blue-700 mt-1 block">{preparedCount}</span>
              <span className="text-[11px] text-blue-600 mt-0.5 block">Permisos preasignados</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="text-xs font-semibold text-emerald-700 block">Activas con Sesión</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">{activeCount}</span>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">Con inicio Google SSO</span>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Buscar por nombre, correo institucional (@liceolatinoamericano.cl), usuario o RUN..."
                initialValue={staffSearch}
                onSearch={setStaffSearch}
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="UNPROVISIONED">🟡 Sin identidad aprovisionada</option>
                <option value="PREPARED">🔵 Identidad preparada</option>
                <option value="ACTIVE">🟢 Activa / Con sesión</option>
              </select>

              <select
                value={estamentoFilter}
                onChange={(e) => setEstamentoFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos los Estamentos</option>
                <option value="DOCENTE">Docentes</option>
                <option value="ASISTENTE">Asistentes de la Educación</option>
                <option value="DIRECTIVO">Equipo Directivo</option>
              </select>
            </div>
          </div>

          {/* Tabla de Cuentas Institucionales */}
          {loadingStaff ? (
            <LoadingSpinner message="Consultando cuentas institucionales de funcionarios en Core..." />
          ) : staffError ? (
            <ErrorDisplay error={staffError} onRetry={loadStaffData} />
          ) : staffAccounts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
              <Users className="w-8 h-8 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium">No se encontraron funcionarios con los filtros indicados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Funcionario / Titular</th>
                      <th className="px-6 py-3.5">Cuenta Institucional</th>
                      <th className="px-6 py-3.5">Estado en LBLA ID</th>
                      <th className="px-6 py-3.5">Permisos por Aplicación</th>
                      <th className="px-6 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {staffAccounts.map((s) => {
                      const hasAppPerms = Object.keys(s.app_permissions || {}).length > 0;

                      return (
                        <tr key={s.funcionario_id} className="hover:bg-blue-50/40 transition">
                          {/* Funcionario / Titular */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 text-sm">{s.nombre_completo}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                {s.run_formateado}
                              </span>
                              <span className="text-gray-500 text-[11px]">
                                {s.cargo || s.departamento || s.estamento}
                              </span>
                            </div>
                          </td>

                          {/* Cuenta Institucional */}
                          <td className="px-6 py-4">
                            <span className="font-mono font-medium text-gray-800 block">{s.email}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                s.estamento === 'DOCENTE'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : s.estamento === 'ASISTENTE'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {s.estamento}
                              </span>
                              {s.google_ou && (
                                <span className="font-mono text-[10px] text-gray-400">
                                  OU: {s.google_ou}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Estado en LBLA ID */}
                          <td className="px-6 py-4">
                            {s.provisioning_status === 'UNPROVISIONED' ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>Sin identidad aprovisionada</span>
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  En padrón Core. Sin permisos configurados.
                                </p>
                              </div>
                            ) : s.provisioning_status === 'PREPARED' ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>Identidad preparada</span>
                                </span>
                                <p className="text-[10px] text-blue-600 mt-1">
                                  Permisos listos para su primer inicio de sesión.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  <span>Activa / Con sesión</span>
                                </span>
                                {s.last_login_at && (
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    Último login: {new Date(s.last_login_at).toLocaleDateString('es-CL')}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Permisos por Aplicación */}
                          <td className="px-6 py-4">
                            {hasAppPerms ? (
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(s.app_permissions).map(([app, appRoles]) => {
                                  if (!appRoles || appRoles.length === 0) return null;
                                  const appShort = app.replace('lbla-', '').replace('-client', '').toUpperCase();
                                  return (
                                    <span
                                      key={app}
                                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                                      title={`Permiso en ${app}: ${appRoles.join(', ')}`}
                                    >
                                      <span className="font-bold">{appShort}:</span>
                                      <span>{appRoles.join(', ')}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">
                                Sin permisos satélites asignados
                              </span>
                            )}
                          </td>

                          {/* Acción */}
                          <td className="px-6 py-4 text-right">
                            {isSuperAdmin && (
                              <button
                                onClick={() => setPermisosTarget(s)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition shadow-2xs ${
                                  s.provisioning_status === 'UNPROVISIONED'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                }`}
                                title="Configurar Permisos Anticipados"
                              >
                                {s.provisioning_status === 'UNPROVISIONED' ? (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Preparar Permisos</span>
                                  </>
                                ) : (
                                  <>
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>Editar Permisos</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: IDENTIDADES REGISTRADAS (LBLA ID CUENTAS Y BLOQUEOS)           */}
      {/* ========================================================================= */}
      {activeTab === 'identities' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <SearchInput
              placeholder="Buscar cuenta por username o email..."
              initialValue={identitiesSearch}
              onSearch={setIdentitiesSearch}
            />
          </div>

          {loadingIdentities ? (
            <LoadingSpinner message="Consultando identidades en LBLA ID..." />
          ) : identitiesError ? (
            <ErrorDisplay error={identitiesError} onRetry={loadIdentitiesData} />
          ) : identities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
              <KeyRound className="w-8 h-8 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium">No se encontraron cuentas con los criterios indicados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3.5">Usuario / Identidad</th>
                      <th className="px-6 py-3.5">Email Institucional</th>
                      <th className="px-6 py-3.5">Proveedor</th>
                      <th className="px-6 py-3.5">Roles y Permisos</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {identities.map((u) => {
                      const isLocked = u.is_locked;
                      return (
                        <tr key={u.id} className="hover:bg-blue-50/40 transition">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            <span>{u.username}</span>
                            <span className="block font-mono text-[10px] text-gray-400">ID: {u.id.substring(0, 8)}...</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-600">
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">
                              {u.federated_provider || 'Local / Google'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {u.roles?.map((r) => (
                                <span
                                  key={r}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {r}
                                </span>
                              ))}
                              {u.app_permissions && Object.entries(u.app_permissions).map(([app, appRoles]) => {
                                if (!appRoles || appRoles.length === 0) return null;
                                const appShort = app.replace('lbla-', '').replace('-client', '').toUpperCase();
                                return (
                                  <span
                                    key={app}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5"
                                    title={`Permisos en ${app}: ${appRoles.join(', ')}`}
                                  >
                                    <span className="font-bold">{appShort}:</span> {appRoles.join(', ')}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                <Lock className="w-3 h-3" /> Bloqueado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> Activo
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canManageIdentity && (
                              <div className="inline-flex items-center gap-2">
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => setPermisosTarget(u)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                                    title="Gestionar Permisos por Aplicación"
                                  >
                                    <Sliders className="w-3.5 h-3.5" />
                                    <span>Permisos</span>
                                  </button>
                                )}

                                {isLocked ? (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setModalAction('unlock');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                                    title="Desbloquear Cuenta"
                                  >
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Desbloquear</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setModalAction('lock');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                                    title="Bloquear Cuenta"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Bloquear</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: AUDITORÍA DE IDENTIDAD Y EVENTOS SSO                            */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-lbla-blue" />
              <h3 className="font-bold text-gray-900 text-base">Trazabilidad y Eventos de Identidad LBLA ID</h3>
            </div>
            <span className="text-xs text-gray-400">Ley 19.628 de Protección de Datos Personales</span>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No hay registros de auditoría disponibles.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.event_type}</span>
                      <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        IP: {log.ip_address || '127.0.0.1'}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-gray-500 text-[11px] mt-0.5 font-mono truncate max-w-xl">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-400 text-[11px] shrink-0 font-mono">
                    {new Date(log.created_at).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Bloqueo/Desbloqueo Sensible */}
      <ConfirmModal
        isOpen={!!modalAction}
        title={modalAction === 'lock' ? 'Confirmar Bloqueo de Cuenta' : 'Confirmar Desbloqueo de Cuenta'}
        message={
          modalAction === 'lock'
            ? `¿Deseas bloquear temporalmente la cuenta ${selectedUser?.username}? El usuario no podrá iniciar sesión por 30 minutos.`
            : `¿Deseas desbloquear la cuenta ${selectedUser?.username}? Los contadores de intentos fallidos serán restablecidos a cero.`
        }
        confirmLabel={modalAction === 'lock' ? 'Sí, Bloquear Cuenta' : 'Sí, Desbloquear Cuenta'}
        isDanger={modalAction === 'lock'}
        isLoading={actionLoading}
        onConfirm={handleExecuteAction}
        onCancel={() => setModalAction(null)}
      />

      {/* Modal de Gestión de Permisos por Aplicación (Unificado) */}
      <PermisosModal
        isOpen={!!permisosTarget}
        user={permisosTarget}
        onClose={() => setPermisosTarget(null)}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          loadStaffData();
          loadIdentitiesData();
          setTimeout(() => setFeedbackMsg(null), 5000);
        }}
      />
    </div>
  );
};
