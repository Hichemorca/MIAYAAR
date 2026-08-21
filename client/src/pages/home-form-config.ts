import type { PropertySubmission } from "@shared/valuation/contracts";

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

// The current policy has no approved type-to-field matrix. Keep this empty so
// the UI cannot silently invent a visibility rule for a property type.
export const typeSpecificFieldRules: readonly [] = [];

export function shouldRenderFieldForPropertyType(
  _propertyType: PropertySubmission["propertyType"],
  _fieldKey: string
) {
  return true;
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
