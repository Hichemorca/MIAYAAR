/**
 * Regression tests for the canonical valuation engine.
 *
 * The suite locks in the core Result<T> / Valuation contracts while making
 * provisional calculation decisions visible in warnings rather than hiding
 * them behind a fabricated or deferred result.
 */

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { ValuationEngine } from '../../../engines/valuation';
import { ValuationRequest } from '../../../engines/valuation/types';
import { PropertyType } from '../../../core/types';
import { baselineValuationConfiguration } from '../../fixtures/valuation-configuration.fixture';
import { minimalProperty } from '../../fixtures/property.fixture';
import { minimalMarketSnapshot } from '../../fixtures/market.fixture';
import {
  apartmentComparables,
  apartmentDCFData,
  apartmentIncomeData,
  apartmentValuationConfiguration,
  apartmentValuationData,
} from '../../fixtures/valuation-data.fixture';
import { ResultStatus } from '../../../core/results';

test('reports an error for a request missing property', async () => {
  const result = await new ValuationEngine().execute({ market: minimalMarketSnapshot } as ValuationRequest);
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INVALID_REQUEST');
});

test('reports an error for a request missing market', async () => {
  const result = await new ValuationEngine().execute({ property: minimalProperty } as ValuationRequest);
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INVALID_REQUEST');
});

test('does not fabricate a valuation when every approach input is absent', async () => {
  const result = await new ValuationEngine().execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    config: baselineValuationConfiguration,
  });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) {
    assert.equal(result.data.reasonCode, 'VAL_ERR_INSUFFICIENT_APPROACH_DATA');
    assert.equal('valuation' in result.data, false);
  }
});

test('excludes Cost from an apartment valuation even when cost data and its frozen §5 weight are present', async () => {
  const result = await new ValuationEngine().execute({
    requestId: 'request-canonical-001',
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: apartmentValuationData,
    config: apartmentValuationConfiguration,
  });

  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.errors.length, 0);
  assert.equal(result.data.available, true);
  if (result.data.available) {
    const valuation = result.data.valuation;
    assert.equal(valuation.id.id, 'valuation:request-canonical-001');
    assert.equal(valuation.id.propertyId, minimalProperty.identity.id);
    assert.equal(valuation.id.marketSnapshotId, minimalMarketSnapshot.id);
    assert.equal(valuation.result.methodology, 'MIAYAAR-METH-001');
    assert.equal(valuation.result.methodologyVersion, '1.2');
    assert.equal(valuation.result.value.currency.code, 'AED');
    assert.ok(valuation.result.value.amount > 0);
    assert.equal(valuation.result.approachResults.length, 3);
    assert.deepEqual(valuation.result.approachResults.map(approach => approach.approach), [
      'Sales Comparison',
      'Income Capitalization',
      'Discounted Cash Flow',
    ]);
    assert.ok(valuation.result.lowerBound!.amount < valuation.result.value.amount);
    assert.ok(valuation.result.upperBound!.amount > valuation.result.value.amount);
    assert.ok(valuation.result.rangeWidthPercent! > 0);
    assert.equal(valuation.metadata.provenance.source.id, 'MIAYAAR-METH-001');
    assert.equal('createdAt' in valuation, false);
    assert.doesNotThrow(() => new Date(valuation.metadata.timestamps.createdAt).toISOString());
    assert.doesNotThrow(() => new Date(valuation.valuationMetadata.valuationDate).toISOString());
    const policies = valuation.result.approachResults.map(approach => String(approach.metadata?.policy ?? ''));
    const aggregationPolicies = valuation.result.approachResults.map(approach => String(approach.metadata?.aggregationPolicy ?? ''));
    assert.ok(policies.includes('PROVISIONAL_CALC-010_CALC-011'));
    assert.ok(aggregationPolicies.every(policy => policy === 'PROVISIONAL_CALC-012_CALC-013'));
  }
  const provisionalWarning = result.warnings.find(
    warning => warning.code === 'VAL_WARN_PROVISIONAL_POLICY'
  );
  assert.deepEqual(provisionalWarning, {
    code: 'VAL_WARN_PROVISIONAL_POLICY',
    message:
      'The completed valuation applies explicitly labelled provisional calculation rules pending methodology approval (CALC-008, CALC-009, CALC-010, CALC-011, CALC-012, CALC-013, CALC-014, CALC-016).',
  });
    assert.ok(!provisionalWarning?.message.includes('CALC-015'));
  assert.equal(result.warnings.some(warning => warning.message.startsWith('cost is unavailable')), false);
});

test('filters income and cost calculations for land while retaining its applicable sales comparison and DCF methods', async () => {
  const landProperty = {
    ...minimalProperty,
    classification: { ...minimalProperty.classification, type: PropertyType.LAND },
  };
  const result = await new ValuationEngine().execute({
    property: landProperty,
    market: minimalMarketSnapshot,
    data: apartmentValuationData,
    config: baselineValuationConfiguration,
  });

  assert.equal(result.data.available, true);
  if (result.data.available) {
    assert.deepEqual(result.data.valuation.result.approachResults.map(approach => approach.approach), [
      'Sales Comparison',
      'Discounted Cash Flow',
    ]);
  }
  assert.equal(result.warnings.some(warning => warning.message.startsWith('incomeCapitalization is unavailable')), false);
  assert.equal(result.warnings.some(warning => warning.message.startsWith('cost is unavailable')), false);
});

test('returns a transparent partial result when only sales comparison data is usable', async () => {
  const result = await new ValuationEngine().execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: { comparables: apartmentComparables },
    config: baselineValuationConfiguration,
  });
  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, true);
  if (result.data.available) {
    assert.equal(result.data.valuation.result.approachResults.length, 1);
    assert.equal(result.data.valuation.result.approachResults[0].approach, 'Sales Comparison');
  }
  assert.ok(result.warnings.some(warning => warning.code === 'VAL_WARN_APPROACH_UNAVAILABLE'));
});

test('rejects structurally incomplete monetary inputs instead of manufacturing an approach value', async () => {
  const incompleteIncome = {
    grossRent: apartmentIncomeData.grossRent,
    vacancyRate: apartmentIncomeData.vacancyRate,
    operatingExpenses: apartmentIncomeData.operatingExpenses,
    capRate: 0,
  };
  const result = await new ValuationEngine().execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: { income: incompleteIncome },
    config: baselineValuationConfiguration,
  });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INSUFFICIENT_APPROACH_DATA');
});

test('rejects an unsupported warehouse type until a formally approved configuration exists', async () => {
  const warehouseProperty = {
    ...minimalProperty,
    classification: { ...minimalProperty.classification, type: PropertyType.WAREHOUSE },
  };
  const result = await new ValuationEngine().execute({
    property: warehouseProperty,
    market: minimalMarketSnapshot,
    data: { comparables: apartmentComparables },
    config: baselineValuationConfiguration,
  });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_UNSUPPORTED_PROPERTY_TYPE');
});

test('uses real result metadata and retains the caller correlation identifier', async () => {
  const result = await new ValuationEngine().execute({
    requestId: 'audit-request-007',
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: { dcf: apartmentDCFData },
    config: baselineValuationConfiguration,
  });
  assert.equal(result.metadata.requestId, 'audit-request-007');
  assert.equal(result.metadata.engine, 'MIAYAAR.ValuationEngine');
  assert.doesNotThrow(() => new Date(result.metadata.timestamp).toISOString());
  assert.equal(result.data.available, true);
});
