/**
 * Valuation Engine Types Module
 *
 * Defines internal types for the Valuation Engine.
 *
 * @module engines/valuation/types
 */

import { Property, MarketSnapshot, Location, Metadata } from '../../../core/types';

/**
 * ValuationRequest
 *
 * Input contract for the Valuation Engine.
 *
 * Represents one valuation execution. Supports Lower, Baseline, and Upper scenarios
 * through the methodology parameters supplied via configuration.
 */
export interface ValuationRequest {
  /** The property to be valued */
  property: Property;
  /** Market context for the valuation */
  market: MarketSnapshot;
  /** Optional request metadata */
  metadata?: Metadata;
}

/**
 * ValuationResult
 *
 * Output contract for the Valuation Engine.
 *
 * Contains the complete valuation result including scenario outputs.
 */
export interface ValuationResult {
  /** Final consolidated value */
  value: number;
  /** Lower scenario value */
  lowerValue: number;
  /** Baseline scenario value */
  baselineValue: number;
  /** Upper scenario value */
  upperValue: number;
  /** Confidence range lower bound */
  lowerBound?: number;
  /** Confidence range upper bound */
  upperBound?: number;
  /** Individual approach results */
  approachResults: ApproachResult[];
  /** Methodology version used */
  methodologyVersion: string;
}

/**
 * ApproachResult
 *
 * Result from a single valuation approach.
 */
export interface ApproachResult {
  /** Approach name */
  name: string;
  /** Calculated value */
  value: number;
  /** Weight applied */
  weight: number;
  /** Scenario values */
  scenarioValues: {
    lower: number;
    baseline: number;
    upper: number;
  };
}

/**
 * ScenarioConfiguration
 *
 * Configuration for a single scenario.
 *
 * @internal
 */
export interface ScenarioConfiguration {
  /** Scenario name */
  name: 'lower' | 'baseline' | 'upper';
  /** Weights for each approach */
  weights: ApproachWeights;
  /** Adjustment factors */
  adjustments: AdjustmentFactors;
}

/**
 * ApproachWeights
 *
 * Weights for each valuation approach.
 *
 * @internal
 */
export interface ApproachWeights {
  salesComparison: number;
  incomeCapitalization: number;
  cost: number;
  dcf: number;
}

/**
 * AdjustmentFactors
 *
 * Adjustment factors for a scenario.
 *
 * @internal
 */
export interface AdjustmentFactors {
  propertyCondition: number;
  buildingCondition: number;
  viewType: number;
  floorLevel: number;
  streetPosition: number;
  finishQuality: number;
  furnishedStatus: number;
  sizeCategory: number;
  ageDepreciation: number;
  gisPenalty: number;
}