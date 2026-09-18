import React from 'react';
import { AlertCircle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import { ApiError } from '../../api/client';

interface ErrorDisplayProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null;

  let title = 'Ocurrió un error';
  let message = 'No fue posible completar la solicitud.';
  let icon = <AlertCircle className="w-6 h-6 text-red-600" />;

  if (typeof error === 'string') {
    message = error;
  } else if ('status' in error) {
    const apiErr = error as ApiError;
    if (apiErr.status === 401) {
      title = 'Sesión Expirada';
      message = 'Tu sesión en LBLA ID ha caducado. Por favor ingresa nuevamente.';
      icon = <ShieldAlert className="w-6 h-6 text-amber-600" />;
    } else if (apiErr.status === 403) {
      title = 'Acceso Restringido';
      message = 'No dispones de los permisos o roles institucionales requeridos para esta sección.';
      icon = <ShieldAlert className="w-6 h-6 text-orange-600" />;
    } else if (apiErr.status === 404) {
      title = 'Registro no Encontrado';
      message = 'El elemento solicitado no existe en la base canónica de Core.';
    } else if (apiErr.status === 0 || apiErr.status === 408) {
      title = 'Sin Conexión con LBLA Core';
      message = 'No es posible comunicar con el servidor Core. Verifica la conexión o el servicio Docker.';
      icon = <WifiOff className="w-6 h-6 text-slate-600" />;
    } else {
      message = apiErr.message || message;
    }
  } else {
    message = error.message;
  }

  return (
    <div className="bg-red-50/70 border border-red-200 rounded-xl p-6 text-left max-w-lg mx-auto my-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-white rounded-lg shadow-xs border border-red-100 shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
