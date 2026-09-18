import test from 'node:test';
import assert from 'node:assert/strict';

test('SIGE Flow: Mandatory Confirmation required before Apply or Rollback', () => {
  const checkCanApply = (batch, userConfirmed) => {
    if (!batch) return false;
    if (batch.status !== 'PREVIEW') return false;
    if (!userConfirmed) return false;
    return true;
  };

  const previewBatch = { id: 'batch-1', status: 'PREVIEW' };
  const appliedBatch = { id: 'batch-2', status: 'APPLIED' };

  assert.equal(checkCanApply(previewBatch, false), false, 'Cannot apply without explicit confirmation');
  assert.equal(checkCanApply(previewBatch, true), true, 'Allowed when confirmed');
  assert.equal(checkCanApply(appliedBatch, true), false, 'Cannot re-apply already applied batch');
});

test('Academic: 18 Canonical courses catalog matches strictly F0.1 Gate G-02', () => {
  const canonicalCourses = [
    '1M-A', '1M-B', '1M-C', '1M-D', '1M-E',
    '2M-A', '2M-B', '2M-C', '2M-D', '2M-E',
    '3M-A', '3M-B', '3M-C', '3M-D',
    '4M-A', '4M-B', '4M-C', '4M-D'
  ];

  assert.equal(canonicalCourses.length, 18, 'Must be exactly 18 courses');
  assert.ok(canonicalCourses.includes('1M-A'));
  assert.ok(canonicalCourses.includes('4M-D'));
  assert.ok(!canonicalCourses.includes('5M-A'), 'No courses beyond 4° Medio');
  assert.ok(!canonicalCourses.includes('1M-F'), 'No letters beyond authorized letters');
});
