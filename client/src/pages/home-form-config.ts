import type { PropertySubmission } from "@shared/valuation/contracts";
import {
  getApplicableMethods,
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
  landValueAed: "cost",
  depreciationFactor: "cost",
} as const satisfies Readonly<Record<string, ValuationMethod>>;

export type EconomicFieldKey = keyof typeof economicFieldMethod;

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

export function shouldRenderFieldForPropertyType(
  propertyType: PropertySubmission["propertyType"],
  fieldKey: string,
) {
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
