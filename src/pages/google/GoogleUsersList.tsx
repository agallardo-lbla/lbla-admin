import React, { useEffect, useState } from 'react';
import { fetchGoogleUsers, suspendGoogleUser, reactivateGoogleUser, GoogleDirectoryUser } from '../../api/google';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { SearchInput } from '../../components/common/SearchInput';
import { Users, Shield, ShieldAlert, CheckCircle2, UserX, UserCheck, RefreshCw, FolderTree } from 'lucide-react';

export default function GoogleUsersList() {
  const [users, setUsers] = useState<GoogleDirectoryUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedOu, setSelectedOu] = useState<string>('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [totalEstimated, setTotalEstimated] = useState<number>(0);

  // Modal para suspender / reactivar
  const [actionTarget, setActionTarget] = useState<GoogleDirectoryUser | null>(null);
  const [actionType, setActionType] = useState<'SUSPEND' | 'REACTIVATE' | null>(null);
  const [actionReason, setActionReason] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);

  const loadUsers = async (pageToken?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGoogleUsers({
        query: search || undefined,
        org_unit_path: selectedOu || undefined,
        page_token: pageToken,
        max_results: 25,
      });
      setUsers(data.users);
      setNextPageToken(data.next_page_token);
      setTotalEstimated(data.total_estimated || data.users.length);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, selectedOu]);

  const handleActionConfirm = async () => {
    if (!actionTarget || !actionType) return;
    try {
      setActionSubmitting(true);
      if (actionType === 'SUSPEND') {
        await suspendGoogleUser(actionTarget.primaryEmail, actionReason || 'Suspensión administrativa manual');
      } else {
        await reactivateGoogleUser(actionTarget.primaryEmail, actionReason || 'Reactivación administrativa manual');
      }
      setActionTarget(null);
      setActionType(null);
      setActionReason('');
      await loadUsers();
    } catch (err: any) {
      alert(`Error al ejecutar acción: ${err.message || 'Error desconocido'}`);
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Directorio de Cuentas Google Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualización y administración de cuentas institucionales registradas en Google Workspace.
          </p>
        </div>
        <button
          onClick={() => loadUsers()}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <SearchInput
            initialValue={search}
            onSearch={setSearch}
            placeholder="Buscar por correo, nombre o RUN..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FolderTree className="w-4 h-4" />
            <span>OU:</span>
          </div>
          <select
            value={selectedOu}
            onChange={(e) => setSelectedOu(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las Unidades (OUs)</option>
            <option value="/Estudiantes">Estudiantes (General)</option>
            <option value="/Estudiantes/1° Medio">1° Medio</option>
            <option value="/Estudiantes/2° Medio">2° Medio</option>
            <option value="/Estudiantes/3° Medio">3° Medio</option>
            <option value="/Estudiantes/4° Medio">4° Medio</option>
            <option value="/Funcionarios">Funcionarios (General)</option>
            <option value="/Funcionarios/Docentes">Docentes</option>
            <option value="/Funcionarios/Asistentes de la Educación">Asistentes</option>
            <option value="/Funcionarios/Equipo Directivo y Administración">Directivos</option>
            <option value="/Egresados">Egresados</option>
          </select>
        </div>
      </div>

      {/* Contenido / Tabla */}
      {loading ? (
        <LoadingSpinner message="Consultando cuentas de Google Workspace..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={() => loadUsers()} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No se encontraron cuentas</p>
          <p className="text-sm mt-1">Prueba ajustando los filtros de búsqueda o unidad organizativa.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Usuario / Correo</th>
                  <th className="px-6 py-3.5">RUN / ID Externo</th>
                  <th className="px-6 py-3.5">Unidad Organizativa (OU)</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u) => {
                  const runExt = u.externalIds?.find((e) => e.type === 'organization')?.value || '-';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{u.name?.fullName || 'Sin nombre'}</div>
                        <div className="font-mono text-xs text-blue-600">{u.primaryEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {runExt}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                        {u.orgUnitPath}
                      </td>
                      <td className="px-6 py-4">
                        {u.suspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <UserX className="w-3.5 h-3.5" /> Suspendida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Activa
                          </span>
                        )}
                        {u.isAdmin && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.suspended ? (
                          <button
                            onClick={() => {
                              setActionTarget(u);
                              setActionType('REACTIVATE');
                            }}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Reactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActionTarget(u);
                              setActionType('SUSPEND');
                            }}
                            className="text-xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" /> Suspender
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {nextPageToken && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-center">
              <button
                onClick={() => loadUsers(nextPageToken)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-sm"
              >
                Cargar Siguiente Página de Cuentas
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación para Suspender / Reactivar */}
      <ConfirmModal
        isOpen={Boolean(actionTarget && actionType)}
        onCancel={() => {
          setActionTarget(null);
          setActionType(null);
          setActionReason('');
        }}
        onConfirm={handleActionConfirm}
        title={actionType === 'SUSPEND' ? 'Suspender Cuenta Google' : 'Reactivar Cuenta Google'}
        message={`¿Estás seguro de que deseas ${actionType === 'SUSPEND' ? 'suspender' : 'reactivar'} la cuenta institucional de ${actionTarget?.name?.fullName} (${actionTarget?.primaryEmail}) en Google Workspace?`}
        confirmLabel={actionType === 'SUSPEND' ? 'Suspender Cuenta' : 'Reactivar Cuenta'}
        isDanger={actionType === 'SUSPEND'}
        isLoading={actionSubmitting}
        details={
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Motivo de la acción (obligatorio para auditoría):
            </label>
            <input
              type="text"
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Ej. Retiro voluntario, licencia médica, solicitud formal..."
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        }
      />
    </div>
  );
}
