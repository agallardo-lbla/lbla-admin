import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Cargando información...',
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-lbla-blue rounded-full animate-spin"></div>
      {message && <p className="mt-3 text-xs font-medium tracking-wide uppercase text-gray-400">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
};
