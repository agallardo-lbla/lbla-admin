import React, { useEffect, useState } from 'react';
import { BookOpen, ShieldCheck, Lock, Users } from 'lucide-react';
import { fetchCursos, Curso, CANONICAL_COURSES } from '../../api/academic';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

interface CursosPageProps {
  onSelectCurso?: (cursoId: string) => void;
}

export const CursosPage: React.FC<CursosPageProps> = ({ onSelectCurso }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCursos();
      setCursos(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Estructura Curricular: 18 Cursos Canónicos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Catálogo institucional inmutable establecido por contrato arquitectónico F0.1 (Gate G-02).
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-lbla-blue rounded-xl text-xs font-semibold border border-blue-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Catálogo Cerrado e Inmutable</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Cargando catálogo oficial de 18 cursos..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_COURSES.map((c) => {
            const registered = cursos.find((item) => item.codigo === c.codigo);
            const modalityLabel =
              c.modalidad === 'HC'
                ? 'Científico-Humanista'
                : c.modalidad === 'TP_ADMIN'
                ? 'TP Administración'
                : 'TP Agropecuaria';

            return (
              <div
                key={c.codigo}
                onClick={() => registered && onSelectCurso && onSelectCurso(registered.id)}
                className={`bg-white p-5 rounded-2xl border transition flex flex-col justify-between ${
                  registered ? 'border-gray-200 shadow-xs hover:border-lbla-blue cursor-pointer' : 'border-dashed border-gray-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-gray-900">{c.codigo}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {c.nivel}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{c.nombre}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{modalityLabel}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{registered ? `${registered.estudiantes_count || 0} alumnos` : '0 alumnos'}</span>
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Canónico</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
