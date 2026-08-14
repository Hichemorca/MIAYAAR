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
import { ValuationEngine } from '../../../engines/valuation';
import { baselineValuationConfiguration } from '../../fixtures/valuation-configuration.fixture';
import {
  ValuationRequest,
  ValuationData,
} from '../../../engines/valuation/types';
import { minimalProperty } from '../../fixtures/property.fixture';
import { minimalMarketSnapshot } from '../../fixtures/market.fixture';
import {
  apartmentValuationData,
  emptyValuationData,
  apartmentComparables,
  apartmentIncomeData,
  apartmentCostData,
  apartmentDCFData,
} from '../../fixtures/valuation-data.fixture';
import { ResultStatus } from '../../../core/results';

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

test('ValuationEngine reports "not implemented" for a structurally valid request with no approach data', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    config: baselineValuationConfiguration,
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

test('ValuationEngine reports PARTIAL when complete approach data is available but calculation is deferred', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: apartmentValuationData,
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, false);

  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_PARTIAL_DATA_AVAILABLE');
    // Still no numeric fields, even though data exists.
    assert.equal('value' in result.data, false);
    assert.equal('lowerValue' in result.data, false);
    assert.equal('baselineValue' in result.data, false);
    assert.equal('upperValue' in result.data, false);
  }

  assert.equal(result.errors.length, 1);
  assert.equal(result.errors[0].code, 'VAL_PARTIAL_DATA_AVAILABLE');
});

test('ValuationEngine reports ERROR when empty ValuationData is provided (treated as no data)', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: emptyValuationData,
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  // Empty data object is equivalent to no data -> ERROR, not PARTIAL.
  // Data must be non-empty to be considered "available".
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);

  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine reports PARTIAL with only comparables data', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      comparables: apartmentComparables,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_PARTIAL_DATA_AVAILABLE');
  }
});

test('ValuationEngine reports PARTIAL with only income data', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      income: apartmentIncomeData,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_PARTIAL_DATA_AVAILABLE');
  }
});

test('ValuationEngine reports PARTIAL with only cost data', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      cost: apartmentCostData,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_PARTIAL_DATA_AVAILABLE');
  }
});

test('ValuationEngine reports PARTIAL with only DCF data', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      dcf: apartmentDCFData,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_PARTIAL_DATA_AVAILABLE');
  }
});

test('ValuationEngine reports ERROR when comparables array is empty', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      comparables: [],
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  // Empty comparables array is not usable structural data
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine reports ERROR when income data is incomplete (missing field)', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      income: {
        grossRent: { amount: 75000, currency: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2 } },
        vacancyRate: 0.10,
        operatingExpenses: 0.20,
        // capRate is missing
      } as any,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  // Incomplete income data is not usable
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine reports ERROR when cost data is incomplete (missing field)', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      cost: {
        replacementCostPerSqm: { amount: 8000, currency: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2 } },
        // depreciationFactor is missing
      } as any,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine reports ERROR when DCF data is incomplete (missing field)', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      dcf: {
        initialNOI: { amount: 60000, currency: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', decimalPlaces: 2 } },
        projectionPeriod: 10,
        rentalGrowthRate: 0.02,
        discountRate: 0.10,
        exitCapRate: 0.075,
        // exitCosts is missing
      } as any,
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine reports ERROR when comparable has no salePrice', async () => {
  const engine = new ValuationEngine();
  const request: ValuationRequest = {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: {
      comparables: [
        {
          area: 100,
          saleDate: '2026-01-01',
        } as any,
      ],
    },
    config: baselineValuationConfiguration,
  };

  const result = await engine.execute(request);

  // Missing salePrice means the comparable is not structurally valid
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_NOT_IMPLEMENTED');
  }
});

test('ValuationEngine never falls back to placeholder metadata values', async () => {
  const engine = new ValuationEngine();
  const result = await engine.execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    config: baselineValuationConfiguration,
  });

  assert.equal(typeof result.metadata.requestId, 'string');
  assert.notEqual(result.metadata.requestId, '');
  assert.equal(typeof result.metadata.timestamp, 'string');
  assert.notEqual(result.metadata.timestamp, '');
  // A real, parseable timestamp -- not a placeholder.
  assert.doesNotThrow(() => new Date(result.metadata.timestamp).toISOString());
});