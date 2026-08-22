/**
 * Canonical MIAYAAR valuation engine.
 *
 * The engine produces only the immutable core `Valuation` entity and the
 * platform `Result<T>` envelope. Calculation policy that is still awaiting a
 * formal methodology decision is isolated in named `PROVISIONAL` helpers so it
 * cannot be mistaken for an approved methodology rule.
 */

import { randomUUID } from 'node:crypto';
import { IEngine } from '../../core/contracts';
import { ErrorInfo, Result, ResultStatus, Warning } from '../../core/results';
import {
  Currency,
  Metadata,
  Money,
  Property,
  PropertyType,
  Timestamp,
  Valuation,
  ValuationApproachResult,
} from '../../core/types';
import {
  AdjustmentFactorSet,
  ComparableTransaction,
  CostData,
  DCFData,
  IncomeData,
  ValuationConfiguration,
  ValuationData,
  ValuationOutcome,
  ValuationRequest,
} from './types';
import { METHODOLOGY_DOCUMENT_ID, METHODOLOGY_VERSION } from './methodology-v1_2';
import { getApplicableMethodsForCanonicalPropertyType } from '../../shared/valuation/method-applicability.policy';

type Scenario = 'lower' | 'baseline' | 'upper';
type ApproachKey = 'salesComparison' | 'incomeCapitalization' | 'cost' | 'dcf';

interface ApproachCalculation {
  readonly key: ApproachKey;
  readonly label: string;
  readonly value: Money;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly provisional: boolean;
}

interface ScenarioValuation {
  readonly total: Money;
  readonly approaches: readonly ValuationApproachResult[];
}

const SCENARIOS: readonly Scenario[] = ['lower', 'baseline', 'upper'];
const ENGINE_VERSION = '1.1.0';

const roundMoney = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;
const isFiniteRate = (value: number): boolean => Number.isFinite(value) && value >= 0 && value < 1;
const isPositiveRate = (value: number): boolean => Number.isFinite(value) && value > 0 && value < 1;
const isUsableMoney = (money: Money | undefined): money is Money =>
  Boolean(money && Number.isFinite(money.amount) && money.amount >= 0 && money.currency?.code);

function makeMoney(amount: number, currency: Currency): Money {
  return { amount: roundMoney(amount), currency };
}

function sameCurrency(left: Money, right: Money): boolean {
  return left.currency.code === right.currency.code;
}

function adjustmentProduct(adjustments: ComparableTransaction['adjustments']): number {
  if (!adjustments) return 1;
  const values = Object.values(adjustments);
  return values.every(value => typeof value === 'number' && Number.isFinite(value) && value > 0)
    ? values.reduce((product, value) => product * value, 1)
    : Number.NaN;
}

/**
 * PROVISIONAL — CALC-014: adjustment ordering and exact comparable treatment
 * have not been formally approved. The legacy behavior multiplies supplied
 * comparable adjustments and averages adjusted price per square metre.
 */
function applyProvisionalComparableAdjustment(comparable: ComparableTransaction): number | undefined {
  if (!isUsableMoney(comparable.salePrice) || comparable.salePrice.amount <= 0 || !Number.isFinite(comparable.area) || comparable.area <= 0) {
    return undefined;
  }
  const factor = adjustmentProduct(comparable.adjustments);
  if (!Number.isFinite(factor)) return undefined;
  return (comparable.salePrice.amount / comparable.area) * factor;
}

function calculateSalesComparison(data: ValuationData | undefined, property: Property): ApproachCalculation | undefined {
  const comparables = data?.comparables ?? [];
  const usable = comparables
    .map(comparable => ({ comparable, adjustedPricePerSqm: applyProvisionalComparableAdjustment(comparable) }))
    .filter((item): item is { comparable: ComparableTransaction; adjustedPricePerSqm: number } => item.adjustedPricePerSqm !== undefined);

  if (!usable.length || !Number.isFinite(property.physical.totalArea) || property.physical.totalArea <= 0) return undefined;
  const currency = usable[0].comparable.salePrice.currency;
  if (usable.some(item => item.comparable.salePrice.currency.code !== currency.code)) return undefined;

  const averagePricePerSqm = usable.reduce((total, item) => total + item.adjustedPricePerSqm, 0) / usable.length;
  return {
    key: 'salesComparison',
    label: 'Sales Comparison',
    value: makeMoney(averagePricePerSqm * property.physical.totalArea, currency),
    metadata: {
      comparableCount: usable.length,
      statistic: 'arithmeticMeanAdjustedPricePerSqm',
      adjustedPricePerSqm: roundMoney(averagePricePerSqm),
      adjustmentPolicy: 'PROVISIONAL_CALC-014',
    },
    provisional: true,
  };
}

/** PROVISIONAL — CALC-008: NOI definition is retained from the legacy engine pending formal approval. */
function calculateIncomeCapitalization(data: IncomeData | undefined): ApproachCalculation | undefined {
  if (!data || !isUsableMoney(data.grossRent) || data.grossRent.amount <= 0 || !isFiniteRate(data.vacancyRate) || !isFiniteRate(data.operatingExpenses) || !isPositiveRate(data.capRate)) {
    return undefined;
  }
  const netOperatingIncome = data.grossRent.amount * (1 - data.vacancyRate) * (1 - data.operatingExpenses);
  return {
    key: 'incomeCapitalization',
    label: 'Income Capitalization',
    value: makeMoney(netOperatingIncome / data.capRate, data.grossRent.currency),
    metadata: {
      netOperatingIncome: roundMoney(netOperatingIncome),
      vacancyRate: data.vacancyRate,
      operatingExpenses: data.operatingExpenses,
      capRate: data.capRate,
      policy: 'PROVISIONAL_CALC-008',
    },
    provisional: true,
  };
}

/** PROVISIONAL — CALC-009: cost composition is retained from the legacy engine pending formal approval. */
function calculateCostApproach(data: CostData | undefined, property: Property): ApproachCalculation | undefined {
  if (!data || !isUsableMoney(data.replacementCostPerSqm) || data.replacementCostPerSqm.amount <= 0 || !isFiniteRate(data.depreciationFactor) || !Number.isFinite(property.physical.totalArea) || property.physical.totalArea <= 0) {
    return undefined;
  }
  if (data.landValue && (!isUsableMoney(data.landValue) || !sameCurrency(data.replacementCostPerSqm, data.landValue))) return undefined;

  const replacementCost = property.physical.totalArea * data.replacementCostPerSqm.amount;
  const depreciatedBuildingValue = replacementCost * (1 - data.depreciationFactor);
  const landValue = data.landValue?.amount ?? 0;
  return {
    key: 'cost',
    label: 'Cost Approach',
    value: makeMoney(depreciatedBuildingValue + landValue, data.replacementCostPerSqm.currency),
    metadata: {
      replacementCost: roundMoney(replacementCost),
      depreciationFactor: data.depreciationFactor,
      landValue: roundMoney(landValue),
      policy: 'PROVISIONAL_CALC-009',
    },
    provisional: true,
  };
}

/**
 * PROVISIONAL — CALC-010 and CALC-011: the terminal-value and discounting
 * conventions require methodology approval. The prior deterministic model is
 * kept intact and explicitly labelled until that decision is made.
 */
function calculateDiscountedCashFlow(data: DCFData | undefined): ApproachCalculation | undefined {
  if (!data || !isUsableMoney(data.initialNOI) || data.initialNOI.amount <= 0 || !Number.isInteger(data.projectionPeriod) || data.projectionPeriod <= 0 || !isFiniteRate(data.rentalGrowthRate) || !isPositiveRate(data.discountRate) || !isPositiveRate(data.exitCapRate) || !isFiniteRate(data.exitCosts)) {
    return undefined;
  }

  let presentValue = 0;
  for (let year = 1; year <= data.projectionPeriod; year += 1) {
    const cashFlow = data.initialNOI.amount * Math.pow(1 + data.rentalGrowthRate, year);
    presentValue += cashFlow / Math.pow(1 + data.discountRate, year);
  }
  const terminalNOI = data.initialNOI.amount * Math.pow(1 + data.rentalGrowthRate, data.projectionPeriod + 1);
  const terminalValue = (terminalNOI / data.exitCapRate) * (1 - data.exitCosts);
  presentValue += terminalValue / Math.pow(1 + data.discountRate, data.projectionPeriod);

  return {
    key: 'dcf',
    label: 'Discounted Cash Flow',
    value: makeMoney(presentValue, data.initialNOI.currency),
    metadata: {
      projectionPeriod: data.projectionPeriod,
      rentalGrowthRate: data.rentalGrowthRate,
      discountRate: data.discountRate,
      exitCapRate: data.exitCapRate,
      exitCosts: data.exitCosts,
      terminalValue: roundMoney(terminalValue),
      policy: 'PROVISIONAL_CALC-010_CALC-011',
    },
    provisional: true,
  };
}

/**
 * PROVISIONAL — CALC-012/CALC-013: the adjustment aggregation and missing
 * approach reweighting rule are not approved. This preserves the previous
 * normalized-active-weight behavior and makes that policy visible in metadata.
 */
function applyProvisionalScenarioAdjustment(value: Money, factors: AdjustmentFactorSet): Money {
  const values = Object.values(factors);
  const multiplier = values.every(factor => typeof factor === 'number' && Number.isFinite(factor) && factor > 0)
    ? values.reduce((product, factor) => product * factor, 1)
    : 1;
  return makeMoney(value.amount * multiplier, value.currency);
}

function aggregateWithProvisionalWeights(
  scenario: Scenario,
  calculations: readonly ApproachCalculation[],
  configuration: ValuationConfiguration,
): ScenarioValuation | undefined {
  const weights = configuration.weights[scenario];
  const activeWeight = calculations.reduce((total, calculation) => total + weights[calculation.key], 0);
  if (!Number.isFinite(activeWeight) || activeWeight <= 0) return undefined;

  const adjusted = calculations.map(calculation => {
    const weight = weights[calculation.key] / activeWeight;
    const value = applyProvisionalScenarioAdjustment(calculation.value, configuration.adjustments[scenario]);
    return {
      approach: calculation.label,
      weight,
      value,
      confidence: Math.min(1, calculations.length / 4),
      metadata: { ...calculation.metadata, scenario, normalizedActiveWeight: true, aggregationPolicy: 'PROVISIONAL_CALC-012_CALC-013' },
    } satisfies ValuationApproachResult;
  });

  const currency = adjusted[0].value.currency;
  if (adjusted.some(item => item.value.currency.code !== currency.code)) return undefined;
  const total = adjusted.reduce((sum, item) => sum + item.value.amount * item.weight, 0);
  return { total: makeMoney(total, currency), approaches: adjusted };
}

function configurationIsValid(configuration: ValuationConfiguration): boolean {
  return SCENARIOS.every(scenario => {
    const weights = Object.values(configuration.weights[scenario]);
    const factors = Object.values(configuration.adjustments[scenario]);
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
    return weights.every(weight => Number.isFinite(weight) && weight >= 0)
      && Math.abs(weightTotal - 1) < 0.000001
      && factors.every(factor => Number.isFinite(factor) && factor > 0);
  });
}

export class ValuationEngine implements IEngine<ValuationRequest, ValuationOutcome> {
  async execute(request: ValuationRequest): Promise<Result<ValuationOutcome>> {
    if (!request.property || !request.market) {
      return this.buildUnavailableResult('VAL_ERR_INVALID_REQUEST', 'Invalid request: property and market are required.', request.requestId);
    }
    if (request.property.classification.type === PropertyType.WAREHOUSE) {
      return this.buildUnavailableResult('VAL_ERR_UNSUPPORTED_PROPERTY_TYPE', 'Warehouse valuation is unsupported until a formally approved methodology configuration is available.', request.requestId);
    }
    if (!configurationIsValid(request.config)) {
      return this.buildUnavailableResult('VAL_ERR_INVALID_CONFIGURATION', 'The injected valuation configuration is structurally invalid.', request.requestId);
    }

    const applicableMethods = getApplicableMethodsForCanonicalPropertyType(request.property.classification.type);
    const calculations = [
      applicableMethods.includes('salesComparison') ? calculateSalesComparison(request.data, request.property) : undefined,
      applicableMethods.includes('incomeCapitalization') ? calculateIncomeCapitalization(request.data?.income) : undefined,
      applicableMethods.includes('cost') ? calculateCostApproach(request.data?.cost, request.property) : undefined,
      applicableMethods.includes('dcf') ? calculateDiscountedCashFlow(request.data?.dcf) : undefined,
    ].filter((calculation): calculation is ApproachCalculation => calculation !== undefined);

    if (!calculations.length) {
      return this.buildUnavailableResult('VAL_ERR_INSUFFICIENT_APPROACH_DATA', 'No valuation approach has structurally valid monetary input data.', request.requestId);
    }

    const scenarios = Object.fromEntries(
      SCENARIOS.map(scenario => [scenario, aggregateWithProvisionalWeights(scenario, calculations, request.config)]),
    ) as Record<Scenario, ScenarioValuation | undefined>;
    if (!scenarios.lower || !scenarios.baseline || !scenarios.upper) {
      return this.buildUnavailableResult('VAL_ERR_UNUSABLE_APPROACH_WEIGHTS', 'Active approaches cannot be aggregated with the supplied scenario weights.', request.requestId);
    }

    const warnings = this.buildWarnings(calculations, applicableMethods);
    const valuation = this.buildValuation(request, {
      lower: scenarios.lower,
      baseline: scenarios.baseline,
      upper: scenarios.upper,
    }, warnings);
    return {
      status: this.determineProvisionalResultStatus(warnings),
      data: { available: true, valuation },
      warnings,
      errors: [],
      metadata: this.buildResultMetadata(request.requestId),
    };
  }

  /** PROVISIONAL — CALC-016: success versus partial policy is not yet approved. */
  private determineProvisionalResultStatus(warnings: readonly Warning[]): ResultStatus {
    return warnings.length > 0 ? ResultStatus.PARTIAL : ResultStatus.SUCCESS;
  }

  private buildWarnings(
    calculations: readonly ApproachCalculation[],
    applicableMethods: readonly ApproachKey[],
  ): readonly Warning[] {
    const available = new Set(calculations.map(calculation => calculation.key));
    const warnings: Warning[] = applicableMethods
      .filter(key => !available.has(key))
      .map(key => ({ code: 'VAL_WARN_APPROACH_UNAVAILABLE', message: `${key} is unavailable because its input data is absent, invalid, or incompatible.` }));

    if (calculations.some(calculation => calculation.provisional)) {
      warnings.push({
        code: 'VAL_WARN_PROVISIONAL_POLICY',
        message: 'The completed valuation applies explicitly labelled provisional calculation rules pending methodology approval (CALC-008, CALC-009, CALC-010, CALC-011, CALC-012, CALC-013, CALC-014, CALC-016).',
      });
    }
    return warnings;
  }

  private buildValuation(
    request: ValuationRequest,
    scenarios: Record<Scenario, ScenarioValuation>,
    warnings: readonly Warning[],
  ): Valuation {
    // The valuation event and the technical record audit lifecycle are
    // represented independently. They may be close in time for this in-memory
    // execution, but neither field is a substitute for the other.
    const valuationTimestamp = new Date().toISOString() as Timestamp;
    const auditTimestamp = new Date().toISOString() as Timestamp;
    const requestId = request.requestId ?? randomUUID();
    const baseline = scenarios.baseline;
    const rangeWidthPercent = baseline.total.amount === 0
      ? undefined
      : roundMoney(((scenarios.upper.total.amount - scenarios.lower.total.amount) / baseline.total.amount) * 100);
    return {
      id: {
        id: `valuation:${requestId}`,
        propertyId: request.property.identity.id,
        marketSnapshotId: request.market.id,
        version: ENGINE_VERSION,
      },
      valuationMetadata: {
        type: 'EVIDENCE_LED_PROVISIONAL',
        propertyType: request.property.classification.type,
        valuationDate: valuationTimestamp,
        purpose: 'MIAYAAR evidence-led property valuation',
        currency: baseline.total.currency.code,
      },
      metadata: this.buildValuationMetadata(requestId, auditTimestamp),
      result: {
        value: baseline.total,
        lowerBound: scenarios.lower.total,
        upperBound: scenarios.upper.total,
        rangeWidthPercent,
        approachResults: baseline.approaches,
        methodology: METHODOLOGY_DOCUMENT_ID,
        methodologyVersion: METHODOLOGY_VERSION,
      },
      notes: warnings.map(warning => `${warning.code}: ${warning.message}`).join(' '),
    };
  }

  private buildUnavailableResult(code: string, message: string, requestId?: string): Result<ValuationOutcome> {
    const error: ErrorInfo = { code, message };
    return {
      status: ResultStatus.ERROR,
      data: { available: false, reasonCode: code, reason: message },
      warnings: [],
      errors: [error],
      metadata: this.buildResultMetadata(requestId),
    };
  }

  private buildResultMetadata(requestId?: string) {
    return {
      requestId: requestId ?? randomUUID(),
      engine: 'MIAYAAR.ValuationEngine',
      version: ENGINE_VERSION,
      timestamp: new Date().toISOString() as Timestamp,
    };
  }

  private buildValuationMetadata(requestId: string, timestamp: Timestamp): Metadata {
    return {
      id: `valuation-metadata:${requestId}`,
      timestamps: { createdAt: timestamp, updatedAt: timestamp },
      audit: { createdBy: 'engine:valuation', updatedBy: 'engine:valuation' },
      version: { version: ENGINE_VERSION, versionedAt: timestamp, versionedBy: 'engine:valuation', changeDescription: 'Created by the canonical valuation engine.' },
      provenance: {
        source: { id: METHODOLOGY_DOCUMENT_ID, name: 'MIAYAAR frozen valuation methodology', type: 'METHODOLOGY', version: METHODOLOGY_VERSION },
        acquiredAt: timestamp,
        acquiredBy: 'engine:valuation',
        pipelineVersion: ENGINE_VERSION,
      },
      status: { status: 'COMPLETED', category: 'VALUATION', statusChangedAt: timestamp },
    };
  }
}
