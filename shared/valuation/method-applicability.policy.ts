import { PropertyType as CanonicalPropertyType } from "../../core/types";
import type { PropertySubmission, Scenario } from "./contracts";

/**
 * Governing source: MIAYAAR-METH-001, §§4–5.
 *
 * This policy expresses only method applicability, the official §5 weights,
 * and the input contract each existing method calculation consumes. It does
 * not define calculation formulae, thresholds, fallback rules, or new inputs.
 */
export type ValuationMethod =
  | "salesComparison"
  | "incomeCapitalization"
  | "cost"
  | "dcf";

export type GovernedPropertyType = PropertySubmission["propertyType"];

export type OfficialMethodWeights = Readonly<Record<ValuationMethod, number>>;
export type OfficialScenarioWeights = Readonly<
  Record<Scenario, OfficialMethodWeights>
>;

export type MethodRequiredField = Readonly<{
  key: string;
  source: "submission" | "server-evidence" | "engine-input";
  publicInputStatus: "supported" | "not-exposed";
}>;

const ALL_METHODS = [
  "salesComparison",
  "incomeCapitalization",
  "cost",
  "dcf",
] as const;

/** Exact method applicability from §4.1–§4.4. */
export const applicableMethodsByPropertyType = {
  apartment: ["salesComparison", "incomeCapitalization", "dcf"],
  villa: ALL_METHODS,
  townhouse: ALL_METHODS,
  office: ALL_METHODS,
  retail: ALL_METHODS,
  land: ["salesComparison", "dcf"],
  warehouse: ["salesComparison"],
} as const satisfies Readonly<
  Record<GovernedPropertyType, readonly ValuationMethod[]>
>;

/**
 * Exact values transcribed from §5. Warehouse is intentionally absent because
 * §5 publishes no warehouse allocation; v1.2 continues to reject it for lack
 * of a formally approved configuration.
 */
export const officialWeightsByPropertyType: Readonly<
  Partial<Record<GovernedPropertyType, OfficialScenarioWeights>>
> = {
  apartment: {
    lower: {
      salesComparison: 0.48,
      incomeCapitalization: 0.37,
      cost: 0.1,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.5,
      incomeCapitalization: 0.35,
      cost: 0.1,
      dcf: 0.05,
    },
    upper: {
      salesComparison: 0.52,
      incomeCapitalization: 0.33,
      cost: 0.1,
      dcf: 0.05,
    },
  },
  villa: {
    lower: {
      salesComparison: 0.43,
      incomeCapitalization: 0.22,
      cost: 0.3,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.45,
      incomeCapitalization: 0.2,
      cost: 0.3,
      dcf: 0.05,
    },
    upper: {
      salesComparison: 0.47,
      incomeCapitalization: 0.18,
      cost: 0.3,
      dcf: 0.05,
    },
  },
  townhouse: {
    lower: {
      salesComparison: 0.43,
      incomeCapitalization: 0.27,
      cost: 0.25,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.45,
      incomeCapitalization: 0.25,
      cost: 0.25,
      dcf: 0.05,
    },
    upper: {
      salesComparison: 0.47,
      incomeCapitalization: 0.23,
      cost: 0.25,
      dcf: 0.05,
    },
  },
  office: {
    lower: {
      salesComparison: 0.38,
      incomeCapitalization: 0.47,
      cost: 0.1,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.4,
      incomeCapitalization: 0.45,
      cost: 0.1,
      dcf: 0.05,
    },
    upper: {
      salesComparison: 0.42,
      incomeCapitalization: 0.43,
      cost: 0.1,
      dcf: 0.05,
    },
  },
  retail: {
    lower: {
      salesComparison: 0.33,
      incomeCapitalization: 0.52,
      cost: 0.1,
      dcf: 0.05,
    },
    baseline: {
      salesComparison: 0.35,
      incomeCapitalization: 0.5,
      cost: 0.1,
      dcf: 0.05,
    },
    upper: {
      salesComparison: 0.37,
      incomeCapitalization: 0.48,
      cost: 0.1,
      dcf: 0.05,
    },
  },
  land: {
    lower: {
      salesComparison: 0.78,
      incomeCapitalization: 0,
      cost: 0,
      dcf: 0.22,
    },
    baseline: {
      salesComparison: 0.8,
      incomeCapitalization: 0,
      cost: 0,
      dcf: 0.2,
    },
    upper: {
      salesComparison: 0.82,
      incomeCapitalization: 0,
      cost: 0,
      dcf: 0.18,
    },
  },
};

/**
 * The source map documents only existing calculation inputs. DCF's complete
 * engine contract is not present in PropertySubmission, so it cannot be made a
 * client-side requirement or silently constructed by the adapter.
 */
export const requiredFieldsByMethod = {
  salesComparison: [
    { key: "district", source: "submission", publicInputStatus: "supported" },
    { key: "areaSqm", source: "submission", publicInputStatus: "supported" },
    {
      key: "eligibleComparableEvidence",
      source: "server-evidence",
      publicInputStatus: "not-exposed",
    },
  ],
  incomeCapitalization: [
    {
      key: "annualRentAed",
      source: "submission",
      publicInputStatus: "supported",
    },
  ],
  cost: [
    {
      key: "replacementCostPerSqm",
      source: "submission",
      publicInputStatus: "supported",
    },
    {
      key: "depreciationFactor",
      source: "submission",
      publicInputStatus: "supported",
    },
  ],
  dcf: [
    {
      key: "initialNOI",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
    {
      key: "projectionPeriod",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
    {
      key: "rentalGrowthRate",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
    {
      key: "discountRate",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
    {
      key: "exitCapRate",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
    {
      key: "exitCosts",
      source: "engine-input",
      publicInputStatus: "not-exposed",
    },
  ],
} as const satisfies Readonly<
  Record<ValuationMethod, readonly MethodRequiredField[]>
>;

const canonicalToSubmissionPropertyType: Readonly<
  Record<CanonicalPropertyType, GovernedPropertyType>
> = {
  [CanonicalPropertyType.APARTMENT]: "apartment",
  [CanonicalPropertyType.VILLA]: "villa",
  [CanonicalPropertyType.TOWNHOUSE]: "townhouse",
  [CanonicalPropertyType.OFFICE]: "office",
  [CanonicalPropertyType.RETAIL]: "retail",
  [CanonicalPropertyType.LAND]: "land",
  [CanonicalPropertyType.WAREHOUSE]: "warehouse",
};

export function getApplicableMethods(
  propertyType: GovernedPropertyType
): readonly ValuationMethod[] {
  return applicableMethodsByPropertyType[propertyType];
}

export function getApplicableMethodsForCanonicalPropertyType(
  propertyType: CanonicalPropertyType
): readonly ValuationMethod[] {
  return getApplicableMethods(canonicalToSubmissionPropertyType[propertyType]);
}

export function isMethodApplicable(
  propertyType: GovernedPropertyType,
  method: ValuationMethod
): boolean {
  return getApplicableMethods(propertyType).includes(method);
}

export function getOfficialWeights(
  propertyType: GovernedPropertyType
): OfficialScenarioWeights | undefined {
  return officialWeightsByPropertyType[propertyType];
}

export function getRequiredFieldsForMethod(
  method: ValuationMethod
): readonly MethodRequiredField[] {
  return requiredFieldsByMethod[method];
}

export function getRequiredSubmissionFieldsForMethod(
  method: ValuationMethod
): readonly (keyof PropertySubmission)[] {
  return getRequiredFieldsForMethod(method)
    .filter(field => field.source === "submission")
    .map(field => field.key as keyof PropertySubmission);
}
