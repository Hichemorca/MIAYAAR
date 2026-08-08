/**
 * Valuation Engine
 *
 * Core decision engine for property valuation.
 *
 * Implements IEngine<TRequest, TData> and returns standardized Result objects.
 * Supports four valuation approaches (Sales Comparison, Income Capitalization,
 * Cost, DCF) and Lower/Baseline/Upper scenarios.
 *
 * @module engines/valuation/valuation.engine
 */

import { IEngine } from '../../../core/contracts';
import { Result, ResultStatus, ResultMetadata } from '../../../core/results';
import {
  ValuationRequest,
  ValuationResult,
  ApproachResult,
  ScenarioConfiguration,
  ApproachWeights,
  AdjustmentFactors,
} from './types';

/**
 * ValuationEngine
 *
 * Primary valuation engine implementing the approved methodology.
 *
 * Deterministic, isolated, and returns standardized Result objects.
 */
export class ValuationEngine implements IEngine<ValuationRequest, ValuationResult> {
  /**
   * Executes a valuation.
   *
   * @param request - The valuation request containing property and market data.
   * @returns A promise resolving to a standardized Result object.
   */
  async execute(request: ValuationRequest): Promise<Result<ValuationResult>> {
    try {
      // Validate input
      if (!request.property || !request.market) {
        return this.createErrorResult('Invalid request: property and market are required');
      }

      // Load methodology parameters (from config - to be implemented)
      const config = this.loadMethodologyParameters();

      // Execute Lower, Baseline, and Upper scenarios
      const scenarios = this.executeScenarios(request, config);

      // Aggregate results
      const result = this.aggregateResults(scenarios, config);

      // Return standardized Result
      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Loads methodology parameters from configuration.
   *
   * @internal
   */
  private loadMethodologyParameters(): {
    weights: {
      lower: ApproachWeights;
      baseline: ApproachWeights;
      upper: ApproachWeights;
    };
    adjustments: {
      lower: AdjustmentFactors;
      baseline: AdjustmentFactors;
      upper: AdjustmentFactors;
    };
  } {
    // This will be replaced with actual config loading
    // Static placeholder for demonstration
    return {
      weights: {
        lower: { salesComparison: 0.48, incomeCapitalization: 0.37, cost: 0.10, dcf: 0.05 },
        baseline: { salesComparison: 0.50, incomeCapitalization: 0.35, cost: 0.10, dcf: 0.05 },
        upper: { salesComparison: 0.52, incomeCapitalization: 0.33, cost: 0.10, dcf: 0.05 },
      },
      adjustments: {
        lower: this.getDefaultAdjustments(0.8),
        baseline: this.getDefaultAdjustments(1.0),
        upper: this.getDefaultAdjustments(1.2),
      },
    };
  }

  /**
   * Gets default adjustment factors for a scenario.
   *
   * @internal
   */
  private getDefaultAdjustments(multiplier: number): AdjustmentFactors {
    return {
      propertyCondition: 0.0 * multiplier,
      buildingCondition: 0.0 * multiplier,
      viewType: 0.0 * multiplier,
      floorLevel: 0.0 * multiplier,
      streetPosition: 0.0 * multiplier,
      finishQuality: 0.0 * multiplier,
      furnishedStatus: 0.0 * multiplier,
      sizeCategory: 0.0 * multiplier,
      ageDepreciation: 0.0 * multiplier,
      gisPenalty: 0.0 * multiplier,
    };
  }

  /**
   * Executes all three scenarios.
   *
   * @internal
   */
  private executeScenarios(
    request: ValuationRequest,
    config: any
  ): {
    lower: ApproachResult[];
    baseline: ApproachResult[];
    upper: ApproachResult[];
  } {
    return {
      lower: this.executeScenario(request, 'lower', config),
      baseline: this.executeScenario(request, 'baseline', config),
      upper: this.executeScenario(request, 'upper', config),
    };
  }

  /**
   * Executes a single scenario.
   *
   * @internal
   */
  private executeScenario(
    request: ValuationRequest,
    scenarioName: 'lower' | 'baseline' | 'upper',
    config: any
  ): ApproachResult[] {
    const weights = config.weights[scenarioName];
    const adjustments = config.adjustments[scenarioName];

    // Calculate each approach
    const approaches: ApproachResult[] = [];

    // Sales Comparison
    approaches.push({
      name: 'Sales Comparison',
      value: this.calculateSalesComparison(request, adjustments),
      weight: weights.salesComparison,
      scenarioValues: {
        lower: 0,
        baseline: 0,
        upper: 0,
      },
    });

    // Income Capitalization
    approaches.push({
      name: 'Income Capitalization',
      value: this.calculateIncomeCapitalization(request, adjustments),
      weight: weights.incomeCapitalization,
      scenarioValues: {
        lower: 0,
        baseline: 0,
        upper: 0,
      },
    });

    // Cost Approach
    approaches.push({
      name: 'Cost',
      value: this.calculateCostApproach(request, adjustments),
      weight: weights.cost,
      scenarioValues: {
        lower: 0,
        baseline: 0,
        upper: 0,
      },
    });

    // DCF
    approaches.push({
      name: 'DCF',
      value: this.calculateDCF(request, adjustments),
      weight: weights.dcf,
      scenarioValues: {
        lower: 0,
        baseline: 0,
        upper: 0,
      },
    });

    return approaches;
  }

  /**
   * Calculates Sales Comparison approach.
   *
   * @internal
   */
  private calculateSalesComparison(
    request: ValuationRequest,
    adjustments: AdjustmentFactors
  ): number {
    // Placeholder - implement per VALUATION-METHODOLOGY.md
    const baseValue = request.market.prices.medianPrice.amount || 1000000;
    return baseValue * (1 + adjustments.propertyCondition + adjustments.viewType);
  }

  /**
   * Calculates Income Capitalization approach.
   *
   * @internal
   */
  private calculateIncomeCapitalization(
    request: ValuationRequest,
    adjustments: AdjustmentFactors
  ): number {
    // Placeholder - implement per VALUATION-METHODOLOGY.md
    return request.market.prices.medianPrice.amount || 900000;
  }

  /**
   * Calculates Cost approach.
   *
   * @internal
   */
  private calculateCostApproach(
    request: ValuationRequest,
    adjustments: AdjustmentFactors
  ): number {
    // Placeholder - implement per VALUATION-METHODOLOGY.md
    return request.market.prices.medianPrice.amount || 800000;
  }

  /**
   * Calculates DCF approach.
   *
   * @internal
   */
  private calculateDCF(
    request: ValuationRequest,
    adjustments: AdjustmentFactors
  ): number {
    // Placeholder - implement per VALUATION-METHODOLOGY.md
    return request.market.prices.medianPrice.amount || 700000;
  }

  /**
   * Aggregates scenario results into a final result.
   *
   * @internal
   */
  private aggregateResults(
    scenarios: { lower: ApproachResult[]; baseline: ApproachResult[]; upper: ApproachResult[] },
    config: any
  ): ValuationResult {
    // Calculate weighted averages for each scenario
    const lowerValue = this.calculateWeightedAverage(scenarios.lower);
    const baselineValue = this.calculateWeightedAverage(scenarios.baseline);
    const upperValue = this.calculateWeightedAverage(scenarios.upper);

    // Determine final value (using baseline as primary)
    const finalValue = baselineValue;

    // Use baseline approach results for main display
    const approachResults = scenarios.baseline.map((approach, index) => ({
      ...approach,
      scenarioValues: {
        lower: scenarios.lower[index]?.value || 0,
        baseline: scenarios.baseline[index]?.value || 0,
        upper: scenarios.upper[index]?.value || 0,
      },
    }));

    // Calculate confidence range width
    const rangeWidth = ((upperValue - lowerValue) / baselineValue) * 100;

    return {
      value: finalValue,
      lowerValue,
      baselineValue,
      upperValue,
      lowerBound: lowerValue,
      upperBound: upperValue,
      approachResults,
      methodologyVersion: '1.0',
    };
  }

  /**
   * Calculates weighted average from approach results.
   *
   * @internal
   */
  private calculateWeightedAverage(approachResults: ApproachResult[]): number {
    let total = 0;
    let totalWeight = 0;

    for (const result of approachResults) {
      total += result.value * result.weight;
      totalWeight += result.weight;
    }

    return totalWeight > 0 ? total / totalWeight : 0;
  }

  /**
   * Creates a success Result object.
   *
   * @internal
   */
  private createSuccessResult(data: ValuationResult): Result<ValuationResult> {
    return {
      status: ResultStatus.SUCCESS,
      data,
      warnings: [],
      errors: [],
      metadata: {
        requestId: crypto.randomUUID(),
        engine: 'ValuationEngine',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Creates an error Result object.
   *
   * @internal
   */
  private createErrorResult(message: string): Result<ValuationResult> {
    return {
      status: ResultStatus.ERROR,
      data: null as any,
      warnings: [],
      errors: [{ code: 'VAL_ERR_001', message }],
      metadata: {
        requestId: crypto.randomUUID(),
        engine: 'ValuationEngine',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }
}