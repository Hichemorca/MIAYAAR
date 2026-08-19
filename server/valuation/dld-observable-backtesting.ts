import type { AdjustmentFactorSet } from '../../engines/valuation/types';

export type BacktestPropertyType = 'apartment' | 'villa' | 'townhouse' | 'office' | 'retail' | 'land' | 'warehouse';
export type BacktestScenario = 'lower' | 'baseline' | 'upper';

export interface DldObservableBacktestRow {
  readonly sourceTransactionId: string;
  readonly transactionDate: Date;
  readonly district: string;
  readonly propertyType: BacktestPropertyType;
  readonly areaSqm: number;
  readonly salePriceAed: number;
  readonly pricePerSqm: number;
}

export interface SelectedComparables {
  readonly status: 'available';
  readonly windowDays: number;
  readonly rows: readonly DldObservableBacktestRow[];
}

export interface InsufficientComparableEvidence {
  readonly status: 'insufficient_local_comparables';
  readonly windowDays: number;
  readonly availableCount: number;
  readonly requiredCount: number;
}

export type HistoricalComparableSelection = SelectedComparables | InsufficientComparableEvidence;

export interface CompletedBacktestEstimate {
  readonly status: 'completed';
  readonly sourceTransactionId: string;
  readonly district: string;
  readonly propertyType: BacktestPropertyType;
  readonly observedSalePriceAed: number;
  readonly primaryEstimateAed: number;
  readonly baselineEstimateAed: number;
  readonly comparableCount: number;
  readonly windowDays: number;
}

export interface RejectedBacktestEstimate {
  readonly status: 'rejected';
  readonly sourceTransactionId: string;
  readonly district: string;
  readonly propertyType: BacktestPropertyType;
  readonly reason: 'insufficient_local_comparables';
  readonly availableCount: number;
  readonly requiredCount: number;
  readonly windowDays: number;
}

export type BacktestEstimate = CompletedBacktestEstimate | RejectedBacktestEstimate;

export interface BacktestMetrics {
  readonly eligibleTargets: number;
  readonly completedTargets: number;
  readonly rejectedTargets: number;
  readonly coverage: number;
  readonly rejectionRate: number;
  readonly primary: ErrorMetrics;
  readonly baseline: ErrorMetrics;
  readonly mdapeDelta: number;
}

export interface ErrorMetrics {
  readonly maeAed: number;
  readonly mdape: number;
  readonly signedBias: number;
}

export interface AdjustmentSensitivity {
  readonly scenario: BacktestScenario;
  readonly baseValueAed: number;
  readonly combinedMultiplier: number;
  readonly adjustedValueAed: number;
  readonly isolatedEffects: Readonly<Record<keyof AdjustmentFactorSet, number>>;
}

const DAY_MS = 86_400_000;
const SEARCH_WINDOWS_DAYS = [90, 180, 365, 730] as const;
const MINIMUM_COMPARABLES = 5;
const MAXIMUM_COMPARABLES = 12;
const VALUE_GROWTH_RATE = 0.03;

function isFinitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isEligibleRow(row: DldObservableBacktestRow): boolean {
  return Boolean(row.sourceTransactionId)
    && row.transactionDate instanceof Date
    && Number.isFinite(row.transactionDate.getTime())
    && Boolean(row.district)
    && isFinitePositive(row.areaSqm)
    && isFinitePositive(row.salePriceAed)
    && isFinitePositive(row.pricePerSqm);
}

function ageInDays(transactionDate: Date, asOf: Date): number {
  return Math.floor((asOf.getTime() - transactionDate.getTime()) / DAY_MS);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint];
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Replays the production local-evidence policy as it would have been known at
 * the target transaction date. Same-day and future rows are deliberately
 * excluded because the available source timestamp has no reliable time of day.
 */
export function selectHistoricalComparables(
  rows: readonly DldObservableBacktestRow[],
  target: DldObservableBacktestRow,
): HistoricalComparableSelection {
  if (!isEligibleRow(target)) {
    return {
      status: 'insufficient_local_comparables',
      windowDays: SEARCH_WINDOWS_DAYS.at(-1)!,
      availableCount: 0,
      requiredCount: MINIMUM_COMPARABLES,
    };
  }

  const historicalLocalRows = rows
    .filter(isEligibleRow)
    .filter(row => row.sourceTransactionId !== target.sourceTransactionId)
    .filter(row => row.district === target.district && row.propertyType === target.propertyType)
    .filter(row => row.transactionDate.getTime() < target.transactionDate.getTime())
    .sort((left, right) => {
      const dateDelta = right.transactionDate.getTime() - left.transactionDate.getTime();
      return dateDelta || right.sourceTransactionId.localeCompare(left.sourceTransactionId);
    });

  for (const windowDays of SEARCH_WINDOWS_DAYS) {
    const withinWindow = historicalLocalRows.filter(row => ageInDays(row.transactionDate, target.transactionDate) <= windowDays);
    if (withinWindow.length >= MINIMUM_COMPARABLES) {
      return { status: 'available', windowDays, rows: withinWindow.slice(0, MAXIMUM_COMPARABLES) };
    }
  }

  const oldestWindow = SEARCH_WINDOWS_DAYS.at(-1)!;
  return {
    status: 'insufficient_local_comparables',
    windowDays: oldestWindow,
    availableCount: historicalLocalRows.filter(row => ageInDays(row.transactionDate, target.transactionDate) <= oldestWindow).length,
    requiredCount: MINIMUM_COMPARABLES,
  };
}

/** Estimates a target only from the selected historical DLD comparables. */
export function estimateDldObservableTarget(
  rows: readonly DldObservableBacktestRow[],
  target: DldObservableBacktestRow,
): BacktestEstimate {
  const selection = selectHistoricalComparables(rows, target);
  if (selection.status !== 'available') {
    return {
      status: 'rejected',
      sourceTransactionId: target.sourceTransactionId,
      district: target.district,
      propertyType: target.propertyType,
      reason: selection.status,
      availableCount: selection.availableCount,
      requiredCount: selection.requiredCount,
      windowDays: selection.windowDays,
    };
  }

  const adjustedPricesPerSqm = selection.rows.map(row => {
    const ageDays = ageInDays(row.transactionDate, target.transactionDate);
    return row.pricePerSqm * Math.pow(1 + VALUE_GROWTH_RATE, ageDays / 365.25);
  });
  const primaryEstimateAed = adjustedPricesPerSqm.reduce((sum, value) => sum + value, 0) / adjustedPricesPerSqm.length * target.areaSqm;
  const baselineEstimateAed = median(selection.rows.map(row => row.pricePerSqm)) * target.areaSqm;

  return {
    status: 'completed',
    sourceTransactionId: target.sourceTransactionId,
    district: target.district,
    propertyType: target.propertyType,
    observedSalePriceAed: target.salePriceAed,
    primaryEstimateAed: round(primaryEstimateAed),
    baselineEstimateAed: round(baselineEstimateAed),
    comparableCount: selection.rows.length,
    windowDays: selection.windowDays,
  };
}

export function runDldObservableBacktest(rows: readonly DldObservableBacktestRow[]): readonly BacktestEstimate[] {
  return rows.filter(isEligibleRow).map(target => estimateDldObservableTarget(rows, target));
}

function errorMetrics(completed: readonly CompletedBacktestEstimate[], estimateKey: 'primaryEstimateAed' | 'baselineEstimateAed'): ErrorMetrics {
  if (!completed.length) return { maeAed: 0, mdape: 0, signedBias: 0 };
  const absoluteErrors = completed.map(result => Math.abs(result[estimateKey] - result.observedSalePriceAed));
  const percentageErrors = completed.map(result => Math.abs(result[estimateKey] - result.observedSalePriceAed) / result.observedSalePriceAed);
  const signedPercentageErrors = completed.map(result => (result[estimateKey] - result.observedSalePriceAed) / result.observedSalePriceAed);
  return {
    maeAed: round(absoluteErrors.reduce((sum, value) => sum + value, 0) / completed.length),
    mdape: round(median(percentageErrors) * 100) / 100,
    signedBias: round((signedPercentageErrors.reduce((sum, value) => sum + value, 0) / completed.length) * 10_000) / 10_000,
  };
}

export function calculateBacktestMetrics(results: readonly BacktestEstimate[]): BacktestMetrics {
  const completed = results.filter((result): result is CompletedBacktestEstimate => result.status === 'completed');
  const rejectedTargets = results.length - completed.length;
  const primary = errorMetrics(completed, 'primaryEstimateAed');
  const baseline = errorMetrics(completed, 'baselineEstimateAed');
  return {
    eligibleTargets: results.length,
    completedTargets: completed.length,
    rejectedTargets,
    coverage: results.length ? completed.length / results.length : 0,
    rejectionRate: results.length ? rejectedTargets / results.length : 0,
    primary,
    baseline,
    mdapeDelta: round((primary.mdape - baseline.mdape) * 10_000) / 10_000,
  };
}

/**
 * Describes the mechanical effect of a frozen adjustment set. The result is
 * deliberately labelled sensitivity: it carries no empirical calibration claim.
 */
export function describeFrozenAdjustmentSensitivity(
  baseValueAed: number,
  scenario: BacktestScenario,
  factors: AdjustmentFactorSet,
): AdjustmentSensitivity {
  if (!isFinitePositive(baseValueAed)) throw new Error('baseValueAed must be finite and positive.');
  const factorEntries = Object.entries(factors) as [keyof AdjustmentFactorSet, number][];
  if (factorEntries.some(([, factor]) => !isFinitePositive(factor))) throw new Error('Adjustment factors must be finite and positive.');
  const combinedMultiplier = factorEntries.reduce((product, [, factor]) => product * factor, 1);
  const isolatedEffects = Object.fromEntries(
    factorEntries.map(([key, factor]) => [key, round(baseValueAed * (factor - 1))]),
  ) as Readonly<Record<keyof AdjustmentFactorSet, number>>;
  return {
    scenario,
    baseValueAed: round(baseValueAed),
    combinedMultiplier: round(combinedMultiplier * 1_000_000) / 1_000_000,
    adjustedValueAed: round(baseValueAed * combinedMultiplier),
    isolatedEffects,
  };
}
