import test from 'node:test';
import assert from 'node:assert/strict';

// Validación lógica de contratos de aprovisionamiento de funcionarios
function evaluateProvisioningStatus(identity, federatedLinks = []) {
  if (!identity) {
    return {
      status: 'UNPROVISIONED',
      display: 'Sin identidad aprovisionada',
      canPreProvision: true,
      canEdit: false,
    };
  }

  const hasSession = Boolean(identity.last_login_at || federatedLinks.length > 0);
  if (identity.status === 'PENDING_ACTIVATION' || !hasSession) {
    return {
      status: 'PREPARED',
      display: 'Identidad preparada',
      canPreProvision: false,
      canEdit: true,
    };
  }

  return {
    status: 'ACTIVE',
    display: 'Activa / Con inicio de sesión',
    canPreProvision: false,
    canEdit: true,
  };
}

function buildPreProvisionPayload(funcionario, selectedPermissions) {
  if (!funcionario.email || !funcionario.email.includes('@')) {
    throw new Error('Email institucional requerido');
  }
  return {
    email: funcionario.email.trim().toLowerCase(),
    funcionario_id: funcionario.funcionario_id || undefined,
    app_permissions: selectedPermissions || {},
  };
}

test('Pre-provisioning: Unprovisioned staff account detected correctly', () => {
  const result = evaluateProvisioningStatus(null, []);
  assert.equal(result.status, 'UNPROVISIONED');
  assert.equal(result.display, 'Sin identidad aprovisionada');
  assert.equal(result.canPreProvision, true);
});

test('Pre-provisioning: Prepared identity detected prior to first login', () => {
  const identity = {
    id: 'uuid-1234',
    email: 'profesor@liceolatinoamericano.cl',
    status: 'PENDING_ACTIVATION',
    last_login_at: null,
  };
  const result = evaluateProvisioningStatus(identity, []);
  assert.equal(result.status, 'PREPARED');
  assert.equal(result.display, 'Identidad preparada');
  assert.equal(result.canEdit, true);
});

test('Pre-provisioning: Active identity recognized after first login', () => {
  const identity = {
    id: 'uuid-1234',
    email: 'profesor@liceolatinoamericano.cl',
    status: 'ACTIVE',
    last_login_at: '2026-10-06T08:00:00Z',
  };
  const result = evaluateProvisioningStatus(identity, [{ provider: 'GOOGLE', subject: 'sub123' }]);
  assert.equal(result.status, 'ACTIVE');
  assert.equal(result.display, 'Activa / Con inicio de sesión');
});

test('Pre-provisioning: Payload construction normalizes email and formats app permissions', () => {
  const funcionario = {
    funcionario_id: 'func-abc-123',
    email: ' PROFESOR.Lenguaje@LiceoLatinoamericano.cl ',
  };
  const perms = {
    'lbla-cra-client': ['ENCARGADA_MESON'],
    'lbla-recepcion-client': ['RECEPCION'],
  };
  const payload = buildPreProvisionPayload(funcionario, perms);

  assert.equal(payload.email, 'profesor.lenguaje@liceolatinoamericano.cl');
  assert.equal(payload.funcionario_id, 'func-abc-123');
  assert.deepEqual(payload.app_permissions['lbla-cra-client'], ['ENCARGADA_MESON']);
  assert.deepEqual(payload.app_permissions['lbla-recepcion-client'], ['RECEPCION']);
});
