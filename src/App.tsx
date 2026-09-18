import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/Login';
import { OAuthCallbackPage } from './pages/OAuthCallback';
import { DashboardPage } from './pages/Dashboard';
import { PersonasListPage } from './pages/personas/PersonasList';
import { PersonaDetailPage } from './pages/personas/PersonaDetail';
import { EstudiantesListPage } from './pages/estudiantes/EstudiantesList';
import { EstudianteDetailPage } from './pages/estudiantes/EstudianteDetail';
import { FuncionariosListPage } from './pages/funcionarios/FuncionariosList';
import { FuncionarioDetailPage } from './pages/funcionarios/FuncionarioDetail';
import { ApoderadosListPage } from './pages/apoderados/ApoderadosList';
import { ApoderadoDetailPage } from './pages/apoderados/ApoderadoDetail';
import { PeriodosPage } from './pages/academico/PeriodosPage';
import { CursosPage } from './pages/academico/CursosPage';
import { MatriculasPage } from './pages/academico/MatriculasPage';
import { SigeImportPage } from './pages/sige/SigeImportPage';
import { SigeBatchesPage } from './pages/sige/SigeBatchesPage';
import { IdentidadUsersPage } from './pages/identidad/IdentidadUsersPage';
import { AuditoriaPage } from './pages/auditoria/AuditoriaPage';
import GoogleOverview from './pages/google/GoogleOverview';
import GoogleUsersList from './pages/google/GoogleUsersList';
import GoogleComparisonPage from './pages/google/GoogleComparisonPage';
import GoogleBatchesPage from './pages/google/GoogleBatchesPage';
import { NotFoundPage } from './pages/NotFound';

const MainRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/dashboard');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedEstudianteId, setSelectedEstudianteId] = useState<string | null>(null);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState<string | null>(null);
  const [selectedApoderadoId, setSelectedApoderadoId] = useState<string | null>(null);

  // Sync state with browser navigation
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Reset detail states when navigating to main modules
    if (!path.startsWith('/personas/')) setSelectedPersonaId(null);
    if (!path.startsWith('/estudiantes/')) setSelectedEstudianteId(null);
    if (!path.startsWith('/funcionarios/')) setSelectedFuncionarioId(null);
    if (!path.startsWith('/apoderados/')) setSelectedApoderadoId(null);
  };

  // 1. Rutas públicas de Autenticación
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/oauth/callback') {
    return <OAuthCallbackPage onSuccess={() => navigate('/dashboard')} />;
  }

  // 2. Rutas Protegidas en Layout
  return (
    <ProtectedRoute>
      <Layout currentPath={currentPath} onNavigate={navigate}>
        {/* Dashboard */}
        {(currentPath === '/' || currentPath === '/dashboard') && (
          <DashboardPage onNavigate={navigate} />
        )}

        {/* Personas */}
        {currentPath === '/personas' && !selectedPersonaId && (
          <PersonasListPage
            onSelectPersona={(id) => setSelectedPersonaId(id)}
            onCreatePersona={() => alert('Creación de personas disponible según perfil asignado.')}
          />
        )}
        {currentPath === '/personas' && selectedPersonaId && (
          <PersonaDetailPage
            personaId={selectedPersonaId}
            onBack={() => setSelectedPersonaId(null)}
          />
        )}

        {/* Estudiantes */}
        {currentPath === '/estudiantes' && !selectedEstudianteId && (
          <EstudiantesListPage
            onSelectEstudiante={(id) => setSelectedEstudianteId(id)}
          />
        )}
        {currentPath === '/estudiantes' && selectedEstudianteId && (
          <EstudianteDetailPage
            estudianteId={selectedEstudianteId}
            onBack={() => setSelectedEstudianteId(null)}
          />
        )}

        {/* Funcionarios */}
        {currentPath === '/funcionarios' && !selectedFuncionarioId && (
          <FuncionariosListPage
            onSelectFuncionario={(id) => setSelectedFuncionarioId(id)}
          />
        )}
        {currentPath === '/funcionarios' && selectedFuncionarioId && (
          <FuncionarioDetailPage
            funcionarioId={selectedFuncionarioId}
            onBack={() => setSelectedFuncionarioId(null)}
          />
        )}

        {/* Apoderados */}
        {currentPath === '/apoderados' && !selectedApoderadoId && (
          <ApoderadosListPage
            onSelectApoderado={(id) => setSelectedApoderadoId(id)}
          />
        )}
        {currentPath === '/apoderados' && selectedApoderadoId && (
          <ApoderadoDetailPage
            apoderadoId={selectedApoderadoId}
            onBack={() => setSelectedApoderadoId(null)}
            onSelectEstudiante={(estId) => {
              setSelectedApoderadoId(null);
              setSelectedEstudianteId(estId);
              navigate('/estudiantes');
            }}
          />
        )}

        {/* Académico */}
        {currentPath === '/academico/periodos' && <PeriodosPage />}
        {currentPath === '/academico/cursos' && <CursosPage />}
        {currentPath === '/academico/matriculas' && <MatriculasPage />}

        {/* SIGE */}
        {currentPath === '/sige' && (
          <ProtectedRoute adminOnly>
            <SigeImportPage onBatchApplied={() => navigate('/sige/historial')} />
          </ProtectedRoute>
        )}
        {currentPath === '/sige/historial' && (
          <ProtectedRoute adminOnly>
            <SigeBatchesPage />
          </ProtectedRoute>
        )}

        {/* Identidad LBLA ID */}
        {currentPath === '/identidad' && (
          <ProtectedRoute adminOnly>
            <IdentidadUsersPage />
          </ProtectedRoute>
        )}

        {/* Auditoría */}
        {currentPath === '/seguridad/auditoria' && (
          <ProtectedRoute adminOnly>
            <AuditoriaPage />
          </ProtectedRoute>
        )}

        {/* Google Workspace */}
        {currentPath === '/google-workspace' && (
          <ProtectedRoute adminOnly>
            <GoogleOverview />
          </ProtectedRoute>
        )}
        {currentPath === '/google-workspace/usuarios' && (
          <ProtectedRoute adminOnly>
            <GoogleUsersList />
          </ProtectedRoute>
        )}
        {currentPath === '/google-workspace/comparacion' && (
          <ProtectedRoute adminOnly>
            <GoogleComparisonPage />
          </ProtectedRoute>
        )}
        {currentPath === '/google-workspace/sincronizaciones' && (
          <ProtectedRoute adminOnly>
            <GoogleBatchesPage />
          </ProtectedRoute>
        )}

        {/* Fallback 404 */}
        {![
          '/',
          '/dashboard',
          '/personas',
          '/estudiantes',
          '/funcionarios',
          '/apoderados',
          '/academico/periodos',
          '/academico/cursos',
          '/academico/matriculas',
          '/sige',
          '/sige/historial',
          '/google-workspace',
          '/google-workspace/usuarios',
          '/google-workspace/comparacion',
          '/google-workspace/sincronizaciones',
          '/identidad',
          '/seguridad/auditoria',
        ].includes(currentPath) && (
          <NotFoundPage onGoHome={() => navigate('/dashboard')} />
        )}
      </Layout>
    </ProtectedRoute>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
};
