import React, { useEffect, useState } from 'react';
import { ArrowLeft, GraduationCap, Calendar, Users, BookOpen, Clock, Shield } from 'lucide-react';
import {
  fetchEstudianteDetail,
  fetchEstudianteHistorial,
  fetchEstudianteApoderados,
  Estudiante,
  StudentApoderadoLink,
} from '../../api/personas';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { AlertaEstudianteBadge, AlertBadge } from '../../components/common/AlertBadge';

interface EstudianteDetailProps {
  estudianteId: string;
  onBack: () => void;
}

export const EstudianteDetailPage: React.FC<EstudianteDetailProps> = ({ estudianteId, onBack }) => {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [apoderados, setApoderados] = useState<StudentApoderadoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const [estData, histData, apodData] = await Promise.all([
          fetchEstudianteDetail(estudianteId),
          fetchEstudianteHistorial(estudianteId),
          fetchEstudianteApoderados(estudianteId),
        ]);
        setEstudiante(estData);
        setHistorial(histData);
        setApoderados(apodData);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [estudianteId]);

  if (loading && !estudiante) {
    return <LoadingSpinner message="Cargando expediente escolar del estudiante..." />;
  }

  if (error && !estudiante) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  if (!estudiante) return null;

  const p = estudiante.persona;
  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la nómina de estudiantes</span>
      </button>

      {/* Header Ficha */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-xl border border-emerald-100">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {p.nombres} {p.apellidos}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                RUN: {runCompleto}
              </span>
              <span className="text-xs font-semibold text-lbla-blue">
                Curso: {estudiante.curso_actual_codigo || 'Sin curso asignado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertaEstudianteBadge tieneAlerta={estudiante.tiene_ficha_alerta} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial Académico y Matrículas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-lbla-blue" />
            <span>Trayectoria Escolar y Matrículas</span>
          </h2>

          {historial.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {historial.map((mat, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {mat.curso?.codigo || mat.curso_codigo || 'Curso'}
                    </span>
                    <span className="block text-gray-500 text-[11px]">
                      Período {mat.periodo_anio || mat.periodo} &bull; Matrícula: {mat.fecha_matricula || 'N/D'}
                    </span>
                  </div>
                  <AlertBadge status={mat.estado || 'MATRICULADO'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              No hay registros de trayectoria histórica disponibles.
            </p>
          )}
        </div>

        {/* Apoderados y Vínculos Familiares */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-lbla-blue" />
            <span>Apoderados y Autorizaciones</span>
          </h2>

          {apoderados.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {apoderados.map((link) => {
                const apodPersona = link.apoderado?.persona;
                return (
                  <div key={link.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {apodPersona ? `${apodPersona.nombres} ${apodPersona.apellidos}` : 'Apoderado'}
                      </span>
                      {link.es_titular && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Titular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                      <span>Relación: {link.relacion || 'No especificada'}</span>
                      {link.vive_con_estudiante && <span>&bull; Convive con alumno</span>}
                      {link.autorizado_retirar && <span className="text-emerald-700 font-medium">&bull; Autorizado a retirar</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              No hay apoderados vinculados a este estudiante.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
