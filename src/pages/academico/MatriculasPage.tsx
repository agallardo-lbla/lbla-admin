import React, { useEffect, useState } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { fetchMatriculas, Matricula, CANONICAL_COURSES } from '../../api/academic';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertBadge } from '../../components/common/AlertBadge';

export const MatriculasPage: React.FC = () => {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [cursoFilter, setCursoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMatriculas({
        curso: cursoFilter || undefined,
        estado: estadoFilter || undefined,
      });
      setMatriculas(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cursoFilter, estadoFilter]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Matrículas e Inscripciones Escolares</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registro formal de matrículas por estudiante, período y curso en Core.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
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

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="MATRICULADO">Matriculado</option>
            <option value="RETIRADO">Retirado</option>
            <option value="PROMOVIDO">Promovido</option>
            <option value="REPROBADO">Reprobado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando matrículas en Core..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
      ) : matriculas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 shadow-xs">
          <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No se encontraron matrículas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Estudiante ID / RUN</th>
                  <th className="px-6 py-3.5">Curso</th>
                  <th className="px-6 py-3.5">Período</th>
                  <th className="px-6 py-3.5">N° Lista</th>
                  <th className="px-6 py-3.5">Fecha Matrícula</th>
                  <th className="px-6 py-3.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {matriculas.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900">
                      {m.estudiante_run || m.estudiante_nombre || m.estudiante_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-bold text-lbla-blue text-xs">
                      {m.curso?.codigo || 'Curso'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-semibold">
                      {m.periodo}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {m.numero_lista ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {m.fecha_matricula}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AlertBadge status={m.estado} />
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
