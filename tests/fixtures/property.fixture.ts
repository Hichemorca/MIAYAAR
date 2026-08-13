/**
 * Property Fixture
 *
 * Provides a minimal, fully valid Property (and reusable Metadata) object
 * for tests. Every field set here is real and structurally valid against
 * the frozen core/types contracts -- no `as` casts, no partial objects
 * pretending to be complete.
 */

import {
  Property,
  Location,
  Metadata,
  PropertyType,
  UsageType,
  PropertyCondition,
  BuildingCondition,
} from '../../core/types';

export const sharedMetadataFixture: Metadata = {
  id: 'meta-fixture-001',
  timestamps: {
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  audit: {
    createdBy: 'fixture-user',
    updatedBy: 'fixture-user',
  },
  version: {
    version: '1.0.0',
    versionedAt: '2026-01-01T00:00:00.000Z',
    versionedBy: 'fixture-user',
  },
  provenance: {
    source: {
      id: 'src-fixture-001',
      name: 'Fixture Source',
      type: 'TEST_FIXTURE',
    },
    acquiredAt: '2026-01-01T00:00:00.000Z',
    acquiredBy: 'fixture-user',
  },
  status: {
    status: 'ACTIVE',
    category: 'TEST',
    statusChangedAt: '2026-01-01T00:00:00.000Z',
  },
};

const fixtureLocation: Location = {
  id: 'loc-fixture-001',
  address: {
    street: 'Fixture Street',
  },
};

export const minimalProperty: Property = {
  identity: {
    id: 'prop-fixture-001',
  },
  name: {
    name: 'Fixture Property',
    description: 'Minimal valid property fixture for testing.',
  },
  classification: {
    type: PropertyType.APARTMENT,
    usage: UsageType.RESIDENTIAL,
    status: 'ACTIVE',
  },
  location: fixtureLocation,
  physical: {
    totalArea: 100,
  },
  structural: {
    propertyCondition: PropertyCondition.GOOD,
    buildingCondition: BuildingCondition.WELL_MAINTAINED,
  },
  legal: {},
  metadata: sharedMetadataFixture,
};