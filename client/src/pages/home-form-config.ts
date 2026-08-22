import type { PropertySubmission } from "@shared/valuation/contracts";
import {
  getApplicableMethods,
  getRequiredFieldsForMethod,
  type ValuationMethod,
} from "@shared/valuation/method-applicability.policy";

export const propertyTypeChoices = [
  { value: "apartment", label: "Apartment", description: "Residential unit" },
  { value: "villa", label: "Villa", description: "Detached residence" },
  { value: "townhouse", label: "Townhouse", description: "Attached residence" },
  { value: "office", label: "Office", description: "Commercial workspace" },
  { value: "retail", label: "Retail", description: "Commercial retail unit" },
  { value: "land", label: "Land", description: "Land parcel" },
  { value: "warehouse", label: "Warehouse", description: "Warehouse asset" },
] as const satisfies readonly {
  value: PropertySubmission["propertyType"];
  label: string;
  description: string;
}[];

export const viewChoices = [
  "sea",
  "partial_sea",
  "city",
  "garden",
  "park",
  "street",
  "internal",
  "unknown",
] as const satisfies readonly PropertySubmission["views"][number][];

export const inputGroups = [
  {
    id: "identity",
    fieldKeys: ["propertyType", "district", "areaSqm", "bedrooms", "yearBuilt"],
  },
  {
    id: "characteristics",
    fieldKeys: [
      "condition",
      "buildingCondition",
      "views",
      "finish",
      "furnished",
      "floor",
      "streetPosition",
    ],
  },
  {
    id: "economic",
    fieldKeys: [
      "annualRentAed",
      "replacementCostPerSqm",
      "landValueAed",
      "depreciationFactor",
    ],
  },
] as const;

export const contractPropertyFields = inputGroups.flatMap(
  group => group.fieldKeys
);

export const economicFieldMethod = {
  annualRentAed: "incomeCapitalization",
  replacementCostPerSqm: "cost",
  depreciationFactor: "cost",
} as const satisfies Readonly<Record<string, ValuationMethod>>;

export type EconomicFieldKey = keyof typeof economicFieldMethod;

/**
 * The public submission fields named by the policy for a method. Server evidence
 * and non-exposed engine inputs remain unavailable in the public form.
 */
export const publicMethodFieldLabels = {
  district: "District",
  areaSqm: "Internal area",
  annualRentAed: "Annual rent",
  replacementCostPerSqm: "Replacement cost",
  depreciationFactor: "Depreciation factor",
} as const satisfies Partial<Record<keyof PropertySubmission, string>>;

/** Server-result labels are fixed by the existing valuation engine. */
export const serverApproachLabels = {
  salesComparison: "Sales Comparison",
  incomeCapitalization: "Income Capitalization",
  cost: "Cost Approach",
  dcf: "Discounted Cash Flow",
} as const satisfies Readonly<Record<ValuationMethod, string>>;

/** The four and only four governed valuation methods. */
export const allValuationMethods = [
  "salesComparison",
  "incomeCapitalization",
  "cost",
  "dcf",
] as const satisfies readonly ValuationMethod[];

export type PresentationReportStatus = "success" | "partial" | "error";

export function getPresentationReportStatus(status: "completed" | "partial" | "rejected"): {
  label: "Success" | "Partial" | "Error";
  tone: PresentationReportStatus;
  description: string;
} {
  if (status === "completed") {
    return {
      label: "Success",
      tone: "success",
      description: "The server completed the valuation report.",
    };
  }

  if (status === "partial") {
    return {
      label: "Partial",
      tone: "partial",
      description: "The server returned a valuation report with warnings.",
    };
  }

  return {
    label: "Error",
    tone: "error",
    description: "The server rejected the valuation report and returned its reason below.",
  };
}

/** Returns a policy fact only; missing calculation reasons remain server-owned. */
export function getMethodNotApplicableExplanation(
  propertyType: PropertySubmission["propertyType"],
  method: ValuationMethod,
): string | undefined {
  if (getApplicableMethods(propertyType).includes(method)) return undefined;

  const propertyTypeLabel = propertyTypeChoices.find(
    choice => choice.value === propertyType,
  )?.label;
  return `${getServerApproachLabel(method)} is not applicable to ${propertyTypeLabel ?? propertyType} under the governed method policy.`;
}

export type PublicMethodFieldKey = keyof typeof publicMethodFieldLabels;

function isPublicMethodFieldKey(fieldKey: string): fieldKey is PublicMethodFieldKey {
  return fieldKey in publicMethodFieldLabels;
}

export function getPublicMethodFields(
  method: ValuationMethod,
): readonly PublicMethodFieldKey[] {
  return getRequiredFieldsForMethod(method)
    .filter(
      field =>
        field.source === "submission" &&
        field.publicInputStatus === "supported" &&
        isPublicMethodFieldKey(field.key),
    )
    .map(field => field.key as PublicMethodFieldKey);
}

export function getApplicableMethodFields(
  propertyType: PropertySubmission["propertyType"],
): readonly Readonly<{
  method: ValuationMethod;
  fieldKeys: readonly PublicMethodFieldKey[];
}>[] {
  return getApplicableMethods(propertyType).map(method => ({
    method,
    fieldKeys: getPublicMethodFields(method),
  }));
}

export function getApplicableMethodPresentation(
  propertyType: PropertySubmission["propertyType"],
) {
  return getApplicableMethodFields(propertyType);
}

export function getServerApproachLabel(method: ValuationMethod): string {
  return serverApproachLabels[method];
}

export function findServerApproachResult<T extends { readonly approach: string }>(
  approachResults: readonly T[],
  method: ValuationMethod,
): T | undefined {
  return approachResults.find(
    approach => approach.approach === getServerApproachLabel(method),
  );
}

/** §4-driven UI visibility: an economic input is visible only with its method. */
export const typeSpecificFieldRules = propertyTypeChoices.map(({ value }) => ({
  propertyType: value,
  applicableMethods: getApplicableMethods(value),
  visibleEconomicFields: Object.entries(economicFieldMethod)
    .filter(([, method]) => getApplicableMethods(value).includes(method))
    .map(([fieldKey]) => fieldKey as EconomicFieldKey),
})) as readonly {
  propertyType: PropertySubmission["propertyType"];
  applicableMethods: readonly ValuationMethod[];
  visibleEconomicFields: readonly EconomicFieldKey[];
}[];

export function getVisibleEconomicFields(
  propertyType: PropertySubmission["propertyType"],
): readonly EconomicFieldKey[] {
  return typeSpecificFieldRules.find(rule => rule.propertyType === propertyType)?.visibleEconomicFields ?? [];
}

/**
 * Keeps only economic values that are supported by an approach applicable to
 * the next property type. General property facts are intentionally retained:
 * no approved type-specific rule declares them invalid.
 */
export function clearInapplicableEconomicInputs(
  current: PropertySubmission,
  propertyType: PropertySubmission["propertyType"],
): PropertySubmission {
  const visibleFields = getVisibleEconomicFields(propertyType);

  return {
    ...current,
    propertyType,
    annualRentAed: visibleFields.includes("annualRentAed")
      ? current.annualRentAed
      : undefined,
    replacementCostPerSqm: visibleFields.includes("replacementCostPerSqm")
      ? current.replacementCostPerSqm
      : undefined,
    // This retained contract field has no §4–§5 public-method mapping.
    landValueAed: undefined,
    depreciationFactor: visibleFields.includes("depreciationFactor")
      ? current.depreciationFactor
      : undefined,
  };
}

export function shouldRenderFieldForPropertyType(
  propertyType: PropertySubmission["propertyType"],
  fieldKey: string,
) {
  // The existing contract retains this optional field, but §4–§5 assign it to
  // no method; it is deliberately absent from the policy-driven public form.
  if (fieldKey === "landValueAed") return false;
  if (!(fieldKey in economicFieldMethod)) return true;
  return getVisibleEconomicFields(propertyType).includes(fieldKey as EconomicFieldKey);
}

export function toggleViewSelection(
  current: PropertySubmission["views"],
  view: PropertySubmission["views"][number]
) {
  if (current.includes(view)) {
    return current.length === 1
      ? current
      : current.filter(selected => selected !== view);
  }

  return current.length >= 5 ? current : [...current, view];
}
