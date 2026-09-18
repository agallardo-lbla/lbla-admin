import React, { useEffect, useState } from 'react';
import { GraduationCap, Eye, Filter } from 'lucide-react';
import { fetchEstudiantes, Estudiante } from '../../api/personas';
import { SearchInput } from '../../components/common/SearchInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertaEstudianteBadge } from '../../components/common/AlertBadge';
import { CANONICAL_COURSES } from '../../api/academic';

interface EstudiantesListProps {
  onSelectEstudiante: (id: string) => void;
}

export const EstudiantesListPage: React.FC<EstudiantesListProps> = ({ onSelectEstudiante }) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursoFilter, setCursoFilter] = useState('');

  const loadEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEstudiantes({ q: searchQuery, curso: cursoFilter || undefined });
      setEstudiantes(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstudiantes();
  }, [searchQuery, cursoFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Estudiantes Matriculados</h1>
        <p className="text-sm text-gray-500 mt-1">
          Nómina oficial de alumnos y perfiles escolares registrados en LBLA Core.
        </p>
      </div>

      {/* Controles de Búsqueda y Filtrado */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <SearchInput
          placeholder="Buscar estudiante por nombre o RUN..."
          initialValue={searchQuery}
          onSearch={setSearchQuery}
        />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={cursoFilter}
            onChange={(e) => setCursoFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los cursos</option>
            {CANONICAL_COURSES.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      {loading ? (
        <LoadingSpinner message="Consultando nómina de estudiantes..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadEstudiantes} />
      ) : estudiantes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <GraduationCap className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron estudiantes con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">RUN</th>
                  <th className="px-6 py-3.5">Estudiante</th>
                  <th className="px-6 py-3.5">Curso Actual</th>
                  <th className="px-6 py-3.5">N° Matrícula</th>
                  <th className="px-6 py-3.5">Indicador</th>
                  <th className="px-6 py-3.5 text-right">Ficha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estudiantes.map((est) => {
                  const p = est.persona;
                  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;
                  return (
                    <tr
                      key={est.id}
                      className="hover:bg-blue-50/40 transition cursor-pointer"
                      onClick={() => onSelectEstudiante(est.id)}
                    >
                      <td className="px-6 py-4 font-mono text-xs font-medium text-gray-900">
                        {runCompleto}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {p.nombres} {p.apellidos}
                      </td>
                      <td className="px-6 py-4 font-semibold text-lbla-blue text-xs">
                        {est.curso_actual_codigo || <span className="text-gray-400 font-normal">Sin curso</span>}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {est.numero_matricula || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <AlertaEstudianteBadge tieneAlerta={est.tiene_ficha_alerta} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEstudiante(est.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-lbla-blue hover:bg-gray-100 rounded-lg transition"
                          title="Ver Ficha Escolar"
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
