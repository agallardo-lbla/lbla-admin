import React, { useEffect, useState } from 'react';
import { UserCheck, Eye, Users } from 'lucide-react';
import { fetchApoderados, Apoderado } from '../../api/personas';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

interface ApoderadosListProps {
  onSelectApoderado: (id: string) => void;
}

export const ApoderadosListPage: React.FC<ApoderadosListProps> = ({ onSelectApoderado }) => {
  const [apoderados, setApoderados] = useState<Apoderado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadApoderados = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApoderados({ q: searchQuery });
      setApoderados(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApoderados();
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Padrón de Apoderados</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registro de apoderados titulares y suplentes con vínculos familiares vigentes en Core.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar apoderado por nombre o RUN..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando padrón de apoderados..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadApoderados} />
      ) : apoderados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <UserCheck className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron apoderados registrados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">RUN</th>
                  <th className="px-6 py-3.5">Nombre Apoderado</th>
                  <th className="px-6 py-3.5">Parentesco Referencial</th>
                  <th className="px-6 py-3.5">Teléfono Emergencia</th>
                  <th className="px-6 py-3.5 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apoderados.map((a) => {
                  const p = a.persona;
                  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;
                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-blue-50/40 transition cursor-pointer"
                      onClick={() => onSelectApoderado(a.id)}
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900">
                        {runCompleto}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.nombres} {p.apellidos}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">
                        {a.parentesco || 'Apoderado Legal'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {a.telefono_emergencia || p.telefono || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApoderado(a.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-lbla-blue hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
  );
};
