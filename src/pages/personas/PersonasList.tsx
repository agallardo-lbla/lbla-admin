import React, { useEffect, useState } from 'react';
import { Users, Filter, Plus, ChevronRight, Eye } from 'lucide-react';
import { fetchPersonas, Persona } from '../../api/personas';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { useRBAC } from '../../hooks/useRBAC';

interface PersonasListProps {
  onSelectPersona: (id: string) => void;
  onCreatePersona?: () => void;
}

export const PersonasListPage: React.FC<PersonasListProps> = ({
  onSelectPersona,
  onCreatePersona,
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const { canCreatePersona } = useRBAC();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPersonas({ q: searchQuery, tipo: tipoFilter || undefined });
      setPersonas(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, tipoFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Padrón Canónico de Personas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro institucional único y centralizado de identidades base en LBLA Core.
          </p>
        </div>
        {canCreatePersona && onCreatePersona && (
          <button
            onClick={onCreatePersona}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lbla-blue hover:bg-lbla-dark text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Persona</span>
          </button>
        )}
      </div>

      {/* Controles de Búsqueda y Filtrado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar por RUN, nombre o apellido..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los perfiles</option>
            <option value="estudiante">Estudiantes</option>
            <option value="funcionario">Funcionarios</option>
            <option value="apoderado">Apoderados</option>
          </select>
        </div>
      </div>

      {/* Contenido Principal */}
      {loading ? (
        <LoadingSpinner message="Consultando padrón de personas en Core..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
      ) : personas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <Users className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron personas con los criterios indicados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">RUN</th>
                  <th className="px-6 py-3.5">Nombre Completo</th>
                  <th className="px-6 py-3.5">Email Institucional</th>
                  <th className="px-6 py-3.5">Perfiles Activos</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-normal">
                {personas.map((p) => {
                  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 transition cursor-pointer"
                      onClick={() => onSelectPersona(p.id)}
                    >
                      <td className="px-6 py-4 font-mono font-medium text-gray-900 text-xs">
                        {runCompleto}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.nombres} {p.apellidos}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {p.email_institucional || <span className="text-gray-400 italic">Sin correo</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.perfil_estudiante && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Estudiante
                            </span>
                          )}
                          {p.perfil_funcionario && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Funcionario
                            </span>
                          )}
                          {p.perfil_apoderado && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Apoderado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPersona(p.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-lbla-blue hover:bg-gray-100 rounded-lg transition"
                          title="Ver Ficha"
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
