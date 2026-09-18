import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await login();
    } catch (err: any) {
      setError(err.message || 'No fue posible iniciar el flujo de autenticación.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header con identidad institucional */}
        <div className="bg-lbla-blue px-8 py-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-lbla-gold" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">LBLA ADMIN</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            Liceo Bicentenario Latinoamericano de Pichidegua
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium text-blue-200">
            <Lock className="w-3 h-3" />
            Consola Administrativa Central
          </div>
        </div>

        {/* Cuerpo de Inicio de Sesión */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">Autenticación Unificada (SSO):</p>
              El acceso a esta consola está protegido por <strong>LBLA ID</strong> mediante el protocolo estándar OpenID Connect y claves criptográficas asimétricas RS256.
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-lbla-blue hover:bg-lbla-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{loading ? 'Redirigiendo a LBLA ID...' : 'Iniciar Sesión con LBLA ID'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Ambiente de Staging Seguro &bull; Liceo Bicentenario Latinoamericano &bull; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
