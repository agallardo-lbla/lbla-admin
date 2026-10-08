import test from 'node:test';
import assert from 'node:assert/strict';

const SUPERADMIN_EMAILS = [
  'agallardo@lbla.cl',
  'jnavarro@lbla.cl',
  'admin@lbla.cl',
];

function evaluateRBAC(roles = [], email = '') {
  const userEmail = (email || '').trim().toLowerCase();
  const isSuperAdmin = SUPERADMIN_EMAILS.includes(userEmail) || roles.includes('SUPERADMIN');
  const isDirectivo = roles.includes('DIRECTIVO');
  const isDocente = roles.includes('DOCENTE');
  const isAsistente = roles.includes('ASISTENTE') || roles.includes('INSPECTORIA');
  const isEstudiante = roles.includes('ESTUDIANTE') || userEmail.endsWith('@estudiante.liceolbla.cl');
  const isStaff = isSuperAdmin || isDirectivo || isDocente || isAsistente;

  return {
    isSuperAdmin,
    isAdmin: isSuperAdmin,
    isDirectivo,
    isDocente,
    isAsistente,
    isEstudiante,
    isStaff,
    canCreatePersona: isSuperAdmin,
    canEditPersona: isSuperAdmin,
    canDeletePersona: isSuperAdmin,
    canManageStaff: isSuperAdmin,
    canImportStaff: isSuperAdmin,
    canManageAcademic: isSuperAdmin,
    canManageSige: isSuperAdmin,
    canManageIdentity: isSuperAdmin,
    canViewAudit: isSuperAdmin,
    canViewFicha: isStaff,
    canViewPersonas: isStaff,
  };
}

test('RBAC: DIRECTIVO, DOCENTE and ASISTENTE have read-only access (mutations denied)', () => {
  const staffRoles = ['DIRECTIVO', 'DOCENTE', 'ASISTENTE'];
  for (const role of staffRoles) {
    const perms = evaluateRBAC([role], `${role.toLowerCase()}@lbla.cl`);
    assert.equal(perms.isAdmin, false, `${role} should not be admin`);
    assert.equal(perms.canCreatePersona, false, `${role} cannot create persona`);
    assert.equal(perms.canManageStaff, false, `${role} cannot manage staff`);
    assert.equal(perms.canManageSige, false, `${role} cannot manage sige`);
    assert.equal(perms.canManageIdentity, false, `${role} cannot manage identity`);
    assert.equal(perms.isStaff, true, `${role} is staff`);
    assert.equal(perms.canViewFicha, true, `${role} can view ficha`);
  }
});

test('RBAC: Whitelisted Superadmins and SUPERADMIN role have write privileges', () => {
  for (const email of SUPERADMIN_EMAILS) {
    const perms = evaluateRBAC([], email);
    assert.equal(perms.isSuperAdmin, true, `${email} should be superadmin`);
    assert.equal(perms.isAdmin, true, `${email} should be admin`);
    assert.equal(perms.canCreatePersona, true);
    assert.equal(perms.canManageStaff, true);
    assert.equal(perms.canManageSige, true);
    assert.equal(perms.canManageIdentity, true);
  }

  const permsRole = evaluateRBAC(['SUPERADMIN']);
  assert.equal(permsRole.isSuperAdmin, true);
  assert.equal(permsRole.canCreatePersona, true);
});

test('RBAC: ESTUDIANTE is marked as student and not staff', () => {
  const permsEstudiante = evaluateRBAC(['ESTUDIANTE'], 'alumna@estudiante.liceolbla.cl');
  assert.equal(permsEstudiante.isEstudiante, true);
  assert.equal(permsEstudiante.isStaff, false);
  assert.equal(permsEstudiante.isAdmin, false);
  assert.equal(permsEstudiante.canViewFicha, false);
});

test('RBAC: Anonymous or empty roles denied on all actions', () => {
  const permsEmpty = evaluateRBAC([], 'desconocido@lbla.cl');
  assert.equal(permsEmpty.isAdmin, false);
  assert.equal(permsEmpty.isStaff, false);
  assert.equal(permsEmpty.canManageSige, false);
  assert.equal(permsEmpty.canViewFicha, false);
});

