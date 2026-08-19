import { describe, expect, it } from 'vitest';
import {
  calculateBacktestMetrics,
  describeFrozenAdjustmentSensitivity,
  estimateDldObservableTarget,
  selectHistoricalComparables,
  type DldObservableBacktestRow,
} from '../../server/valuation/dld-observable-backtesting';
import type { AdjustmentFactorSet } from '../../engines/valuation/types';

const targetDate = new Date('2026-04-15T00:00:00.000Z');

function row(id: string, daysBeforeTarget: number, pricePerSqm = 10_000): DldObservableBacktestRow {
  return {
    sourceTransactionId: id,
    transactionDate: new Date(targetDate.getTime() - daysBeforeTarget * 86_400_000),
    district: 'TEST DISTRICT',
    propertyType: 'apartment',
    areaSqm: 100,
    salePriceAed: pricePerSqm * 100,
    pricePerSqm,
  };
}

const neutralFactors: AdjustmentFactorSet = {
  condition: 1,
  buildingCondition: 1,
  viewType: 1,
  floorLevel: 1,
  streetPosition: 1,
  finishQuality: 1,
  furnishedStatus: 1,
  sizeCategory: 1,
  ageDepreciation: 1,
  gisPenalty: 1,
};

describe('DLD-observable backtesting', () => {
  it('selects only strictly earlier same-district/type evidence and never the target itself', () => {
    const target = { ...row('target', 0), transactionDate: targetDate, salePriceAed: 1_100_000 };
    const selected = selectHistoricalComparables([
      target,
      row('recent-1', 1),
      row('recent-2', 5),
      row('recent-3', 10),
      row('recent-4', 20),
      row('recent-5', 30),
      { ...row('same-day', 0), sourceTransactionId: 'same-day' },
      { ...row('future', -1), sourceTransactionId: 'future' },
      { ...row('other-district', 4), sourceTransactionId: 'other-district', district: 'OTHER DISTRICT' },
      { ...row('other-type', 4), sourceTransactionId: 'other-type', propertyType: 'villa' },
    ], target);

    expect(selected.status).toBe('available');
    if (selected.status !== 'available') return;
    expect(selected.windowDays).toBe(90);
    expect(selected.rows.map(item => item.sourceTransactionId)).toEqual(['recent-1', 'recent-2', 'recent-3', 'recent-4', 'recent-5']);
  });

  it('rejects instead of manufacturing a value when historical local evidence is insufficient', () => {
    const target = { ...row('target', 0), transactionDate: targetDate };
    const result = estimateDldObservableTarget([target, row('one', 1), row('two', 2), row('three', 3), row('four', 4)], target);

    expect(result).toMatchObject({
      status: 'rejected',
      reason: 'insufficient_local_comparables',
      availableCount: 4,
      requiredCount: 5,
    });
  });

  it('reports primary and baseline metrics only over the completed cohort', () => {
    const metrics = calculateBacktestMetrics([
      {
        status: 'completed',
        sourceTransactionId: 'a',
        district: 'TEST DISTRICT',
        propertyType: 'apartment',
        observedSalePriceAed: 1_000_000,
        primaryEstimateAed: 1_100_000,
        baselineEstimateAed: 900_000,
        comparableCount: 5,
        windowDays: 90,
      },
      {
        status: 'rejected',
        sourceTransactionId: 'b',
        district: 'TEST DISTRICT',
        propertyType: 'apartment',
        reason: 'insufficient_local_comparables',
        availableCount: 4,
        requiredCount: 5,
        windowDays: 730,
      },
    ]);

    expect(metrics).toMatchObject({ eligibleTargets: 2, completedTargets: 1, rejectedTargets: 1, coverage: .5, rejectionRate: .5 });
    expect(metrics.primary).toMatchObject({ maeAed: 100_000, mdape: .1, signedBias: .1 });
    expect(metrics.baseline).toMatchObject({ maeAed: 100_000, mdape: .1, signedBias: -.1 });
  });

  it('labels frozen factor arithmetic as sensitivity and exposes the mechanical effect', () => {
    const sensitivity = describeFrozenAdjustmentSensitivity(1_000_000, 'baseline', {
      ...neutralFactors,
      viewType: 1.15,
      floorLevel: 1.03,
    });

    expect(sensitivity).toMatchObject({
      scenario: 'baseline',
      combinedMultiplier: 1.1845,
      adjustedValueAed: 1_184_500,
    });
    expect(sensitivity.isolatedEffects.viewType).toBe(150_000);
    expect(sensitivity.isolatedEffects.floorLevel).toBe(30_000);
  });
});
