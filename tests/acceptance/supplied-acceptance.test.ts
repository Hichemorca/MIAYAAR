import assert from 'node:assert/strict';
import { test } from 'vitest';
import { appRouter } from '../../server/routers';
import { ValuationEngine } from '../../engines/valuation';
import {
  frozenMethodologyV12,
  METHODOLOGY_DOCUMENT_ID,
  METHODOLOGY_VERSION,
  resolveValuationConfiguration,
  validateFrozenMethodology,
} from '../../engines/valuation/methodology-v1_2';
import { PropertyType } from '../../core/types';
import { ResultStatus } from '../../core/results';
import { minimalProperty } from '../fixtures/property.fixture';
import { minimalMarketSnapshot } from '../fixtures/market.fixture';
import { apartmentComparables, apartmentValuationData } from '../fixtures/valuation-data.fixture';

const validSubmission = {
  propertyType: 'apartment' as const,
  district: 'Jumeirah Village Circle',
  areaSqm: 100,
  bedrooms: 1,
  yearBuilt: 2020,
  condition: 'good' as const,
  buildingCondition: 'well_maintained' as const,
  views: ['city' as const],
  finish: 'good' as const,
  furnished: 'semi_furnished' as const,
  floor: 'mid' as const,
  annualRentAed: 120000,
};

test('AC-01: keeps the real methodology identity and frozen release version visible', () => {
  assert.equal(METHODOLOGY_DOCUMENT_ID, 'MIAYAAR-METH-001');
  assert.equal(METHODOLOGY_VERSION, '1.2');
  assert.equal(frozenMethodologyV12.status, 'frozen');
});

test('AC-02: validates all configured methodology weights across every supported property type and scenario', () => {
  assert.deepEqual(validateFrozenMethodology(), []);
  for (const scenarios of Object.values(frozenMethodologyV12.weightsByPropertyType)) {
    for (const weights of Object.values(scenarios ?? {})) {
      const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      assert.ok(Math.abs(total - 1) < 0.000001);
    }
  }
});

test('AC-03: uses the approved apartment baseline allocation', () => {
  const weights = frozenMethodologyV12.weightsByPropertyType[PropertyType.APARTMENT]?.baseline;
  assert.deepEqual(weights, {
    salesComparison: 0.5,
    incomeCapitalization: 0.35,
    cost: 0.1,
    dcf: 0.05,
  });
});

test('AC-04: provides canonical LAND weights and leaves WAREHOUSE unsupported', () => {
  assert.deepEqual(frozenMethodologyV12.weightsByPropertyType[PropertyType.LAND]?.baseline, {
    salesComparison: 0.8,
    incomeCapitalization: 0,
    cost: 0,
    dcf: 0.2,
  });
  assert.equal(frozenMethodologyV12.weightsByPropertyType[PropertyType.WAREHOUSE], undefined);
});

test('AC-05: rejects unknown property classifications at the public tRPC boundary', async () => {
  const caller = appRouter.createCaller({ user: null } as never);
  await assert.rejects(() => caller.valuation.run({ ...validSubmission, propertyType: 'castle' } as never));
});

test('AC-05a: rejects an SQL-injection-shaped property classification before it can reach evidence queries', async () => {
  const caller = appRouter.createCaller({ user: null } as never);
  await assert.rejects(() => caller.valuation.run({ ...validSubmission, propertyType: "'; DROP TABLE users; --" } as never));
});

test('AC-05b: rejects an XSS-shaped property classification before report rendering', async () => {
  const caller = appRouter.createCaller({ user: null } as never);
  await assert.rejects(() => caller.valuation.run({ ...validSubmission, propertyType: '<script>alert(1)</script>' } as never));
});

test('AC-06: rejects zero or negative property area at the public tRPC boundary', async () => {
  const caller = appRouter.createCaller({ user: null } as never);
  await assert.rejects(() => caller.valuation.run({ ...validSubmission, areaSqm: 0 }));
});

test('AC-07: the canonical engine does not manufacture a valuation when all evidence inputs are absent', async () => {
  const configuration = resolveValuationConfiguration(minimalProperty);
  assert.ok(configuration);
  const result = await new ValuationEngine().execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    config: configuration!,
  });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_INSUFFICIENT_APPROACH_DATA');
});

test('AC-08: produces ordered lower, baseline, and upper evidence-led scenario values when inputs are valid', async () => {
  const configuration = resolveValuationConfiguration(minimalProperty);
  assert.ok(configuration);
  const result = await new ValuationEngine().execute({
    requestId: 'acceptance-scenario-ordering',
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: apartmentValuationData,
    config: configuration!,
  });
  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, true);
  if (result.data.available) {
    const valuation = result.data.valuation.result;
    assert.ok(valuation.lowerBound!.amount < valuation.value.amount);
    assert.ok(valuation.value.amount < valuation.upperBound!.amount);
    assert.equal(valuation.methodology, 'MIAYAAR-METH-001');
    assert.equal(valuation.methodologyVersion, '1.2');
  }
});

test('AC-09: reports unavailable approaches instead of replacing absent evidence with synthetic values', async () => {
  const configuration = resolveValuationConfiguration(minimalProperty);
  assert.ok(configuration);
  const result = await new ValuationEngine().execute({
    property: minimalProperty,
    market: minimalMarketSnapshot,
    data: { comparables: apartmentComparables },
    config: configuration!,
  });
  assert.equal(result.status, ResultStatus.PARTIAL);
  assert.equal(result.data.available, true);
  assert.ok(result.warnings.some(warning => warning.code === 'VAL_WARN_APPROACH_UNAVAILABLE'));
  if (result.data.available) assert.equal(result.data.valuation.result.approachResults.length, 1);
});

test('AC-10: rejects warehouse valuation until a dedicated frozen methodology is approved', async () => {
  const warehouse = { ...minimalProperty, classification: { ...minimalProperty.classification, type: PropertyType.WAREHOUSE } };
  const configuration = resolveValuationConfiguration(minimalProperty);
  assert.ok(configuration);
  const result = await new ValuationEngine().execute({
    property: warehouse,
    market: minimalMarketSnapshot,
    data: { comparables: apartmentComparables },
    config: configuration!,
  });
  assert.equal(result.status, ResultStatus.ERROR);
  assert.equal(result.data.available, false);
  if (!result.data.available) assert.equal(result.data.reasonCode, 'VAL_ERR_UNSUPPORTED_PROPERTY_TYPE');
});
