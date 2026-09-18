import React, { useEffect, useState } from 'react';
import { ShieldCheck, Filter, Search, Clock, Lock } from 'lucide-react';
import { fetchAuditLogs, AuditLogItem } from '../../api/audit';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertBadge } from '../../components/common/AlertBadge';

export const AuditoriaPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuditLogs({
        action_type: actionFilter || undefined,
        target_entity: entityFilter || undefined,
      });
      setLogs(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actionFilter, entityFilter]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visor de Auditoría y Trazabilidad</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro inmutable y de solo adición (*append-only*) conforme a la Ley N° 19.628.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono border border-slate-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Append-Only &bull; Inmutable</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las operaciones</option>
          <option value="READ">READ (Lectura PII)</option>
          <option value="CREATE">CREATE (Creación)</option>
          <option value="UPDATE">UPDATE (Modificación)</option>
          <option value="DIFF">DIFF (Análisis SIGE)</option>
          <option value="APPLY">APPLY (Aplicación Nómina)</option>
          <option value="ROLLBACK">ROLLBACK (Reversión)</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las entidades</option>
          <option value="core_personas">core_personas</option>
          <option value="core_estudiantes">core_estudiantes</option>
          <option value="core_academic_matriculas">core_academic_matriculas</option>
          <option value="sige_import_batch">sige_import_batch</option>
          <option value="id_identities">id_identities</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando registro inmutable de auditoría..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <ShieldCheck className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron eventos de auditoría registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Operación</th>
                  <th className="px-6 py-3.5">Actor / Rol</th>
                  <th className="px-6 py-3.5">Entidad Afectada</th>
                  <th className="px-6 py-3.5">IP Origen</th>
                  <th className="px-6 py-3.5">Campos Involucrados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-gray-800">{log.action_type}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-700">
                      <span>{log.actor_user_id.substring(0, 12)}...</span>
                      <span className="block text-[10px] text-gray-400 font-sans">{log.actor_role}</span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-800">
                      {log.target_entity}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 truncate max-w-xs">
                      {log.accessed_fields?.length > 0 ? log.accessed_fields.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
