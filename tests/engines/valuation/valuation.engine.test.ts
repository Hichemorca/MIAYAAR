/**
 * Tests for the Valuation Engine's current contract-safe stub behavior.
 *
 * These tests intentionally do NOT test any calculation logic, since none
 * exists yet (deferred per IMP-005). They exist to lock in the P0
 * remediation guarantees: no fabricated valuation data, no unsafe casts,
 * and correct Result<TData>/ValuationOutcome/IEngine contract compliance.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValuationEngine, ValuationRequest } from '../../../engines/valuation';
import { ResultStatus } from '../../../core/results';
import { minimalProperty } from '../../fixtures/property.fixture';
import { minimalMarketSnapshot } from '../../fixtures/market.fixture';

test('ValuationEngine reports an error for a request missing property', async () => {
  const engine = new ValuationEngine();

  // Deliberately malformed input to exercise runtime validation -- this
  // cast exists only to simulate an invalid caller, not to fake a valid
  // request.
  const invalidRequest = { market: minimalMarketSnapshot } as ValuationRequest;
  const result = await engine.execute(invalidRequest);

  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_INVALID_REQUEST');
  }
});

test('ValuationEngine reports an error for a request missing market', async () => {
  const engine = new ValuationEngine();

  const invalidRequest = { property: minimalProperty } as ValuationRequest;
  const result = await engine.execute(invalidRequest);

  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_INVALID_REQUEST');
  }
});

test('ValuationEngine reports "not implemented" for a structurally valid request, never a numeric value', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);

  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
    // The "unavailable" branch of ValuationOutcome carries no numeric
    // fields at all -- assert this explicitly rather than relying on it
    // silently, since this is the exact defect P0-2 removed.
    assert.equal('value' in result.data, false);
    assert.equal('lowerValue' in result.data, false);
    assert.equal('baselineValue' in result.data, false);
    assert.equal('upperValue' in result.data, false);
  }

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, 'VAL_ERR_NOT_IMPLEMENTED');
});

test('ValuationEngine never falls back to placeholder metadata values', async () => {
  const engine = new ValuationEngine();
  const result = await engine.execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
  });

  assert.equal(typeof result.metadata.requestId, 'string');
  assert.notEqual(result.metadata.requestId, '');
  assert.equal(typeof result.metadata.timestamp, 'string');
  assert.notEqual(result.metadata.timestamp, '');
  // A real, parseable timestamp -- not a placeholder.
  assert.doesNotThrow(() => new Date(result.metadata.timestamp).toISOString());
});