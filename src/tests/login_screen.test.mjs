import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loginPagePath = path.resolve(__dirname, '../pages/Login.tsx');

test('Login Screen: Presenta como única acción visible "Continuar con tu cuenta institucional de Google"', () => {
  const content = fs.readFileSync(loginPagePath, 'utf8');

  // Verifica el texto institucional exacto
  assert.ok(
    content.includes('Continuar con tu cuenta institucional de Google'),
    'Debe contener el texto obligatorio "Continuar con tu cuenta institucional de Google"'
  );

  // Verifica que handleGoogleLogin delega con 'google'
  assert.ok(
    content.includes("login('google')"),
    "Debe delegar el flujo de autenticación al proveedor institucional 'google'"
  );
});

test('Login Screen: Eliminación estricta de botones, enlaces y textos de LBLA ID directo o acceso alternativo', () => {
  const content = fs.readFileSync(loginPagePath, 'utf8');

  assert.ok(
    !content.includes('o con LBLA ID directo'),
    'No debe existir el separador ni texto "o con LBLA ID directo"'
  );

  assert.ok(
    !content.includes('Iniciar Sesión con LBLA ID'),
    'No debe existir el botón "Iniciar Sesión con LBLA ID"'
  );

  assert.ok(
    !content.includes('Redirigiendo a LBLA ID...'),
    'No debe existir texto de redirección directa a LBLA ID'
  );
});
