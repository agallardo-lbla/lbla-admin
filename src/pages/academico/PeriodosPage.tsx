import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { fetchPeriodos, PeriodoLectivo } from '../../api/academic';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

export const PeriodosPage: React.FC = () => {
  const [periodos, setPeriodos] = useState<PeriodoLectivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPeriodos();
      setPeriodos(data);
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
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Períodos Lectivos Institucionales</h1>
        <p className="text-sm text-gray-500 mt-1">
          Años escolares definidos en Core con soporte multi-anual e histórico.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Consultando períodos lectivos en Core..." />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {periodos.map((p) => (
            <div
              key={p.anio}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-gray-900">{p.anio}</span>
                  {p.activo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Año Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      <Clock className="w-3.5 h-3.5" /> Histórico
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span>Inicio de Clases:</span>
                    <span className="font-semibold text-gray-800">{p.fecha_inicio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Término de Año:</span>
                    <span className="font-semibold text-gray-800">{p.fecha_termino}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
