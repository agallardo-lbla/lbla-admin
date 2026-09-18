import React from 'react';

interface AlertBadgeProps {
  status: string;
  label?: string;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ status, label }) => {
  const text = label || status;

  let style = 'bg-gray-100 text-gray-700 border-gray-200';

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'APPLIED':
    case 'MATRICULADO':
    case 'SIN_CAMBIOS':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'NUEVO':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'ACTUALIZACION':
    case 'CAMBIO_CURSO':
    case 'CAMBIO_ESTADO':
    case 'CAMBIO_RELACION':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'CONFLICTO':
    case 'REVISION_MANUAL':
    case 'SUSPENDED':
    case 'LOCKED':
      style = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'ERROR':
    case 'FAILED':
    case 'ANULADO':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'ROLLED_BACK':
    case 'RETIRADO':
      style = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'PREVIEW':
      style = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {text}
    </span>
  );
};

export const AlertaEstudianteBadge: React.FC<{ tieneAlerta: boolean }> = ({ tieneAlerta }) => {
  if (!tieneAlerta) return null;
  return (
    <span
      title="Ficha con indicador de atención institucional"
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"
    >
      Atención Prioritaria
    </span>
  );
};
