/**
 * Deterministic MIAYAAR-METH-001 v1.1 valuation engine.
 *
 * This engine receives prepared evidence and configuration only. It does not
 * access external services, mutable state, system time, or other engines.
 *
 * @module engines/valuation/valuation.engine
 */

import { IEngine } from '../../core/contracts';
import { ErrorInfo, Result, ResultStatus, Warning } from '../../core/results';
import { Money, PropertyType, Timestamp, Valuation, ValuationApproachResult } from '../../core/types';
import {
  ComparableTransaction,
  CostData,
  DCFData,
  IncomeData,
  ValuationConfiguration,
  ValuationData,
  ValuationOutcome,
  ValuationRequest,
} from './types';

type Scenario = 'lower' | 'baseline' | 'upper';
type ApproachKey = 'salesComparison' | 'incomeCapitalization' | 'cost' | 'dcf';

interface CalculatedApproach {
  readonly key: ApproachKey;
  readonly label: string;
  readonly value: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

interface ScenarioResult {
  readonly value: number;
  readonly approachResults: readonly ValuationApproachResult[];
}

const ENGINE_VERSION = '1.1.0';
const METHODOLOGY_VERSION = '1.1';
const METHODOLOGY_NAME = 'MIAYAAR Valuation Methodology';
const WEIGHT_TOLERANCE = 0.000001;

/** Executes sales comparison, income capitalization, cost, and DCF approaches. */
export class ValuationEngine implements IEngine<ValuationRequest, ValuationOutcome> {
  /** Executes a complete lower, baseline, and upper valuation deterministically. */
  async execute(request: ValuationRequest): Promise<Result<ValuationOutcome>> {
    if (!request?.property || !request.market || !request.config) {
      return this.unavailable('VAL_ERR_INVALID_REQUEST', 'Property, market, and configuration are required.', request);
    }
    const configurationError = this.validateConfiguration(request.config);
    if (configurationError) return this.unavailable('VAL_ERR_INVALID_CONFIGURATION', configurationError, request);

    const currency = this.resolveCurrency(request);
    if (!currency) {
      return this.unavailable('VAL_ERR_CURRENCY_MISMATCH', 'All valuation inputs must use one ISO currency.', request);
    }

    const calculated = this.calculateApproaches(
      request.data,
      request.property.classification.type,
      request.property.physical.totalArea
    );
    if (calculated.approaches.length === 0) {
      return this.unavailable(
        'VAL_ERR_INSUFFICIENT_DATA',
        'No applicable approach has sufficient valid prepared data.',
        request,
        calculated.warnings
      );
    }

    let scenarios: Record<Scenario, ScenarioResult>;
    try {
      scenarios = {
        lower: this.runScenario('lower', calculated.approaches, request.config, currency),
        baseline: this.runScenario('baseline', calculated.approaches, request.config, currency),
        upper: this.runScenario('upper', calculated.approaches, request.config, currency),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No positive active approach weight is available.';
      return this.unavailable('VAL_ERR_NO_ACTIVE_WEIGHT', message, request, calculated.warnings);
    }

    const scenarioValues = [scenarios.lower.value, scenarios.baseline.value, scenarios.upper.value];
    const warnings = [
      ...calculated.warnings,
      ...this.missingApproachWarnings(request.property.classification.type, calculated.approaches),
    ];
    const valuation = this.buildValuation(
      request,
      currency,
      scenarios.baseline.value,
      Math.min(...scenarioValues),
      Math.max(...scenarioValues),
      scenarios.baseline.approachResults
    );

    return {
      status: warnings.length ? ResultStatus.PARTIAL : ResultStatus.SUCCESS,
      data: { available: true, valuation },
      warnings,
      errors: [],
      metadata: this.resultMetadata(request),
    };
  }

  private calculateApproaches(data: ValuationData | undefined, type: PropertyType, area: number): {
    readonly approaches: readonly CalculatedApproach[];
    readonly warnings: readonly Warning[];
  } {
    if (!data || !Number.isFinite(area) || area <= 0) return { approaches: [], warnings: [] };
    const approaches: CalculatedApproach[] = [];
    const warnings: Warning[] = [];
    const validComparables = (data.comparables ?? []).filter((item) => this.validComparable(item));

    if (validComparables.length >= 5) {
      approaches.push(this.salesComparison(validComparables, area));
    } else if (data.comparables?.length) {
      warnings.push(this.warning('VAL_WARN_INSUFFICIENT_COMPARABLES', `Sales comparison requires at least 5 valid comparables; received ${validComparables.length}.`));
    }
    if (this.allowsIncome(type) && this.validIncome(data.income)) approaches.push(this.incomeCapitalization(data.income));
    if (this.allowsCost(type) && this.validCost(data.cost)) approaches.push(this.costApproach(data.cost, area));
    if (this.allowsDcf(type) && this.validDcf(data.dcf)) approaches.push(this.dcf(data.dcf));
    return { approaches, warnings };
  }

  /** Sales comparison = arithmetic mean of adjusted comparable price per sqm × subject area. */
  private salesComparison(comparables: readonly ComparableTransaction[], area: number): CalculatedApproach {
    const values = comparables.map((item) => (item.salePrice.amount / item.area) * area * this.product(Object.values(item.adjustments ?? {})));
    return {
      key: 'salesComparison',
      label: 'Sales Comparison',
      value: this.round(values.reduce((total, value) => total + value, 0) / values.length),
      metadata: { comparableCount: comparables.length, statistic: 'arithmeticMeanAdjustedValue' },
    };
  }

  /** Income capitalization = NOI ÷ cap rate. */
  private incomeCapitalization(income: IncomeData): CalculatedApproach {
    const noi = income.grossRent.amount * (1 - income.vacancyRate) * (1 - income.operatingExpenses);
    return {
      key: 'incomeCapitalization', label: 'Income Capitalization', value: this.round(noi / income.capRate),
      metadata: { netOperatingIncome: this.round(noi), capRate: income.capRate },
    };
  }

  /** Cost approach = depreciated replacement cost + prepared land component. */
  private costApproach(cost: CostData, area: number): CalculatedApproach {
    const buildingValue = area * cost.replacementCostPerSqm.amount * (1 - cost.depreciationFactor);
    const landValue = cost.landValue?.amount ?? 0;
    return {
      key: 'cost', label: 'Cost Approach', value: this.round(buildingValue + landValue),
      metadata: { buildingValue: this.round(buildingValue), landValue },
    };
  }

  /** DCF = discounted annual NOI plus discounted net terminal value. */
  private dcf(data: DCFData): CalculatedApproach {
    let presentValue = 0;
    for (let year = 1; year <= data.projectionPeriod; year += 1) {
      const noi = data.initialNOI.amount * Math.pow(1 + data.rentalGrowthRate, year);
      presentValue += noi / Math.pow(1 + data.discountRate, year);
    }
    const terminalNoi = data.initialNOI.amount * Math.pow(1 + data.rentalGrowthRate, data.projectionPeriod + 1);
    const netTerminalValue = (terminalNoi / data.exitCapRate) * (1 - data.exitCosts);
    presentValue += netTerminalValue / Math.pow(1 + data.discountRate, data.projectionPeriod);
    return {
      key: 'dcf', label: 'Discounted Cash Flow', value: this.round(presentValue),
      metadata: { projectionPeriod: data.projectionPeriod, discountRate: data.discountRate, exitCapRate: data.exitCapRate },
    };
  }

  private runScenario(
    scenario: Scenario,
    approaches: readonly CalculatedApproach[],
    config: ValuationConfiguration,
    currency: Money['currency']
  ): ScenarioResult {
    const weights = config.weights[scenario];
    const activeWeight = approaches.reduce((total, approach) => total + weights[approach.key], 0);
    if (activeWeight <= WEIGHT_TOLERANCE) throw new Error(`The ${scenario} scenario has no positive active approach weight.`);
    const multiplier = this.product(Object.values(config.adjustments[scenario]));
    const approachResults = approaches.map((approach) => ({
      approach: approach.label,
      weight: weights[approach.key] / activeWeight,
      value: { amount: this.round(approach.value * multiplier), currency },
      confidence: 0,
      metadata: { ...approach.metadata, scenario, scenarioAdjustmentMultiplier: multiplier },
    } satisfies ValuationApproachResult));
    return {
      value: this.round(approachResults.reduce((total, item) => total + item.value.amount * item.weight, 0)),
      approachResults,
    };
  }

  private buildValuation(
    request: ValuationRequest,
    currency: Money['currency'],
    value: number,
    lowerBound: number,
    upperBound: number,
    approachResults: readonly ValuationApproachResult[]
  ): Valuation {
    const timestamp = request.market.timestamp.asOf;
    const id = this.valuationId(request);
    return {
      id: { id, propertyId: request.property.identity.id, marketSnapshotId: request.market.id, version: ENGINE_VERSION },
      valuationMetadata: { type: 'MARKET_VALUE', propertyType: request.property.classification.type, valuationDate: timestamp, currency: currency.code },
      metadata: {
        id: `metadata:${id}`,
        timestamps: { createdAt: timestamp, updatedAt: timestamp },
        audit: { createdBy: 'ValuationEngine', updatedBy: 'ValuationEngine' },
        version: { version: ENGINE_VERSION, versionedAt: timestamp, versionedBy: 'ValuationEngine' },
        provenance: { source: { id: request.market.id, name: 'Market Snapshot', type: request.market.source }, acquiredAt: timestamp, acquiredBy: 'ValuationEngine' },
        status: { status: 'COMPLETED', category: 'VALUATION', statusChangedAt: timestamp },
      },
      result: {
        value: { amount: value, currency }, lowerBound: { amount: lowerBound, currency }, upperBound: { amount: upperBound, currency },
        rangeWidthPercent: value === 0 ? 0 : this.round(((upperBound - lowerBound) / value) * 100),
        approachResults, methodology: METHODOLOGY_NAME, methodologyVersion: METHODOLOGY_VERSION,
      },
      createdAt: timestamp,
      notes: 'Lower, baseline, and upper scenarios executed under MIAYAAR-METH-001 v1.1.',
    };
  }

  private missingApproachWarnings(type: PropertyType, calculated: readonly CalculatedApproach[]): readonly Warning[] {
    const active = new Set(calculated.map((item) => item.key));
    return this.applicableApproaches(type)
      .filter((key) => !active.has(key))
      .map((key) => this.warning('VAL_WARN_APPROACH_UNAVAILABLE', `The ${key} approach has no sufficient usable prepared data; active weights were re-normalized.`));
  }

  private applicableApproaches(type: PropertyType): readonly ApproachKey[] {
    const values: ApproachKey[] = ['salesComparison'];
    if (this.allowsIncome(type)) values.push('incomeCapitalization');
    if (this.allowsCost(type)) values.push('cost');
    if (this.allowsDcf(type)) values.push('dcf');
    return values;
  }

  private allowsIncome(type: PropertyType): boolean {
    return [PropertyType.APARTMENT, PropertyType.VILLA, PropertyType.TOWNHOUSE, PropertyType.OFFICE, PropertyType.RETAIL].includes(type);
  }

  private allowsCost(type: PropertyType): boolean {
    return [PropertyType.VILLA, PropertyType.TOWNHOUSE, PropertyType.OFFICE, PropertyType.RETAIL].includes(type);
  }

  private allowsDcf(type: PropertyType): boolean {
    return this.allowsIncome(type) || type === PropertyType.LAND;
  }

  private validateConfiguration(config: ValuationConfiguration): string | undefined {
    for (const scenario of ['lower', 'baseline', 'upper'] as const) {
      const weights = Object.values(config.weights[scenario]);
      if (weights.some((value) => !Number.isFinite(value) || value < 0)) return `The ${scenario} scenario has an invalid approach weight.`;
      const total = weights.reduce((sum, value) => sum + value, 0);
      if (Math.abs(total - 1) > WEIGHT_TOLERANCE) return `The ${scenario} scenario weights must sum to 1.0; received ${total}.`;
      if (Object.values(config.adjustments[scenario]).some((value) => !Number.isFinite(value) || value <= 0)) return `The ${scenario} scenario has an invalid adjustment multiplier.`;
    }
    const assumptions = Object.values(config.assumptions);
    if (assumptions.some((value) => !Number.isFinite(value) || value < 0 || value >= 1)) return 'Market assumptions must be decimal rates in [0, 1).';
    if (config.assumptions.capRate <= 0 || config.assumptions.discountRate <= 0) return 'Capitalization and discount rates must be greater than zero.';
    return undefined;
  }

  private resolveCurrency(request: ValuationRequest): Money['currency'] | undefined {
    const money = [
      request.market.prices.pricePerSqm,
      ...(request.data?.comparables?.map((item) => item.salePrice) ?? []),
      request.data?.income?.grossRent, request.data?.cost?.replacementCostPerSqm,
      request.data?.cost?.landValue, request.data?.dcf?.initialNOI,
    ].filter((item): item is Money => Boolean(item));
    const currency = money[0]?.currency;
    return currency && money.every((item) => item.currency.code === currency.code) ? currency : undefined;
  }

  private validComparable(data: ComparableTransaction): boolean {
    return Boolean(data && this.validMoney(data.salePrice) && Number.isFinite(data.area) && data.area > 0 && typeof data.saleDate === 'string' && data.saleDate.length && Object.values(data.adjustments ?? {}).every((value) => Number.isFinite(value) && value > 0));
  }

  private validIncome(data: IncomeData | undefined): data is IncomeData {
    return Boolean(data && this.validMoney(data.grossRent) && this.rate(data.vacancyRate) && this.rate(data.operatingExpenses) && this.rate(data.capRate) && data.capRate > 0);
  }

  private validCost(data: CostData | undefined): data is CostData {
    return Boolean(data && this.validMoney(data.replacementCostPerSqm) && this.rate(data.depreciationFactor) && (!data.landValue || this.validMoney(data.landValue)));
  }

  private validDcf(data: DCFData | undefined): data is DCFData {
    return Boolean(data && this.validMoney(data.initialNOI) && Number.isInteger(data.projectionPeriod) && data.projectionPeriod > 0 && this.rate(data.rentalGrowthRate) && this.rate(data.discountRate) && data.discountRate > 0 && this.rate(data.exitCapRate) && data.exitCapRate > 0 && this.rate(data.exitCosts));
  }

  private validMoney(data: Money | undefined): data is Money {
    return Boolean(data && Number.isFinite(data.amount) && data.amount >= 0 && data.currency?.code);
  }

  private rate(value: number): boolean { return Number.isFinite(value) && value >= 0 && value < 1; }
  private product(values: readonly number[]): number { return values.reduce((total, value) => total * value, 1); }
  private round(value: number): number { return Math.round((value + Number.EPSILON) * 100) / 100; }
  private warning(code: string, message: string): Warning { return { code, message }; }
  private valuationId(request: ValuationRequest): string { return `valuation:${request.property.identity.id}:${request.market.id}:${request.requestId ?? 'default'}`; }

  private resultMetadata(request: ValuationRequest) {
    return { requestId: request.requestId ?? this.valuationId(request), engine: 'ValuationEngine', version: ENGINE_VERSION, timestamp: request.market.timestamp.asOf as Timestamp };
  }

  private unavailable(code: string, message: string, request?: Partial<ValuationRequest>, warnings: readonly Warning[] = []): Result<ValuationOutcome> {
    const error: ErrorInfo = { code, message };
    return {
      status: ResultStatus.ERROR, data: { available: false, reasonCode: code, reason: message }, warnings, errors: [error],
      metadata: { requestId: request?.requestId ?? 'invalid-request', engine: 'ValuationEngine', version: ENGINE_VERSION, timestamp: request?.market?.timestamp?.asOf ?? '1970-01-01T00:00:00.000Z' },
    };
  }
}
