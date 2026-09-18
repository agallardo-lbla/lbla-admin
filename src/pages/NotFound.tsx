import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC<{ onGoHome: () => void }> = ({ onGoHome }) => {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-blue-50 text-lbla-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
      <p className="text-sm text-gray-500 mb-6">
        La ruta solicitada no forma parte de la consola administrativa LBLA Admin.
      </p>
      <button
        onClick={onGoHome}
        className="px-4 py-2 bg-lbla-blue text-white rounded-xl text-xs font-semibold shadow hover:bg-lbla-dark transition"
      >
        Ir al Dashboard
      </button>
    </div>
  );
};
