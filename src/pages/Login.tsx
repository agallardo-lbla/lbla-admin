import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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
    <div className="flex min-h-screen w-full bg-[#f5f7fa] font-sans antialiased overflow-x-hidden">
      {/* MITAD IZQUIERDA: Identidad, Botón y Pie de Página */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#f5f7fa] flex flex-col justify-between p-7 sm:p-10 lg:px-20 lg:py-14 z-10 relative box-border">
        {/* Encabezado Institucional: Insignia Oficial LBLA */}
        <header className="w-full">
          <div className="inline-flex items-center gap-4 text-decoration-none">
            <img
              src="/img/logo_lbla.png"
              alt="Insignia LBLA"
              className="h-14 w-auto object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.06)]"
            />
            <div className="w-[1.5px] h-[38px] bg-[#cbd5e1]" />
            <span className="text-[1.7rem] font-extrabold text-[#0b183e] tracking-tight leading-none">
              LBLA
            </span>
            <div className="flex flex-col text-[0.76rem] font-bold text-[#64748b] tracking-wider leading-tight uppercase ml-0.5">
              <span>LICEO BICENTENARIO</span>
              <span>LATINOAMERICANO</span>
            </div>
          </div>
        </header>

        {/* Bloque Central: Identidad Admin LBLA y Acción */}
        <main className="w-full max-w-[530px] my-auto py-6">
          {/* Logo y Nombres de la Aplicación */}
          <div className="flex items-center gap-5 sm:gap-6 mb-5">
            <div className="w-[84px] h-[84px] sm:w-[104px] sm:h-[104px] rounded-[22px] sm:rounded-[28px] shrink-0 flex items-center justify-center bg-[#334e9b] shadow-[0_10px_26px_rgba(51,78,155,0.28)] hover:scale-[1.03] transition-transform duration-200 overflow-hidden">
              <img
                src="/img/logo_admin.png"
                alt="Logo Admin LBLA"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0b183e] tracking-tight leading-none m-0">
                Admin LBLA
              </h1>
              <div className="text-xl sm:text-2xl font-semibold text-[#64748b] tracking-tight mt-1">
                Administración institucional
              </div>
            </div>
          </div>

          {/* Descripción Oficial */}
          <p className="text-base sm:text-[1.12rem] text-[#475569] leading-relaxed mb-7 font-normal max-w-[480px]">
            Gestión de usuarios, roles, permisos y configuración de los sistemas del establecimiento.
          </p>

          {/* Mensajes de Alerta */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2.5 max-w-[515px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Acción Principal: Google SSO Institucional */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full max-w-[515px] bg-[#334e9b] hover:bg-[#273d7a] text-white py-[7px] pr-[22px] pl-[8px] rounded-full flex items-center justify-between shadow-[0_5px_18px_rgba(51,78,155,0.3)] hover:shadow-[0_8px_24px_rgba(51,78,155,0.38)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 border border-transparent cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
                  <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="text-white font-semibold text-sm sm:text-[1.05rem] tracking-tight">
                  {loading
                    ? 'Conectando con Google...'
                    : 'Continuar con tu cuenta institucional de Google'}
                </span>
              </div>
              <div className="flex items-center justify-center text-white opacity-90">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <div className="mt-4 text-sm text-[#64748b]">
              Consola administrativa exclusiva para personal institucional autorizado.
            </div>
          </div>
        </main>

        {/* Pie de Página Institucional */}
        <footer className="text-sm leading-relaxed">
          <div className="text-[#475569] font-medium">
            &copy; 2026 Liceo Bicentenario Latinoamericano &middot; Todos los derechos reservados.
          </div>
          <div className="text-[#64748b] mt-0.5">
            Desarrollado por el Departamento de Inform&aacute;tica LBLA
          </div>
        </footer>
      </div>

      {/* MITAD DERECHA: Imagen de Portada Teñida con Color de Acento */}
      <div
        className="hidden lg:block lg:w-1/2 min-h-screen bg-[#334e9b] bg-cover bg-center relative"
        style={{ backgroundImage: "url('/img/cover_admin.png')" }}
        aria-hidden="true"
      />
    </div>
  );
};
