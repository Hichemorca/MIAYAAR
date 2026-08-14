/**
 * Valuation Engine
 *
 * Core decision engine for property valuation.
 *
 * Implements IEngine<TRequest, TData> and returns standardized Result objects.
 * Calculation logic for the four valuation approaches (Sales Comparison, Income
 * Capitalization, Cost, DCF) and Lower/Baseline/Upper scenario execution
 * mechanics are deferred per IMP-005 (Unresolved Implementation Decisions).
 *
 * This engine does not fabricate placeholder valuation data. Every execution
 * currently reports, explicitly and unambiguously via ValuationOutcome, that
 * no valuation is available -- it never returns a numeric value (including
 * zero) that could be mistaken for a real financial result.
 *
 * @module engines/valuation/valuation.engine
 */

import { IEngine } from '../../core/contracts';
import { Result, ResultStatus, ErrorInfo } from '../../core/results';
import { Timestamp } from '../../core/types';
import {
  ValuationRequest,
  ValuationOutcome,
  ValuationData,
  ComparableTransaction,
  IncomeData,
  CostData,
  DCFData,
} from './types';

/**
 * ValuationEngine
 *
 * Primary valuation engine implementing the approved methodology.
 *
 * Deterministic and isolated per ADR-009. Calculation logic is not yet
 * implemented; every invocation reports that outcome explicitly rather than
 * returning fabricated data.
 */
export class ValuationEngine implements IEngine<ValuationRequest, ValuationOutcome> {
  /**
   * Executes a valuation.
   *
   * Calculation logic (approach execution, weighting, scenario handling,
   * result aggregation) is deferred per IMP-005 §20 Unresolved Implementation
   * Decisions. This method does not produce a valuation even when approach
   * data is supplied -- data availability is not valuation completeness.
   *
   * @param request - The valuation request containing property and market data.
   * @returns A promise resolving to a standardized Result object.
   */
  async execute(request: ValuationRequest): Promise<Result<ValuationOutcome>> {
    if (!request.property || !request.market) {
      return this.buildUnavailableResult(
        'VAL_ERR_INVALID_REQUEST',
        'Invalid request: property and market are required.'
      );
    }

    // Check which approaches have structurally valid data
    const availability = this.getApproachAvailability(request.data);

    const hasAnyData = availability.salesComparison ||
                       availability.incomeCapitalization ||
                       availability.cost ||
                       availability.dcf;

    if (hasAnyData) {
      // Data is available, but no calculation has been performed.
      // This is PARTIAL, not SUCCESS -- the engine has not produced a valuation.
      return this.buildPartialResult(
        'VAL_PARTIAL_DATA_AVAILABLE',
        'Approach data is available, but valuation calculation is deferred per IMP-005 unresolved implementation decisions.'
      );
    }

    // No data available and no calculation performed.
    return this.buildUnavailableResult(
      'VAL_ERR_NOT_IMPLEMENTED',
      'Valuation calculation is not yet implemented; deferred per IMP-005 unresolved implementation decisions.'
    );
  }

  /**
   * Determines which approaches have structurally valid data.
   *
   * This validates structural completeness only — it does not validate
   * business logic, market plausibility, or data quality.
   *
   * @internal
   */
  private getApproachAvailability(data?: ValuationData): {
    salesComparison: boolean;
    incomeCapitalization: boolean;
    cost: boolean;
    dcf: boolean;
  } {
    if (!data) {
      return {
        salesComparison: false,
        incomeCapitalization: false,
        cost: false,
        dcf: false,
      };
    }

    return {
      salesComparison: this.hasValidComparables(data.comparables),
      incomeCapitalization: this.hasValidIncomeData(data.income),
      cost: this.hasValidCostData(data.cost),
      dcf: this.hasValidDCFData(data.dcf),
    };
  }

  /**
   * Validates Sales Comparison data: at least one structurally complete
   * comparable transaction.
   *
   * A comparable is structurally complete if it has:
   * - salePrice (Money with amount present)
   * - area (number)
   * - saleDate (non-empty string)
   *
   * No minimum count is enforced beyond "at least one".
   *
   * @internal
   */
  private hasValidComparables(comparables?: ComparableTransaction[]): boolean {
    if (!comparables || comparables.length === 0) {
      return false;
    }

    return comparables.some((comp) => {
      return (
        comp.salePrice !== undefined &&
        comp.salePrice.amount !== undefined &&
        comp.area !== undefined &&
        typeof comp.saleDate === 'string' &&
        comp.saleDate.length > 0
      );
    });
  }

  /**
   * Validates Income Capitalization data: all required fields must be present.
   *
   * Required fields: grossRent, vacancyRate, operatingExpenses, capRate.
   *
   * @internal
   */
  private hasValidIncomeData(income?: IncomeData): boolean {
    if (!income) {
      return false;
    }

    return (
      income.grossRent?.amount !== undefined &&
      income.vacancyRate !== undefined &&
      income.operatingExpenses !== undefined &&
      income.capRate !== undefined
    );
  }

  /**
   * Validates Cost Approach data: all required fields must be present.
   *
   * Required fields: replacementCostPerSqm, depreciationFactor.
   *
   * @internal
   */
  private hasValidCostData(cost?: CostData): boolean {
    if (!cost) {
      return false;
    }

    return (
      cost.replacementCostPerSqm?.amount !== undefined &&
      cost.depreciationFactor !== undefined
    );
  }

  /**
   * Validates DCF data: all required fields must be present.
   *
   * Required fields: initialNOI, projectionPeriod, rentalGrowthRate,
   * discountRate, exitCapRate, exitCosts.
   *
   * @internal
   */
  private hasValidDCFData(dcf?: DCFData): boolean {
    if (!dcf) {
      return false;
    }

    return (
      dcf.initialNOI?.amount !== undefined &&
      dcf.projectionPeriod !== undefined &&
      dcf.rentalGrowthRate !== undefined &&
      dcf.discountRate !== undefined &&
      dcf.exitCapRate !== undefined &&
      dcf.exitCosts !== undefined
    );
  }

  /**
   * Builds a Result whose data explicitly reports that no valuation is
   * available, alongside a matching ErrorInfo entry.
   *
   * This never fabricates valuation data (e.g. a zero value) and never uses
   * an unsafe cast to satisfy the Result<TData> contract -- `data` is always
   * a genuine, fully-typed ValuationOutcome value.
   *
   * @internal
   */
  private buildUnavailableResult(code: string, message: string): Result<ValuationOutcome> {
    const outcome: ValuationOutcome = {
      available: false,
      reasonCode: code,
      reason: message,
    };

    const error: ErrorInfo = { code, message };

    return {
      status: ResultStatus.ERROR,
      data: outcome,
      warnings: [],
      errors: [error],
      metadata: {
        requestId: this.generateRequestId(),
        engine: 'ValuationEngine',
        version: '1.0.0',
        timestamp: '2026-01-01T00:00:00.000Z' as Timestamp,
      },
    };
  }

  /**
   * Builds a PARTIAL Result when data is available but no valuation calculation
   * has been performed. This is distinct from ERROR because the request is
   * structurally valid and data is supplied, but the engine cannot yet produce
   * a valuation.
   *
   * @internal
   */
  private buildPartialResult(code: string, message: string): Result<ValuationOutcome> {
    const outcome: ValuationOutcome = {
      available: false,
      reasonCode: code,
      reason: message,
    };

    const error: ErrorInfo = { code, message };

    return {
      status: ResultStatus.PARTIAL,
      data: outcome,
      warnings: [],
      errors: [error],
      metadata: {
        requestId: this.generateRequestId(),
        engine: 'ValuationEngine',
        version: '1.0.0',
        timestamp: '2026-01-01T00:00:00.000Z' as Timestamp,
      },
    };
  }

  /**
   * Generates a deterministic local request correlation identifier.
   *
   * This is a temporary fallback until the Orchestrator provides
   * request correlation IDs. It satisfies ADR-007's metadata requirements
   * while preserving IMP-005 §9 determinism.
   *
   * @internal
   */
  private generateRequestId(): string {
    return 'local-fallback';
  }
}
