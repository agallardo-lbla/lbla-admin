import test from 'node:test';
import assert from 'node:assert/strict';

function evaluateRBAC(roles = []) {
  const isAdmin = roles.includes('SUPERADMIN') || roles.includes('DIRECTIVO') || roles.includes('ADMINISTRADOR_SISTEMA');
  const isDocente = roles.includes('DOCENTE');
  const isAsistente = roles.includes('ASISTENTE') || roles.includes('INSPECTORIA');

  return {
    isAdmin,
    isDocente,
    isAsistente,
    canCreatePersona: isAdmin,
    canEditPersona: isAdmin,
    canManageAcademic: isAdmin,
    canManageSige: isAdmin,
    canManageIdentity: isAdmin,
    canViewAudit: isAdmin,
    canViewFicha: isAdmin || isDocente || isAsistente,
  };
}

test('RBAC: DIRECTIVO and SUPERADMIN possess full administrative permissions', () => {
  const permsDirectivo = evaluateRBAC(['DIRECTIVO']);
  assert.equal(permsDirectivo.isAdmin, true);
  assert.equal(permsDirectivo.canManageSige, true);
  assert.equal(permsDirectivo.canManageIdentity, true);
  assert.equal(permsDirectivo.canViewAudit, true);

  const permsSuperAdmin = evaluateRBAC(['SUPERADMIN']);
  assert.equal(permsSuperAdmin.isAdmin, true);
  assert.equal(permsSuperAdmin.canManageSige, true);
});

test('RBAC: DOCENTE cannot perform high-risk administrative operations', () => {
  const permsDocente = evaluateRBAC(['DOCENTE']);
  assert.equal(permsDocente.isAdmin, false);
  assert.equal(permsDocente.isDocente, true);
  assert.equal(permsDocente.canManageSige, false);
  assert.equal(permsDocente.canManageIdentity, false);
  assert.equal(permsDocente.canViewAudit, false);
  assert.equal(permsDocente.canViewFicha, true);
});

test('RBAC: Anonymous or empty roles denied on all protected actions', () => {
  const permsEmpty = evaluateRBAC([]);
  assert.equal(permsEmpty.isAdmin, false);
  assert.equal(permsEmpty.canManageSige, false);
  assert.equal(permsEmpty.canViewFicha, false);
});
