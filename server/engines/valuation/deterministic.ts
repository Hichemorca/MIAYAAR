import type { ComparableEvidence } from "../../valuation/evidence.contracts";
import type { ApproachWeights, MarketAssumptions, MethodologyConfiguration, PropertySubmission, Scenario } from "@shared/valuation/contracts";

const scenarios: readonly Scenario[] = ["lower", "baseline", "upper"];
type ApproachKey = keyof ApproachWeights;

export type ApproachOutput = {
  key: ApproachKey;
  label: string;
  unadjustedValue: number;
  adjustedValue: number;
  normalizedWeight: number;
  metadata: Record<string, number | string>;
};

export type DeterministicValuation = {
  scenarios: Record<Scenario, { value: number; approaches: ApproachOutput[] }>;
  warnings: string[];
};

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;
const isResidential = (type: PropertySubmission["propertyType"]) => ["apartment", "villa", "townhouse"].includes(type);
const supportsIncome = (type: PropertySubmission["propertyType"]) => ["apartment", "villa", "townhouse", "office", "retail"].includes(type);
const supportsCost = (type: PropertySubmission["propertyType"]) => ["villa", "townhouse", "office", "retail"].includes(type);

function salesComparison(comparables: readonly ComparableEvidence[], areaSqm: number) {
  return {
    key: "salesComparison" as const,
    label: "Sales Comparison",
    value: mean(comparables.map(item => item.timeAdjustedPricePerSqm)) * areaSqm,
    metadata: { comparableCount: comparables.length, statistic: "arithmeticMeanTimeAdjustedPricePerSqm" },
  };
}

function incomeCapitalization(property: PropertySubmission, assumptions: MarketAssumptions) {
  if (!supportsIncome(property.propertyType) || !property.annualRentAed || property.annualRentAed <= 0) return undefined;
  const capRate = isResidential(property.propertyType) ? assumptions.residentialCapRate : assumptions.commercialCapRate;
  const noi = property.annualRentAed * (1 - assumptions.vacancyRate) * (1 - assumptions.operatingExpenseRate);
  return { key: "incomeCapitalization" as const, label: "Income Capitalization", value: noi / capRate, metadata: { netOperatingIncome: round(noi), capRate } };
}

function costApproach(property: PropertySubmission) {
  if (!supportsCost(property.propertyType) || !property.replacementCostPerSqm || property.replacementCostPerSqm <= 0) return undefined;
  const depreciation = property.depreciationFactor ?? 0;
  if (depreciation < 0 || depreciation >= 1) return undefined;
  const buildingValue = property.areaSqm * property.replacementCostPerSqm * (1 - depreciation);
  return { key: "cost" as const, label: "Cost Approach", value: buildingValue + (property.landValueAed ?? 0), metadata: { buildingValue: round(buildingValue), landValue: property.landValueAed ?? 0, depreciation } };
}

function dcf(property: PropertySubmission, assumptions: MarketAssumptions) {
  if (!supportsIncome(property.propertyType) || !property.annualRentAed || property.annualRentAed <= 0) return undefined;
  const initialNoi = property.annualRentAed * (1 - assumptions.vacancyRate) * (1 - assumptions.operatingExpenseRate);
  const period = 10;
  let presentValue = 0;
  for (let year = 1; year <= period; year += 1) presentValue += initialNoi * Math.pow(1 + assumptions.rentGrowthRate, year) / Math.pow(1 + assumptions.discountRate, year);
  const exitCapRate = isResidential(property.propertyType) ? assumptions.residentialCapRate : assumptions.commercialCapRate;
  const terminalNoi = initialNoi * Math.pow(1 + assumptions.rentGrowthRate, period + 1);
  presentValue += (terminalNoi / exitCapRate) * (1 - assumptions.exitCostRate) / Math.pow(1 + assumptions.discountRate, period);
  return { key: "dcf" as const, label: "Discounted Cash Flow", value: presentValue, metadata: { projectionPeriod: period, discountRate: assumptions.discountRate, exitCapRate } };
}

/** Pure valuation engine: prepared evidence and frozen configuration in, no I/O. */
export function calculateDeterministicValuation(input: {
  property: PropertySubmission;
  comparables: readonly ComparableEvidence[];
  configuration: MethodologyConfiguration;
  scenarioMultipliers: Record<Scenario, number>;
}): DeterministicValuation {
  const rawApproaches = [
    salesComparison(input.comparables, input.property.areaSqm),
    incomeCapitalization(input.property, input.configuration.assumptions),
    costApproach(input.property),
    dcf(input.property, input.configuration.assumptions),
  ].filter(Boolean) as Array<{ key: ApproachKey; label: string; value: number; metadata: Record<string, number | string> }>;
  const warnings = (["incomeCapitalization", "cost", "dcf"] as const)
    .filter(key => !rawApproaches.some(approach => approach.key === key))
    .map(key => `${key} is unavailable because its prepared input is absent or not applicable.`);

  const output = {} as DeterministicValuation["scenarios"];
  for (const scenario of scenarios) {
    const weights = input.configuration.weights[input.property.propertyType][scenario];
    const activeWeight = rawApproaches.reduce((total, approach) => total + weights[approach.key], 0);
    if (activeWeight <= 0) throw new Error(`No active approach weights are available for the ${scenario} scenario.`);
    const approaches = rawApproaches.map(approach => ({
      key: approach.key,
      label: approach.label,
      unadjustedValue: round(approach.value),
      adjustedValue: round(approach.value * input.scenarioMultipliers[scenario]),
      normalizedWeight: weights[approach.key] / activeWeight,
      metadata: { ...approach.metadata, scenarioMultiplier: input.scenarioMultipliers[scenario] },
    }));
    output[scenario] = { value: round(approaches.reduce((total, approach) => total + approach.adjustedValue * approach.normalizedWeight, 0)), approaches };
  }
  return { scenarios: output, warnings };
}
