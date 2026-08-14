/**
 * Valuation Data Contracts
 *
 * Defines the input data contracts required by each valuation approach.
 *
 * These contracts are separate from the core domain types and are specific
 * to the Valuation Engine's data requirements. They are supplied as part of
 * the ValuationRequest and validated before approach execution.
 *
 * All fields are raw inputs only — no derived values, no calculations.
 * The actual valuation calculations are deferred per IMP-005.
 *
 * @module engines/valuation/types/valuation-data.contracts
 */

import { Money } from '../../../core/types';

/**
 * ComparableAdjustments
 *
 * Adjustment factors for a comparable transaction.
 *
 * Each factor represents the adjustment to the comparable's price to align
 * it with the subject property. Values are multipliers (e.g., 1.05 = +5%).
 *
 * All fields are optional because not all adjustments are available for all
 * comparable transactions. Missing adjustments should be treated as neutral
 * (1.0) by the future calculation implementation.
 *
 * Sources: VALUATION-METHODOLOGY.md §6.1-6.10
 */
export interface ComparableAdjustments {
  /** Physical condition adjustment (§6.1) */
  condition?: number;
  /** Building condition adjustment (§6.2) */
  buildingCondition?: number;
  /** View type adjustment (§6.3) */
  viewType?: number;
  /** Floor level adjustment (§6.4) */
  floorLevel?: number;
  /** Street position adjustment (§6.5) */
  streetPosition?: number;
  /** Finish quality adjustment (§6.6) */
  finishQuality?: number;
  /** Furnished status adjustment (§6.7) */
  furnishedStatus?: number;
  /** Age/depreciation adjustment (§6.9) */
  ageDepreciation?: number;
  /** GIS/location penalty adjustment (§6.10) */
  gisPenalty?: number;
}

/**
 * ComparableTransaction
 *
 * A historical transaction used as evidence for the Sales Comparison approach.
 *
 * Source: VALUATION-METHODOLOGY.md §4.1, §9
 */
export interface ComparableTransaction {
  /** Sale price of the comparable */
  readonly salePrice: Money;
  /** Total area of the comparable in square meters */
  readonly area: number;
  /** Date of the transaction (ISO 8601) */
  readonly saleDate: string;
  /** Distance to subject property in meters (optional) */
  readonly distanceMeters?: number;
  /** Adjustment factors for this comparable */
  readonly adjustments?: ComparableAdjustments;
}

/**
 * IncomeData
 *
 * Income-related data required for the Income Capitalization approach.
 *
 * All rates are expressed as decimals (e.g., 0.10 for 10%).
 *
 * Source: VALUATION-METHODOLOGY.md §4.2, §7
 */
export interface IncomeData {
  /** Annual gross rental income in AED */
  readonly grossRent: Money;
  /** Vacancy rate (0.0-1.0) */
  readonly vacancyRate: number;
  /** Operating expenses as a percentage of gross rent (0.0-1.0) */
  readonly operatingExpenses: number;
  /** Capitalization rate (0.0-1.0) */
  readonly capRate: number;
}

/**
 * CostData
 *
 * Cost-related data required for the Cost Approach.
 *
 * Source: VALUATION-METHODOLOGY.md §4.3
 */
export interface CostData {
  /** Replacement cost per square meter in AED/sqm */
  readonly replacementCostPerSqm: Money;
  /** Depreciation factor (0.0-1.0) */
  readonly depreciationFactor: number;
  /** Land component value in AED (optional) */
  readonly landValue?: Money;
}

/**
 * DCFData
 *
 * Forward-looking data required for the Discounted Cash Flow approach.
 *
 * All rates are expressed as decimals (e.g., 0.10 for 10%).
 *
 * Source: VALUATION-METHODOLOGY.md §4.4, §7
 */
export interface DCFData {
  /** Initial annual net operating income in AED */
  readonly initialNOI: Money;
  /** Projection period in years */
  readonly projectionPeriod: number;
  /** Annual rental growth rate (0.0-1.0) */
  readonly rentalGrowthRate: number;
  /** Discount rate (0.0-1.0) */
  readonly discountRate: number;
  /** Exit capitalization rate (0.0-1.0) */
  readonly exitCapRate: number;
  /** Exit costs as a percentage of terminal value (0.0-1.0) */
  readonly exitCosts: number;
}

/**
 * ValuationData
 *
 * Container for all approach-specific input data.
 *
 * Each field is optional because:
 * - Not every property type supports every approach.
 * - Some data may not be available for all properties.
 * - Future approaches may be added.
 */
export interface ValuationData {
  /** Comparable transactions for Sales Comparison */
  readonly comparables?: ComparableTransaction[];
  /** Income data for Income Capitalization */
  readonly income?: IncomeData;
  /** Cost data for Cost Approach */
  readonly cost?: CostData;
  /** DCF data for DCF approach */
  readonly dcf?: DCFData;
}