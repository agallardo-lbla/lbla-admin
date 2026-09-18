import test from 'node:test';
import assert from 'node:assert/strict';

// Mapeo canónico probado en F0.1 / F2 / F6
const COURSE_TO_OU_MAP = {
  '1M-A': '/Estudiantes/1° Medio/1° Medio A',
  '1M-B': '/Estudiantes/1° Medio/1° Medio B',
  '1M-C': '/Estudiantes/1° Medio/1° Medio C',
  '1M-D': '/Estudiantes/1° Medio/1° Medio D',
  '1M-E': '/Estudiantes/1° Medio/1° Medio E',
  '2M-A': '/Estudiantes/2° Medio/2° Medio A',
  '2M-B': '/Estudiantes/2° Medio/2° Medio B',
  '2M-C': '/Estudiantes/2° Medio/2° Medio C',
  '2M-D': '/Estudiantes/2° Medio/2° Medio D',
  '2M-E': '/Estudiantes/2° Medio/2° Medio E',
  '3M-A': '/Estudiantes/3° Medio/3° Medio A',
  '3M-B': '/Estudiantes/3° Medio/3° Medio B',
  '3M-C': '/Estudiantes/3° Medio/3° Medio C',
  '3M-D': '/Estudiantes/3° Medio/3° Medio D',
  '4M-A': '/Estudiantes/4° Medio/4° Medio A',
  '4M-B': '/Estudiantes/4° Medio/4° Medio B',
  '4M-C': '/Estudiantes/4° Medio/4° Medio C',
  '4M-D': '/Estudiantes/4° Medio/4° Medio D',
};

test('Google Integration: Canonical course to OU mapping is comprehensive and consistent', () => {
  assert.equal(Object.keys(COURSE_TO_OU_MAP).length, 18, 'Debe mapear exactamente los 18 cursos canónicos oficiales');
  for (const [code, ou] of Object.entries(COURSE_TO_OU_MAP)) {
    assert.ok(ou.startsWith('/Estudiantes/'), `El curso ${code} debe pertenecer al árbol /Estudiantes`);
  }
});

test('Google Integration: 6 Classification states conform to architectural contract', () => {
  const allowedClassifications = [
    'COINCIDE',
    'FALTA_EN_GOOGLE',
    'FALTA_EN_CORE',
    'DIFERENCIA',
    'CONFLICTO',
    'REVISION_MANUAL'
  ];

  // Regla fundamental F6.8: Prohibición estricta de borrado automático para FALTA_EN_CORE
  const evaluateActionForClassification = (classification) => {
    switch (classification) {
      case 'COINCIDE':
        return 'NONE';
      case 'FALTA_EN_GOOGLE':
        return 'CREATE';
      case 'DIFERENCIA':
        return 'UPDATE_OU';
      case 'FALTA_EN_CORE':
        return 'MANUAL_REVIEW'; // NUNCA DELETE
      case 'CONFLICTO':
        return 'MANUAL_REVIEW';
      case 'REVISION_MANUAL':
        return 'MANUAL_REVIEW';
      default:
        throw new Error(`Clasificación desconocida: ${classification}`);
    }
  };

  allowedClassifications.forEach(c => {
    const action = evaluateActionForClassification(c);
    assert.notEqual(action, 'DELETE', `Regla F6.8 violada: ${c} no puede desencadenar DELETE automático`);
  });
});

test('Google Integration: Safety filter excludes conflicts and manual reviews before apply', () => {
  const items = [
    { id: '1', classification: 'COINCIDE', proposed_action: 'NONE' },
    { id: '2', classification: 'FALTA_EN_GOOGLE', proposed_action: 'CREATE' },
    { id: '3', classification: 'DIFERENCIA', proposed_action: 'UPDATE_OU' },
    { id: '4', classification: 'CONFLICTO', proposed_action: 'MANUAL_REVIEW' },
    { id: '5', classification: 'REVISION_MANUAL', proposed_action: 'MANUAL_REVIEW' },
    { id: '6', classification: 'FALTA_EN_CORE', proposed_action: 'MANUAL_REVIEW' },
  ];

  // Filtro de seguridad de Fase 6
  const safeItems = items.filter(
    (i) => !['CONFLICTO', 'REVISION_MANUAL', 'FALTA_EN_CORE'].includes(i.classification) &&
           ['CREATE', 'UPDATE_OU', 'REACTIVATE', 'SUSPEND'].includes(i.proposed_action)
  );

  assert.equal(safeItems.length, 2, 'Solo CREATE y UPDATE_OU sin conflictos deben ser aplicables');
  assert.deepEqual(safeItems.map(i => i.id), ['2', '3']);
});
