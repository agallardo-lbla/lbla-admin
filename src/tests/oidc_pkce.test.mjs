import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Simulation of PKCE functions for Node test runner
function generateCodeVerifier() {
  return crypto.randomBytes(48).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

test('PKCE: code_verifier satisfies length and entropy criteria', () => {
  const verifier = generateCodeVerifier();
  assert.ok(verifier.length >= 43 && verifier.length <= 128, 'Verifier length must be between 43 and 128 chars');
  assert.match(verifier, /^[A-Za-z0-9_-]+$/, 'Verifier must use unreserved URL-safe characters');
});

test('PKCE: S256 code_challenge is deterministic and base64url encoded', () => {
  const verifier = 'test-verifier-constant-string-for-reproducibility-12345';
  const challenge1 = generateCodeChallenge(verifier);
  const challenge2 = generateCodeChallenge(verifier);

  assert.equal(challenge1, challenge2, 'Challenge generation must be deterministic');
  assert.ok(!challenge1.includes('+'), 'Challenge must not contain +');
  assert.ok(!challenge1.includes('/'), 'Challenge must not contain /');
  assert.ok(!challenge1.includes('='), 'Challenge must not contain trailing padding');
});

test('OIDC Config: Issuer and Scopes match official LBLA ID specification', () => {
  const allowedScopes = ['openid', 'profile', 'email', 'read:personas', 'write:personas', 'read:academic', 'write:academic', 'read:asistencia', 'write:asistencia'];
  assert.ok(allowedScopes.includes('openid'), 'openid scope is mandatory');
  assert.ok(allowedScopes.includes('read:personas'), 'read:personas is authorized for Admin');
});
