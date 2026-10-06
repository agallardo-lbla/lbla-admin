import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header con identidad institucional */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#334e9b]/10 border border-[#334e9b]/20 flex items-center justify-center mx-auto mb-4">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="LBLA Admin Controles">
              <line x1="14" y1="8" x2="14" y2="40" stroke="#334e9b" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="14" cy="18" r="5" fill="#334e9b" />
              <line x1="24" y1="8" x2="24" y2="40" stroke="#334e9b" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="24" cy="30" r="5" fill="#334e9b" />
              <line x1="34" y1="8" x2="34" y2="40" stroke="#334e9b" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="34" cy="22" r="5" fill="#334e9b" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#10204d] tracking-tight">LBLA Admin</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Liceo Bicentenario Latinoamericano
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#334e9b]/10 rounded-full text-[11px] font-semibold text-[#334e9b]">
            <Lock className="w-3 h-3" />
            Consola Administrativa Central
          </div>
        </div>

        {/* Cuerpo de Inicio de Sesión */}
        <div className="p-8 pt-4">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800 mb-1">Acceso Institucional de Funcionarios:</p>
              Inicia sesión con tu cuenta corporativa de Google para ingresar a la consola administrativa de LBLA.
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-sm hover:shadow transition flex items-center justify-center gap-3 text-sm disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Conectando con Google...' : 'Continuar con tu cuenta institucional de Google'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pie institucional */}
      <footer className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
        <div>&copy; 2026 Liceo Bicentenario Latinoamericano &middot; Todos los derechos reservados.</div>
        <div className="mt-1 text-slate-400">Desarrollado por el Departamento de Inform&aacute;tica LBLA</div>
      </footer>
    </div>
  );
};
