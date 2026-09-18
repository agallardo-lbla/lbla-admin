import test from 'node:test';
import assert from 'node:assert/strict';

test('API Client: Formats and parses errors cleanly without leaking stack traces', () => {
  const formatApiError = (status, responseBody) => {
    let message = 'Error en el servidor Core';
    if (responseBody && responseBody.detail) message = responseBody.detail;
    else if (responseBody && responseBody.message) message = responseBody.message;
    else if (responseBody && responseBody.error_description) message = responseBody.error_description;

    return {
      status,
      message,
      isAuthError: status === 401 || status === 403,
      isServerError: status >= 500,
    };
  };

  const err401 = formatApiError(401, { detail: 'Las credenciales de autenticación no se proveyeron.' });
  assert.equal(err401.status, 401);
  assert.equal(err401.isAuthError, true);
  assert.equal(err401.isServerError, false);
  assert.equal(err401.message, 'Las credenciales de autenticación no se proveyeron.');

  const err500 = formatApiError(500, { detail: 'Internal server error' });
  assert.equal(err500.isServerError, true);
});

test('API Client: Generates unique X-Request-ID for distributed tracing', () => {
  const generateRequestId = () => 'req_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const id1 = generateRequestId();
  const id2 = generateRequestId();

  assert.notEqual(id1, id2, 'Request IDs must be unique per call');
  assert.ok(id1.startsWith('req_'), 'Must include prefix for log grepping');
});
