/** Tests for deterministic MIAYAAR-METH-001 v1.1 valuation execution. */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ValuationEngine } from '../../../engines/valuation';
import { ResultStatus } from '../../../core/results';
import { minimalProperty } from '../../fixtures/property.fixture';
import { minimalMarketSnapshot } from '../../fixtures/market.fixture';
import {
  apartmentComparables,
  apartmentCostData,
  apartmentDCFData,
  apartmentIncomeData,
  apartmentValuationConfiguration,
  apartmentValuationData,
} from '../../fixtures/valuation-data.fixture';
import { ValuationData, ValuationRequest } from '../../../engines/valuation/types';

const fiveComparables = [
  ...apartmentComparables,
  { ...apartmentComparables[0], saleDate: '2026-06-20' },
  { ...apartmentComparables[1], saleDate: '2026-07-05' },
];

function validRequest(data: ValuationData = { ...apartmentValuationData, comparables: fiveComparables }): ValuationRequest {
  return {
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data,
    config: apartmentValuationConfiguration,
    requestId: 'valuation-test-001',
  };
}

test('rejects a request without property or market context', async () => {
  const engine = new ValuationEngine();
  const noProperty = await engine.execute({ market: minimalMarketSnapshot } as ValuationRequest);
  const noMarket = await engine.execute({ property: minimalProperty } as ValuationRequest);
  assert.equal(noProperty.status, ResultStatus.ERROR);
  assert.equal(noMarket.status, ResultStatus.ERROR);
  assert.equal(noProperty.data.available, false);
  assert.equal(noMarket.data.available, false);
});

test('reports insufficient data without producing a fabricated numeric valuation', async () => {
  const result = await new ValuationEngine().execute(validRequest({}));
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INSUFFICIENT_DATA');
});

test('executes applicable approaches and produces baseline value with scenario bounds', async () => {
  const result = await new ValuationEngine().execute(validRequest());
  assert.equal(result.status, ResultStatus.SUCCESS);
  assert.equal(result.data.available, true);
  if (result.data.available) {
    const valuation = result.data.valuation;
    assert.equal(valuation.result.methodologyVersion, '1.1');
    assert.equal(valuation.result.value.currency.code, 'AED');
    assert.equal(valuation.result.approachResults.length, 3);
    assert.deepEqual(valuation.result.approachResults.map((item) => item.approach), [
      'Sales Comparison', 'Income Capitalization', 'Discounted Cash Flow',
    ]);
    assert.ok(valuation.result.lowerBound!.amount < valuation.result.value.amount);
    assert.ok(valuation.result.value.amount < valuation.result.upperBound!.amount);
    assert.equal(valuation.id.propertyId, minimalProperty.identity.id);
    assert.equal(valuation.createdAt, minimalMarketSnapshot.timestamp.asOf);
    assert.equal(valuation.result.approachResults[0].confidence, 0);
  }
});

test('returns partial with transparent warnings and normalized weights when approaches are missing', async () => {
  const result = await new ValuationEngine().execute(validRequest({ income: apartmentIncomeData }));
  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, true);
  assert.ok(result.warnings.some((item) => item.code === 'VAL_WARN_APPROACH_UNAVAILABLE'));
  if (result.data.available) {
    assert.equal(result.data.valuation.result.approachResults.length, 1);
    assert.equal(result.data.valuation.result.approachResults[0].weight, 1);
  }
});

test('excludes sales comparison below the five-comparable minimum instead of inventing evidence', async () => {
  const result = await new ValuationEngine().execute(validRequest({
    comparables: apartmentComparables,
    income: apartmentIncomeData,
    dcf: apartmentDCFData,
  }));
  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, true);
  assert.ok(result.warnings.some((item) => item.code === 'VAL_WARN_INSUFFICIENT_COMPARABLES'));
  if (result.data.available) {
    assert.ok(result.data.valuation.result.approachResults.every((item) => item.approach !== 'Sales Comparison'));
  }
});

test('validates scenario weights before calculating a valuation', async () => {
  const config = {
    ...apartmentValuationConfiguration,
    weights: {
      ...apartmentValuationConfiguration.weights,
      baseline: { ...apartmentValuationConfiguration.weights.baseline, dcf: 0.10 },
    },
  };
  const result = await new ValuationEngine().execute({ ...validRequest(), config });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INVALID_CONFIGURATION');
});

test('is bit-for-bit deterministic for the same prepared request and configuration', async () => {
  const engine = new ValuationEngine();
  const request = validRequest();
  assert.deepEqual(await engine.execute(request), await engine.execute(request));
});
