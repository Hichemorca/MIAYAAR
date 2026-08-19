import { describe, expect, it } from 'vitest';
import { PropertyType } from '../../../core/types';
import type { PropertySubmission } from '../../../shared/valuation/contracts';
import { toCanonicalMarketSnapshot, toCanonicalProperty, toCanonicalValuationData } from './core-valuation-adapter';

const submission: PropertySubmission = {
  propertyType: 'apartment',
  district: 'JUMEIRAH VILLAGE CIRCLE',
  areaSqm: 100,
  bedrooms: 1,
  yearBuilt: 2019,
  condition: 'good',
  buildingCondition: 'well_maintained',
  views: ['city'],
  finish: 'normal',
  furnished: 'semi_furnished',
  floor: 'high',
  streetPosition: 'secondary_street',
  annualRentAed: 120_000,
};

const comparables = [{
  sourceTransactionId: 'dld:verified-01',
  transactionDate: new Date('2026-01-15T00:00:00.000Z'),
  district: 'JUMEIRAH VILLAGE CIRCLE',
  propertyType: 'apartment' as const,
  areaSqm: 100,
  salePriceAed: 1_000_000,
  pricePerSqm: 10_000,
  timeAdjustedPricePerSqm: 10_200,
  ageDays: 30,
}];

describe('DLD-to-core valuation adapter', () => {
  it('maps submitted facts and DLD observations without fabricating market indicators', () => {
    const property = toCanonicalProperty(submission, 'req-001', new Date('2026-02-01T00:00:00.000Z'));
    const market = toCanonicalMarketSnapshot(property, comparables, new Date('2026-02-01T00:00:00.000Z'));

    expect(property.classification.type).toBe(PropertyType.APARTMENT);
    expect(property.location.address.district?.code).toBe('JUMEIRAH VILLAGE CIRCLE');
    expect(market.prices.averagePrice.amount).toBe(1_000_000);
    expect(market.prices.priceTrendPercent.status).toBe('unavailable');
    expect(market.supply.status).toBe('unavailable');
    expect(market.demand.status).toBe('unavailable');
    expect(market.liquidity.status).toBe('unavailable');
    expect(market.comparables).toEqual([]);
  });

  it('maps only evidenced approach inputs and intentionally omits a derived DCF input', () => {
    const data = toCanonicalValuationData(submission, comparables, {
      vacancyRate: .10,
      operatingExpenseRate: .20,
      residentialCapRate: .07,
      commercialCapRate: .075,
    });

    expect(data.comparables?.[0].salePrice.amount).toBe(1_020_000);
    expect(data.income?.grossRent.amount).toBe(120_000);
    expect(data.cost).toBeUndefined();
    expect(data.dcf).toBeUndefined();
  });
});
