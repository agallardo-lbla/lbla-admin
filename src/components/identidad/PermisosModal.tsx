import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  Check,
  Building,
  BookOpen,
  Clock,
  ShoppingBag,
  Sliders,
  Sparkles,
  Info,
  Laptop
} from 'lucide-react';
import {
  IdentityUser,
  ApplicationCatalogItem,
  fetchApplicationCatalog,
  updateUserPermissions
} from '../../api/identity';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PermisosModalProps {
  isOpen: boolean;
  user: IdentityUser | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const PermisosModal: React.FC<PermisosModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const [catalog, setCatalog] = useState<ApplicationCatalogItem[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, string[]>>({});
  const [loadingCatalog, setLoadingCatalog] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = Boolean(
    user && currentUser &&
    (user.email.toLowerCase() === currentUser.email.toLowerCase() ||
     user.id === currentUser.sub)
  );

  useEffect(() => {
    if (isOpen && user) {
      setError(null);
      loadCatalog();
      // Inicializar permisos seleccionados con los del usuario
      setSelectedPermissions(user.app_permissions || {});
    }
  }, [isOpen, user]);

  const loadCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const data = await fetchApplicationCatalog();
      setCatalog(data);
    } catch (err: any) {
      setError(err.message || 'No fue posible cargar el catálogo de aplicaciones.');
    } finally {
      setLoadingCatalog(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleRoleChange = (clientId: string, roleId: string) => {
    // Si es su propia cuenta y es admin-client SUPERADMIN, no permitir deseleccionar
    if (isSelf && clientId === 'lbla-admin-client' && roleId !== 'SUPERADMIN') {
      return;
    }

    setSelectedPermissions(prev => {
      const current = prev[clientId] || [];
      // Si seleccionó 'NONE', vaciar permisos para esa app
      if (roleId === 'NONE') {
        const updated = { ...prev };
        delete updated[clientId];
        return updated;
      }

      // En este diseño, cada app tiene un rol primario asignado
      return {
        ...prev,
        [clientId]: [roleId],
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await updateUserPermissions(user.id, {
        app_permissions: selectedPermissions,
      });

      onSuccess(`Permisos actualizados exitosamente para ${user.username} (${user.email}).`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar los permisos en LBLA Core.');
    } finally {
      setSaving(false);
    }
  };

  const getAppIcon = (clientId: string) => {
    switch (clientId) {
      case 'lbla-admin-client':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'lbla-recepcion-client':
        return <Building className="w-5 h-5 text-emerald-600" />;
      case 'lbla-cra-client':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'lbla-reloj-client':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'lbla-mipyme-client':
        return <ShoppingBag className="w-5 h-5 text-purple-600" />;
      case 'lbla-labs-client':
        return <Laptop className="w-5 h-5 text-cyan-600" />;
      default:
        return <Sliders className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Gestión Centralizada de Permisos</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Asignación de accesos y roles por aplicación en el Ecosistema LBLA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta de Identidad Seleccionada */}
        <div className="px-6 py-3 bg-slate-50 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Usuario:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900 font-bold">
              {user.username}
            </span>
            <span className="text-gray-400">|</span>
            <span className="font-mono text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {user.federated_provider || 'Google Workspace'}
            </span>
          </div>
        </div>

        {/* Alerta de Auto-Edición Preventiva */}
        {isSelf && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Modo de Protección Anti-Auto-Bloqueo:</span> Estás editando tu propia cuenta
              de Administrador. El rol <span className="font-mono font-bold">SUPERADMIN</span> en Admin LBLA se mantendrá
              activo para garantizar que nunca quedes sin acceso al panel central.
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Contenido / Matriz de Aplicaciones */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loadingCatalog ? (
            <LoadingSpinner message="Consultando aplicaciones registradas en LBLA ID..." />
          ) : catalog.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay aplicaciones registradas en el catálogo.
            </div>
          ) : (
            catalog.map(app => {
              const assignedRoles = selectedPermissions[app.client_id] || [];
              const currentRole = assignedRoles[0] || 'NONE';

              return (
                <div
                  key={app.client_id}
                  className="p-4 rounded-xl border border-gray-200/90 bg-white hover:border-blue-200 transition shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                        {getAppIcon(app.client_id)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{app.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{app.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">
                      {app.client_id}
                    </span>
                  </div>

                  {/* Selector de Rol para la Aplicación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                    {/* Opción Sin Acceso */}
                    <button
                      type="button"
                      disabled={isSelf && app.client_id === 'lbla-admin-client'}
                      onClick={() => handleRoleChange(app.client_id, 'NONE')}
                      className={`p-2.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
                        currentRole === 'NONE'
                          ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold shadow-2xs'
                          : 'bg-gray-50/60 border-gray-200 text-gray-500 hover:bg-gray-100/80'
                      } ${isSelf && app.client_id === 'lbla-admin-client' ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">Sin Acceso</span>
                        {currentRole === 'NONE' && <Check className="w-3.5 h-3.5 text-slate-700" />}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        El usuario no puede operar esta aplicación.
                      </span>
                    </button>

                    {/* Opciones de Roles Disponibles */}
                    {app.available_roles.map(role => {
                      const isSelected = currentRole === role.id;
                      const isProtectedAdmin = isSelf && app.client_id === 'lbla-admin-client' && role.id === 'SUPERADMIN';

                      return (
                        <button
                          key={role.id}
                          type="button"
                          disabled={isSelf && app.client_id === 'lbla-admin-client' && role.id !== 'SUPERADMIN'}
                          onClick={() => handleRoleChange(app.client_id, role.id)}
                          className={`p-2.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-2xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          } ${isSelf && app.client_id === 'lbla-admin-client' && role.id !== 'SUPERADMIN' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium flex items-center gap-1">
                              {role.name}
                              {isProtectedAdmin && <Sparkles className="w-3 h-3 text-amber-500" />}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 leading-snug">
                            {role.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>Los cambios se aplicarán de inmediato en el próximo inicio de sesión del usuario.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl transition shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingCatalog}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Permisos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
