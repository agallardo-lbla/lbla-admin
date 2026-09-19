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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await login('google');
    } catch (err: any) {
      setError(err.message || 'No fue posible iniciar el flujo con Google Workspace.');
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
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm hover:shadow transition flex items-center justify-center gap-3 text-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Conectando con Google...' : 'Continuar con Google Workspace'}</span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">o con LBLA ID directo</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-lbla-blue hover:bg-lbla-dark text-white font-medium rounded-xl shadow hover:shadow-md transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{loading ? 'Redirigiendo a LBLA ID...' : 'Iniciar Sesión con LBLA ID'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
