import React, { useEffect, useState } from 'react';
import { ArrowLeft, UserCheck, Phone, GraduationCap, Users, Shield } from 'lucide-react';
import { fetchApoderadoDetail, fetchApoderadoPupilos, Apoderado } from '../../api/personas';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

interface ApoderadoDetailProps {
  apoderadoId: string;
  onBack: () => void;
  onSelectEstudiante?: (id: string) => void;
}

export const ApoderadoDetailPage: React.FC<ApoderadoDetailProps> = ({
  apoderadoId,
  onBack,
  onSelectEstudiante,
}) => {
  const [apoderado, setApoderado] = useState<Apoderado | null>(null);
  const [pupilos, setPupilos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [apodData, pupilosData] = await Promise.all([
          fetchApoderadoDetail(apoderadoId),
          fetchApoderadoPupilos(apoderadoId),
        ]);
        setApoderado(apodData);
        setPupilos(pupilosData);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [apoderadoId]);

  if (loading && !apoderado) {
    return <LoadingSpinner message="Cargando ficha del apoderado..." />;
  }

  if (error && !apoderado) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  if (!apoderado) return null;

  const p = apoderado.persona;
  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al padrón de apoderados</span>
      </button>

      {/* Header Ficha */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center font-bold text-xl border border-amber-100">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {p.nombres} {p.apellidos}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                RUN: {runCompleto}
              </span>
              <span className="text-xs text-gray-500">Parentesco: {apoderado.parentesco}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span>{apoderado.telefono_emergencia || p.telefono || 'Sin teléfono registrado'}</span>
        </div>
      </div>

      {/* Pupilos y Estudiantes Vinculados */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-lbla-blue" />
          <span>Pupilos / Estudiantes a Cargo</span>
        </h2>

        {pupilos.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pupilos.map((item) => {
              const est = item.estudiante || item;
              const estPersona = est.persona || est;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectEstudiante && onSelectEstudiante(est.id)}
                  className="py-3.5 flex items-center justify-between hover:bg-gray-50/60 p-2 rounded-xl transition cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {estPersona.nombres} {estPersona.apellidos}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>RUN: {estPersona.run}-{estPersona.dv}</span>
                      <span>&bull; Vínculo: {item.relacion || 'Apoderado'}</span>
                      {item.es_titular && (
                        <span className="text-amber-700 font-semibold">&bull; Titular Oficial</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-lbla-blue font-semibold">Ver Ficha &rarr;</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-6 text-center">
            No hay pupilos asociados directamente a este apoderado.
          </p>
        )}
      </div>
    </div>
  );
};
