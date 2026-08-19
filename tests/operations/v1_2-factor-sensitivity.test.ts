import { describe, expect, it } from 'vitest';
import { ViewType } from '../../core/types';
import { resolveValuationConfiguration } from '../../engines/valuation/methodology-v1_2';
import type { AdjustmentFactorSet } from '../../engines/valuation/types';
import { describeFrozenAdjustmentSensitivity } from '../../server/valuation/dld-observable-backtesting';
import { minimalProperty } from '../fixtures/property.fixture';

function neutralFactors(): AdjustmentFactorSet {
  return {
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
}

describe('frozen v1.2 factor sensitivity', () => {
  it('reports the baseline sea-view factor as a labelled mechanical effect', () => {
    const seaViewProperty = {
      ...minimalProperty,
      structural: { ...minimalProperty.structural, viewType: ViewType.SEA },
    };
    const configuration = resolveValuationConfiguration(seaViewProperty);
    expect(configuration).toBeDefined();
    expect(configuration!.adjustments.baseline.viewType).toBe(1.15);

    const factors = neutralFactors();
    factors.viewType = configuration!.adjustments.baseline.viewType;
    expect(describeFrozenAdjustmentSensitivity(1_000_000, 'baseline', factors)).toMatchObject({
      scenario: 'baseline',
      combinedMultiplier: 1.15,
      adjustedValueAed: 1_150_000,
      isolatedEffects: { viewType: 150_000 },
    });
  });
});
