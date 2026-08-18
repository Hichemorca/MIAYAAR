/**
 * Regression test for the canonical Result<TData> contract in core/results.
 *
 * core/results is frozen and out of scope for modification. This test
 * exists only to guard against accidental future shape or enum drift.
 */

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { Result, ResultStatus, Warning, ErrorInfo } from '../../../core/results';

test('ResultStatus exposes exactly the four documented values', () => {
  assert.equal(ResultStatus.SUCCESS, 'success');
  assert.equal(ResultStatus.PARTIAL, 'partial');
  assert.equal(ResultStatus.ERROR, 'error');
  assert.equal(ResultStatus.PENDING, 'pending');
});

test('a minimal SUCCESS Result satisfies the Result<TData> contract', () => {
  const result: Result<{ ok: true }> = {
    status: ResultStatus.SUCCESS,
    data: { ok: true },
    warnings: [],
    errors: [],
    metadata: {
      requestId: 'req-001',
      engine: 'test-engine',
      version: '1.0.0',
      timestamp: '2026-01-01T00:00:00.000Z',
    },
  };

  assert.equal(result.status, ResultStatus.SUCCESS);
  assert.equal(result.data.ok, true);
});

test('a minimal ERROR Result carries at least one ErrorInfo entry', () => {
  const warning: Warning = { code: 'W1', message: 'non-critical' };
  const error: ErrorInfo = { code: 'E1', message: 'critical failure' };

  const result: Result<null> = {
    status: ResultStatus.ERROR,
    data: null,
    warnings: [warning],
    errors: [error],
    metadata: {
      requestId: 'req-002',
      engine: 'test-engine',
      version: '1.0.0',
      timestamp: '2026-01-01T00:00:00.000Z',
    },
  };

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, 'E1');
});
