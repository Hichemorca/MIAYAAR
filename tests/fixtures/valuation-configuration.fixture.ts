/**
 * Valuation Configuration Fixtures
 *
 * Deterministic configuration data for Valuation Engine tests.
 *
 * @module tests/fixtures/valuation-configuration.fixture
 */

import {
  ValuationConfiguration,
} from '../../engines/valuation/types';

export const baselineValuationConfiguration: ValuationConfiguration = {
  weights: {
    lower: {
      salesComparison: 0.50,
      incomeCapitalization: 0.30,
      cost: 0.15,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.40,
      incomeCapitalization: 0.30,
      cost: 0.20,
      dcf: 0.10,
    },
    upper: {
      salesComparison: 0.30,
      incomeCapitalization: 0.30,
      cost: 0.20,
      dcf: 0.20,
    },
  },

  assumptions: {
    vacancyRate: 0.05,
    operatingExpenses: 0.20,
    capRate: 0.08,
    rentalGrowthRate: 0.03,
    discountRate: 0.10,
    exitCosts: 0.02,
  },

  adjustments: {
    lower: {
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
  },
};
