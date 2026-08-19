/**
 * Market Fixture
 *
 * Provides a minimal, fully valid MarketSnapshot object for tests. Every
 * field is real and structurally valid against the frozen core/types
 * contracts -- no `as` casts, no partial objects pretending to be complete.
 */

import {
  MarketSnapshot,
  Money,
  Currency,
  PropertyType,
  DataSource,
  TransactionType,
} from '../../core/types';

const aed: Currency = {
  code: 'AED',
  name: 'UAE Dirham',
  symbol: 'د.إ',
  decimalPlaces: 2,
};

const money = (amount: number): Money => ({ amount, currency: aed });

export const minimalMarketSnapshot: MarketSnapshot = {
  id: 'market-fixture-001',
  segment: {
    id: 'segment-fixture-001',
    name: 'Fixture Segment',
    propertyType: PropertyType.APARTMENT,
  },
  timestamp: {
    asOf: '2026-01-01T00:00:00.000Z',
    daysSinceUpdate: 0,
  },
  prices: {
    averagePrice: money(1_000_000),
    medianPrice: money(950_000),
    minPrice: money(500_000),
    maxPrice: money(2_000_000),
    pricePerSqm: money(10_000),
    priceTrendPercent: {
      status: 'unavailable',
      reason: 'not_provided_by_source',
      source: DataSource.DLD,
      observedAt: '2026-01-01T00:00:00.000Z',
    },
  },
  supply: {
    status: 'unavailable',
    reason: 'not_provided_by_source',
    source: DataSource.DLD,
    observedAt: '2026-01-01T00:00:00.000Z',
  },
  demand: {
    status: 'unavailable',
    reason: 'not_provided_by_source',
    source: DataSource.DLD,
    observedAt: '2026-01-01T00:00:00.000Z',
  },
  liquidity: {
    status: 'unavailable',
    reason: 'not_provided_by_source',
    source: DataSource.DLD,
    observedAt: '2026-01-01T00:00:00.000Z',
  },
  volume: {
    count: 5,
    totalValue: money(5_000_000),
    averageValue: money(1_000_000),
    medianValue: money(950_000),
    transactionType: TransactionType.SALE,
  },
  comparables: [],
  source: DataSource.DLD,
};
