import type { PropertyType } from "../../shared/valuation/contracts";

/**
 * The single server-side source of truth for mapping source labels to MIAYAAR
 * property types.  It deliberately classifies only; it never alters raw DLD
 * labels or evidence values.
 */
const typeDictionary: ReadonlyArray<{ propertyType: PropertyType; terms: readonly string[] }> = [
  { propertyType: "apartment", terms: ["APARTMENT", "UNIT", "FLAT"] },
  { propertyType: "villa", terms: ["VILLA"] },
  { propertyType: "townhouse", terms: ["TOWNHOUSE"] },
  { propertyType: "office", terms: ["OFFICE"] },
  { propertyType: "retail", terms: ["RETAIL", "SHOP"] },
  { propertyType: "warehouse", terms: ["WAREHOUSE"] },
  { propertyType: "land", terms: ["LAND", "PLOT"] },
];

function canonicalText(...values: (string | null | undefined)[]) {
  return values.filter(Boolean).join(" ").trim().toUpperCase();
}

/**
 * Maps a source type/subtype to the canonical type without discarding either
 * source field.  The primary type has priority, preserving current import
 * behaviour; subtype is a fallback for source records with incomplete types.
 */
export function classifyPropertyType(rawType: string, rawSubType: string | null): PropertyType | undefined {
  const primaryText = canonicalText(rawType);
  const primaryMatch = typeDictionary.find(entry => entry.terms.some(term => primaryText.includes(term)));
  if (primaryMatch) return primaryMatch.propertyType;

  const text = canonicalText(rawType, rawSubType);
  return typeDictionary.find(entry => entry.terms.some(term => text.includes(term)))?.propertyType;
}
