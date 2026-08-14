/**
 * Valuation Data Fixtures
 *
 * Provides deterministic, methodology-aligned test data for the Valuation Engine.
 *
 * @module tests/fixtures/valuation-data.fixture
 */

import { Money } from '../../core/types';
import {
  ComparableTransaction,
  ComparableAdjustments,
  IncomeData,
  CostData,
  DCFData,
  ValuationData,
} from '../../engines/valuation/types/valuation-data.contracts';

/**
 * Creates a Money object for testing.
 */
function createMoney(amount: number, code: string = 'AED'): Money {
  return {
    amount,
    currency: {
      code,
      name: 'UAE Dirham',
      symbol: 'AED',
      decimalPlaces: 2,
    },
  };
}

/**
 * Apartment comparables for Sales Comparison testing.
 */
export const apartmentComparables: ComparableTransaction[] = [
  {
    salePrice: createMoney(850000),
    area: 95,
    saleDate: '2026-06-15',
    distanceMeters: 150,
    adjustments: {
      condition: 1.0,
      viewType: 1.0,
      ageDepreciation: 0.95,
    },
  },
  {
    salePrice: createMoney(920000),
    area: 102,
    saleDate: '2026-07-01',
    distanceMeters: 300,
    adjustments: {
      condition: 1.05,
      viewType: 1.02,
      ageDepreciation: 1.0,
    },
  },
  {
    salePrice: createMoney(780000),
    area: 88,
    saleDate: '2026-05-20',
    distanceMeters: 500,
    adjustments: {
      condition: 0.95,
      viewType: 0.98,
      ageDepreciation: 0.95,
    },
  },
];

/**
 * Apartment income data for Income Capitalization testing.
 */
export const apartmentIncomeData: IncomeData = {
  grossRent: createMoney(75000),
  vacancyRate: 0.10,
  operatingExpenses: 0.20,
  capRate: 0.07,
};

/**
 * Apartment cost data for Cost Approach testing.
 */
export const apartmentCostData: CostData = {
  replacementCostPerSqm: createMoney(8000),
  depreciationFactor: 0.08,
  landValue: createMoney(200000),
};

/**
 * Apartment DCF data for DCF testing.
 */
export const apartmentDCFData: DCFData = {
  initialNOI: createMoney(60000),
  projectionPeriod: 10,
  rentalGrowthRate: 0.02,
  discountRate: 0.10,
  exitCapRate: 0.075,
  exitCosts: 0.05,
};

/**
 * Complete ValuationData fixture for an apartment.
 */
export const apartmentValuationData: ValuationData = {
  comparables: apartmentComparables,
  income: apartmentIncomeData,
  cost: apartmentCostData,
  dcf: apartmentDCFData,
};

/**
 * Empty ValuationData fixture (no approach data available).
 */
export const emptyValuationData: ValuationData = {};