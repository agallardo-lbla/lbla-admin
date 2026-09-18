import React, { useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, Mail, Phone, Clock, Key, ShieldCheck, Tag } from 'lucide-react';
import { fetchFuncionarioDetail, fetchPersonaIdentificadores, Funcionario, ExternalIdentifier } from '../../api/personas';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

interface FuncionarioDetailProps {
  funcionarioId: string;
  onBack: () => void;
}

export const FuncionarioDetailPage: React.FC<FuncionarioDetailProps> = ({ funcionarioId, onBack }) => {
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [identificadores, setIdentificadores] = useState<ExternalIdentifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchFuncionarioDetail(funcionarioId);
        setFuncionario(data);
        if (data.persona?.id) {
          const ids = await fetchPersonaIdentificadores(data.persona.id);
          setIdentificadores(ids);
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [funcionarioId]);

  if (loading && !funcionario) {
    return <LoadingSpinner message="Cargando ficha institucional del funcionario..." />;
  }

  if (error && !funcionario) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
  }

  if (!funcionario) return null;

  const p = funcionario.persona;
  const runCompleto = p.run_formateado || `${p.run}-${p.dv}`;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la dotación de funcionarios</span>
      </button>

      {/* Header Ficha */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl border border-indigo-100">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {p.nombres} {p.apellidos}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                RUN: {runCompleto}
              </span>
              <span className="text-xs font-semibold text-indigo-700">
                {funcionario.cargo}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            funcionario.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
          }`}>
            {funcionario.activo ? 'Dotación Activa' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Laborales y Contrato */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-lbla-blue" />
            <span>Condición Laboral</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Departamento / Área:</span>
              <span className="font-semibold text-gray-900">{funcionario.departamento || 'Sin asignar'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Horas de Contrato:</span>
              <span className="font-semibold text-gray-900">{funcionario.horas_contrato || 0} hrs cronológicas</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Clasificación:</span>
              <span className="font-semibold text-gray-900">
                {funcionario.es_docente ? 'Docente de Aula / Especialidad' : 'Asistente de la Educación'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Email Institucional:</span>
              <span className="font-mono text-gray-900">{p.email_institucional || 'N/D'}</span>
            </div>
          </div>
        </div>

        {/* Identificadores y Enlace LBLA ID */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-lbla-blue" />
            <span>Identificadores en Sistemas Satélite</span>
          </h2>

          {identificadores.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {identificadores.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900">{item.sistema}</span>
                    <span className="block font-mono text-gray-500 text-[11px]">{item.clave_externa}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700">
                    Sincronizado
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              No hay identificadores externos registrados para este funcionario.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
