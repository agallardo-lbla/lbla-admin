import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, Unlock, ShieldAlert, CheckCircle, Search, AlertCircle, History } from 'lucide-react';
import {
  fetchIdentities,
  lockIdentity,
  unlockIdentity,
  fetchIdentityAuditLogs,
  IdentityUser,
  IdentityAuditLog,
} from '../../api/identity';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertBadge } from '../../components/common/AlertBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useRBAC } from '../../hooks/useRBAC';

export const IdentidadUsersPage: React.FC = () => {
  const [identities, setIdentities] = useState<IdentityUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<IdentityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Lock/Unlock Modal state
  const [selectedUser, setSelectedUser] = useState<IdentityUser | null>(null);
  const [modalAction, setModalAction] = useState<'lock' | 'unlock' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const { canManageIdentity } = useRBAC();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [users, logs] = await Promise.all([
        fetchIdentities({ q: searchQuery }),
        fetchIdentityAuditLogs(),
      ]);
      setIdentities(users);
      setAuditLogs(logs);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleExecuteAction = async () => {
    if (!selectedUser || !modalAction) return;

    try {
      setActionLoading(true);
      setError(null);
      if (modalAction === 'lock') {
        await lockIdentity(selectedUser.id, 30);
        setFeedbackMsg(`La cuenta ${selectedUser.username} fue bloqueada exitosamente por 30 minutos.`);
      } else {
        await unlockIdentity(selectedUser.id);
        setFeedbackMsg(`La cuenta ${selectedUser.username} fue desbloqueada y restablecida.`);
      }
      setModalAction(null);
      loadData();
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setError(err);
      setModalAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Identidades (LBLA ID)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administración de cuentas autenticables, estado de sesión y protección anti-fuerza bruta.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
          {feedbackMsg}
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar cuenta por username o email..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando identidades en LBLA ID..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
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
                  <th className="px-6 py-3.5">Roles Institucionales</th>
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
                          {u.federated_provider || 'Local Argon2id'}
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

      {/* Historial Reciente de Auditoría de Identidad */}
      {auditLogs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-lbla-blue" />
            <h3 className="font-bold text-gray-900 text-sm">Eventos Recientes de Autenticación</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-800">{log.event_type}</span>
                  <span className="text-gray-400 ml-2 font-mono text-[11px]">IP: {log.ip_address || '127.0.0.1'}</span>
                </div>
                <span className="text-gray-400 text-[11px]">
                  {new Date(log.created_at).toLocaleString('es-CL')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmación Sensible */}
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
    </div>
  );
};
