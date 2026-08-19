import type { PropertyType } from "../../shared/valuation/contracts";
import type { NormalizedEvidence, RawDldTransaction, RejectionReason } from "./evidence.contracts";

const maxUnitPriceAed = 50_000;
const maxPriceAed = 50_000_000;

const typeDictionary: ReadonlyArray<{ propertyType: PropertyType; terms: string[] }> = [
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

export function classifyPropertyType(rawType: string, rawSubType: string | null): PropertyType | undefined {
  const primaryText = canonicalText(rawType);
  const primaryMatch = typeDictionary.find(entry => entry.terms.some(term => primaryText.includes(term)));
  if (primaryMatch) return primaryMatch.propertyType;

  const text = canonicalText(rawType, rawSubType);
  return typeDictionary.find(entry => entry.terms.some(term => text.includes(term)))?.propertyType;
}

export function normalizeDistrict(district: string): string {
  return district.trim().replace(/\s+/g, " ").toUpperCase();
}

function rejectionFor(record: RawDldTransaction, propertyType: PropertyType | undefined): RejectionReason | undefined {
  const date = new Date(record.d);
  if (Number.isNaN(date.getTime())) return "invalid_date";
  if (!Number.isFinite(record.a) || record.a <= 10) return "invalid_area";
  if (!Number.isFinite(record.p) || record.p <= 0) return "invalid_price";
  if (!propertyType) return "unsupported_property_type";
  const text = canonicalText(record.t, record.s);
  if (propertyType === "land" && /(COMMERCIAL|GENERAL USE)/.test(text)) return "commercial_land";
  if (record.p > maxPriceAed || record.p / record.a > maxUnitPriceAed) return "ultra_luxury";
  return undefined;
}

/** Normalizes evidence and records a deterministic eligibility decision. */
export function normalizeDldEvidence(record: RawDldTransaction): NormalizedEvidence | undefined {
  const propertyType = classifyPropertyType(record.t, record.s);
  const rejectionReason = rejectionFor(record, propertyType);
  if (!propertyType && rejectionReason === "unsupported_property_type") return undefined;

  const transactionDate = new Date(record.d);
  const areaSqm = Number(record.a);
  const salePriceAed = Number(record.p);
  return {
    sourceTransactionId: String(record.id),
    transactionDate,
    district: normalizeDistrict(record.x),
    propertyType: propertyType!,
    rawType: record.t,
    rawSubType: record.s || null,
    areaSqm,
    salePriceAed,
    pricePerSqm: areaSqm > 0 ? salePriceAed / areaSqm : 0,
    evidenceStatus: rejectionReason ? "rejected" : "eligible",
    rejectionReason: rejectionReason ?? null,
  };
}
