/**
 * Regression test for the canonical Valuation contract in core/types.
 *
 * This test guards the IMP-001 contract: entity audit time is owned only by
 * canonical Metadata, while the valuation's business date remains explicit.
 */

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { Valuation, PropertyType } from '../../../core/types';

test('the canonical Valuation contract can be constructed exactly as documented', () => {
  const valuation: Valuation = {
    id: {
      id: 'val-001',
      propertyId: 'prop-001',
      marketSnapshotId: 'market-001',
      version: '1.0.0',
    },
    valuationMetadata: {
      type: 'FULL',
      propertyType: PropertyType.APARTMENT,
      valuationDate: '2026-01-15T00:00:00.000Z',
      currency: 'AED',
    },
    metadata: {
      id: 'meta-001',
      timestamps: {
        createdAt: '2026-01-16T00:00:00.000Z',
        updatedAt: '2026-01-16T00:00:00.000Z',
      },
      audit: { createdBy: 'test', updatedBy: 'test' },
      version: {
        version: '1.0.0',
        versionedAt: '2026-01-01T00:00:00.000Z',
        versionedBy: 'test',
      },
      provenance: {
        source: { id: 'src-001', name: 'Test Source', type: 'TEST' },
        acquiredAt: '2026-01-01T00:00:00.000Z',
        acquiredBy: 'test',
      },
      status: {
        status: 'ACTIVE',
        category: 'TEST',
        statusChangedAt: '2026-01-01T00:00:00.000Z',
      },
    },
    result: {
      value: {
        amount: 1_000_000,
        currency: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
      },
      approachResults: [],
      methodology: 'MIAYAAR-METH-001',
      methodologyVersion: '1.1',
    },
  };

  assert.equal(valuation.result.value.amount, 1_000_000);
  assert.equal(valuation.result.approachResults.length, 0);
  assert.equal(valuation.valuationMetadata.propertyType, PropertyType.APARTMENT);
  assert.equal('createdAt' in valuation, false);
  assert.equal(valuation.metadata.timestamps.createdAt, '2026-01-16T00:00:00.000Z');
  assert.equal(valuation.valuationMetadata.valuationDate, '2026-01-15T00:00:00.000Z');
  assert.notEqual(valuation.metadata.timestamps.createdAt, valuation.valuationMetadata.valuationDate);
});
