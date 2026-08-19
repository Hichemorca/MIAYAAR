import { describe, expect, it } from 'vitest';
import { PropertyType } from '../../../core/types';
import { minimalProperty } from '../../fixtures/property.fixture';
import { resolveValuationConfiguration, validateFrozenMethodology } from '../../../engines/valuation/methodology-v1_2';

describe('canonical frozen methodology v1.2', () => {
  it('contains complete scenario allocations for every supported canonical property type', () => {
    expect(validateFrozenMethodology()).toEqual([]);
    const configuration = resolveValuationConfiguration({ ...minimalProperty, classification: { ...minimalProperty.classification, type: PropertyType.LAND } });
    expect(configuration?.weights.baseline.salesComparison).toBe(.80);
    expect(configuration?.weights.baseline.dcf).toBe(.20);
  });

  it('does not create an invented Warehouse methodology allocation', () => {
    const configuration = resolveValuationConfiguration({ ...minimalProperty, classification: { ...minimalProperty.classification, type: PropertyType.WAREHOUSE } });
    expect(configuration).toBeUndefined();
  });
});
