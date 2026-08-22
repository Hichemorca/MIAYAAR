import { describe, expect, it } from 'vitest';
import { PropertyType } from '../../../core/types';
import { minimalProperty } from '../../fixtures/property.fixture';
import {
  METHODOLOGY_DOCUMENT_ID as canonicalDocumentId,
  METHODOLOGY_VERSION as canonicalVersion,
  frozenMethodologyV12,
  resolveValuationConfiguration,
  validateFrozenMethodology,
} from '../../../engines/valuation/methodology-v1_2';
import {
  METHODOLOGY_DOCUMENT_ID as sharedDocumentId,
  METHODOLOGY_VERSION as sharedVersion,
} from '../../../shared/valuation/contracts';
import { getOfficialWeights } from '../../../shared/valuation/method-applicability.policy';

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

  it('retains the exact §5 allocations in the frozen v1.2 configuration without defining a warehouse allocation', () => {
    const propertyTypes = [
      [PropertyType.APARTMENT, 'apartment'],
      [PropertyType.VILLA, 'villa'],
      [PropertyType.TOWNHOUSE, 'townhouse'],
      [PropertyType.OFFICE, 'office'],
      [PropertyType.RETAIL, 'retail'],
      [PropertyType.LAND, 'land'],
    ] as const;

    for (const [canonicalType, submissionType] of propertyTypes) {
      const configuration = resolveValuationConfiguration({
        ...minimalProperty,
        classification: { ...minimalProperty.classification, type: canonicalType },
      });
      expect(configuration?.weights).toEqual(getOfficialWeights(submissionType));
    }
    expect(getOfficialWeights('warehouse')).toBeUndefined();
  });

  it('keeps the interface version declaration aligned with the canonical frozen source', () => {
    expect(sharedDocumentId).toBe(canonicalDocumentId);
    expect(sharedVersion).toBe(canonicalVersion);
    expect(frozenMethodologyV12.documentId).toBe(canonicalDocumentId);
    expect(frozenMethodologyV12.version).toBe(canonicalVersion);
  });
});
