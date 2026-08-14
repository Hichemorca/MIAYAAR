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
import { ValuationConfiguration } from '../../engines/valuation/types/valuation-configuration.contracts';

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
 * Apartment ValuationConfiguration for testing.
 */
export const apartmentValuationConfiguration: ValuationConfiguration = {
  weights: {
    lower: { salesComparison: 0.48, incomeCapitalization: 0.37, cost: 0.10, dcf: 0.05 },
    baseline: { salesComparison: 0.50, incomeCapitalization: 0.35, cost: 0.10, dcf: 0.05 },
    upper: { salesComparison: 0.52, incomeCapitalization: 0.33, cost: 0.10, dcf: 0.05 },
  },
  assumptions: {
    vacancyRate: 0.10,
    operatingExpenses: 0.20,
    capRate: 0.07,
    rentalGrowthRate: 0.02,
    discountRate: 0.10,
    exitCosts: 0.05,
  },
  adjustments: {
    lower: {
      condition: 0.80,
      buildingCondition: 0.80,
      viewType: 0.80,
      floorLevel: 0.80,
      streetPosition: 0.80,
      finishQuality: 0.80,
      furnishedStatus: 0.80,
      sizeCategory: 0.80,
      ageDepreciation: 0.80,
      gisPenalty: 0.80,
    },
    baseline: {
      condition: 1.00,
      buildingCondition: 1.00,
      viewType: 1.00,
      floorLevel: 1.00,
      streetPosition: 1.00,
      finishQuality: 1.00,
      furnishedStatus: 1.00,
      sizeCategory: 1.00,
      ageDepreciation: 1.00,
      gisPenalty: 1.00,
    },
    upper: {
      condition: 1.20,
      buildingCondition: 1.20,
      viewType: 1.20,
      floorLevel: 1.20,
      streetPosition: 1.20,
      finishQuality: 1.20,
      furnishedStatus: 1.20,
      sizeCategory: 1.20,
      ageDepreciation: 1.20,
      gisPenalty: 1.20,
    },
  },
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