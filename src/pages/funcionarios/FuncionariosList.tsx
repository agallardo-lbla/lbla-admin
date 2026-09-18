import React, { useEffect, useState } from 'react';
import { Briefcase, Eye, Shield, CheckCircle, XCircle } from 'lucide-react';
import { fetchFuncionarios, Funcionario } from '../../api/personas';
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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dotación de Funcionarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cuerpo docente, directivo y asistentes de la educación registrados en Core.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar funcionario por nombre, cargo o RUN..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando dotación de funcionarios..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadFuncionarios} />
      ) : funcionarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron funcionarios registrados.</p>
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
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          f.es_docente ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.es_docente ? 'Docente' : 'Asistente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {f.activo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFuncionario(f.id);
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
