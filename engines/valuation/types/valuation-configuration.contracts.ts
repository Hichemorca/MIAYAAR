/**
 * Valuation Configuration Contracts
 *
 * Defines the externalized methodology parameters required for
 * a single Valuation Engine execution.
 *
 * All rates are expressed as decimals (e.g., 0.10 for 10%).
 *
 * @module engines/valuation/types/valuation-configuration.contracts
 */

/**
 * ApproachWeights
 *
 * Weights for each valuation approach in a single scenario.
 *
 * The weights are expected to sum to 1.0 for a complete scenario.
 */
export interface ApproachWeights {
  /** Sales Comparison weight (0.0-1.0) */
  readonly salesComparison: number;

  /** Income Capitalization weight (0.0-1.0) */
  readonly incomeCapitalization: number;

  /** Cost Approach weight (0.0-1.0) */
  readonly cost: number;

  /** DCF weight (0.0-1.0) */
  readonly dcf: number;
}

/**
 * AdjustmentFactorSet
 *
 * Adjustment factors for a single valuation scenario.
 *
 * Values are multipliers (e.g., 1.05 = +5%).
 */
export interface AdjustmentFactorSet {
  readonly condition: number;
  readonly buildingCondition: number;
  readonly viewType: number;
  readonly floorLevel: number;
  readonly streetPosition: number;
  readonly finishQuality: number;
  readonly furnishedStatus: number;
  readonly sizeCategory: number;
  readonly ageDepreciation: number;
  readonly gisPenalty: number;
}

/**
 * ValuationConfiguration
 *
 * Externalized methodology parameters for a single valuation execution.
 *
 * Configuration is injected into ValuationRequest and must not be
 * resolved directly by ValuationEngine.
 */
export interface ValuationConfiguration {
  /**
   * Approach weights for each scenario.
   *
   * Weights must sum to 1.0 per scenario.
   * Missing weights are treated as 0.
   */
  readonly weights: {
    readonly lower: ApproachWeights;
    readonly baseline: ApproachWeights;
    readonly upper: ApproachWeights;
  };

  /**
   * Market assumptions for the valuation.
   *
   * These are the methodology configuration values defined
   * in VALUATION-METHODOLOGY.md §7.
   */
  readonly assumptions: {
    /** Vacancy rate (0.0-1.0) */
    readonly vacancyRate: number;

    /** Operating expenses as percentage of gross rent (0.0-1.0) */
    readonly operatingExpenses: number;

    /** Capitalization rate (0.0-1.0) */
    readonly capRate: number;

    /** Rental growth rate (0.0-1.0) */
    readonly rentalGrowthRate: number;

    /** Discount rate (0.0-1.0) */
    readonly discountRate: number;

    /** Exit costs as percentage of terminal value (0.0-1.0) */
    readonly exitCosts: number;
  };

  /**
   * Adjustment factors for each scenario.
   *
   * Missing adjustments are treated as 1.0.
   */
  readonly adjustments: {
    readonly lower: AdjustmentFactorSet;
    readonly baseline: AdjustmentFactorSet;
    readonly upper: AdjustmentFactorSet;
  };
}