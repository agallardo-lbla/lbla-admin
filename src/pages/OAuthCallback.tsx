import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorDisplay } from '../components/common/ErrorDisplay';

interface OAuthCallbackProps {
  onSuccess: () => void;
}

export const OAuthCallbackPage: React.FC<OAuthCallbackProps> = ({ onSuccess }) => {
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const oauthError = urlParams.get('error');
      const errorDesc = urlParams.get('error_description');

      if (oauthError) {
        setError(errorDesc || oauthError || 'Error retornado por LBLA ID');
        return;
      }

      if (!code) {
        setError('No se recibió el código de autorización desde LBLA ID.');
        return;
      }

      try {
        await handleCallback(code, state || '');
        onSuccess();
      } catch (err: any) {
        setError(err.message || 'Falló el canje de tokens con LBLA ID.');
      }
    };

    processCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <ErrorDisplay
          error={error}
          onRetry={() => {
            window.location.href = '/login';
          }}
        />
      </div>
    );
  }

  return <LoadingSpinner fullPage message="Completando autenticación OIDC con LBLA ID..." />;
};
