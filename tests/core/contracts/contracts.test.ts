/**
 * Regression test for the canonical IEngine / IDataProvider contracts in
 * core/contracts.
 *
 * core/contracts is frozen and out of scope for modification. These tests
 * exist only to confirm that a minimal, real implementation can satisfy
 * both interfaces exactly as documented, with no unsafe casts.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IEngine, IDataProvider } from '../../../core/contracts';
import { Result, ResultStatus } from '../../../core/results';

class FakeEngine implements IEngine<{ input: string }, { output: string }> {
  async execute(request: { input: string }): Promise<Result<{ output: string }>> {
    return {
      status: ResultStatus.SUCCESS,
      data: { output: request.input.toUpperCase() },
      warnings: [],
      errors: [],
      metadata: {
        requestId: 'req-fake',
        engine: 'FakeEngine',
        version: '1.0.0',
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    };
  }
}

class FakeProvider implements IDataProvider<{ id: string }, { id: string; name: string }> {
  async fetch(params: { id: string }): Promise<{ id: string; name: string }> {
    return { id: params.id, name: 'fixture' };
  }

  async validate(_credentials: unknown): Promise<boolean> {
    return true;
  }

  transform(raw: unknown): { id: string; name: string } {
    const value = raw as { id: string; name: string };
    return { id: value.id, name: value.name };
  }
}

test('a minimal class can implement IEngine<TRequest, TData> against Result<TData>', async () => {
  const engine = new FakeEngine();
  const result = await engine.execute({ input: 'abc' });
  assert.equal(result.status, ResultStatus.SUCCESS);
  assert.equal(result.data.output, 'ABC');
});

test('a minimal class can implement IDataProvider<TParams, TData> with all three required methods', async () => {
  const provider = new FakeProvider();
  const data = await provider.fetch({ id: '1' });
  assert.equal(data.id, '1');

  const valid = await provider.validate({ token: 'x' });
  assert.equal(valid, true);

  const transformed = provider.transform({ id: '2', name: 'raw' });
  assert.equal(transformed.name, 'raw');
});