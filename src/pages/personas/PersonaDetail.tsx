import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Hash, Shield, Tag, Save } from 'lucide-react';
import { fetchPersonaDetail, updatePersona, Persona } from '../../api/personas';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { useRBAC } from '../../hooks/useRBAC';

interface PersonaDetailProps {
  personaId: string;
  onBack: () => void;
}

export const PersonaDetailPage: React.FC<PersonaDetailProps> = ({ personaId, onBack }) => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields for editing contact
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const { canEditPersona } = useRBAC();

  const loadPersona = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPersonaDetail(personaId);
      setPersona(data);
      setEmail(data.email_institucional || '');
      setTelefono(data.telefono || '');
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersona();
  }, [personaId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPersona) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      const updated = await updatePersona(personaId, {
        email_institucional: email.trim() || null,
        telefono: telefono.trim() || null,
      });
      setPersona(updated);
      setSuccessMsg('Datos de contacto actualizados exitosamente en Core.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !persona) {
    return <LoadingSpinner message="Cargando ficha canónica de Persona..." />;
  }

  if (error && !persona) {
    return <ErrorDisplay error={error} onRetry={loadPersona} />;
  }

  if (!persona) return null;

  const runCompleto = persona.run_formateado || `${persona.run}-${persona.dv}`;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al padrón de personas</span>
      </button>

      {/* Header Ficha */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-lbla-blue/10 text-lbla-blue rounded-2xl flex items-center justify-center font-bold text-xl">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {persona.nombres} {persona.apellidos}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                RUN: {runCompleto}
              </span>
              <span className="text-xs text-gray-400 font-mono">ID: {persona.id.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {persona.perfil_estudiante && (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Perfil Estudiante
            </span>
          )}
          {persona.perfil_funcionario && (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Perfil Funcionario
            </span>
          )}
          {persona.perfil_apoderado && (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Perfil Apoderado
            </span>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
          {successMsg}
        </div>
      )}

      {/* Secciones de Detalle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos de Contacto y Edición */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-lbla-blue" />
            <span>Información de Contacto</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                value={email}
                disabled={!canEditPersona || saving}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@liceolbla.cl"
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={telefono}
                disabled={!canEditPersona || saving}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              />
            </div>

            {canEditPersona && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-lbla-blue hover:bg-lbla-dark text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Identificadores Satélites (Desacoplados) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-lbla-blue" />
            <span>Identificadores Externos Satélite</span>
          </h2>

          {persona.identificadores_externos && persona.identificadores_externos.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {persona.identificadores_externos.map((idExt) => (
                <div key={idExt.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-800">{idExt.sistema}</span>
                    <span className="block font-mono text-gray-500 text-[11px]">{idExt.clave_externa}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-600">
                    VINCULADO
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-6 text-center">
              No hay identificadores externos registrados para esta persona.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
