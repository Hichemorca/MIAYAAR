import type { PropertySubmission, PropertyType } from "../../shared/valuation/contracts";

export type RawDldTransaction = {
  id: string;
  d: string;
  t: string;
  s: string;
  x: string;
  a: number;
  p: number;
  r: number | null;
};

export type DldDataset = {
  source: string;
  retrievedAt: string;
  methodology: string;
  records: RawDldTransaction[];
};

export type RejectionReason =
  | "invalid_date"
  | "invalid_area"
  | "invalid_price"
  | "unsupported_property_type"
  | "commercial_land"
  | "ultra_luxury";

export type NormalizedEvidence = {
  sourceTransactionId: string;
  transactionDate: Date;
  district: string;
  propertyType: PropertyType;
  rawType: string;
  rawSubType: string | null;
  areaSqm: number;
  salePriceAed: number;
  pricePerSqm: number;
  evidenceStatus: "eligible" | "rejected";
  rejectionReason: RejectionReason | null;
};

export type ComparableEvidence = {
  sourceTransactionId: string;
  transactionDate: Date;
  district: string;
  propertyType: PropertyType;
  areaSqm: number;
  salePriceAed: number;
  pricePerSqm: number;
  ageDays: number;
  timeAdjustedPricePerSqm: number;
};

export type ComparableSearchResult =
  | {
      status: "available";
      comparables: ComparableEvidence[];
      search: { district: string; propertyType: PropertyType; windowDays: number; asOf: Date };
    }
  | {
      status: "unavailable";
      reason: "insufficient_local_comparables";
      availableCount: number;
      requiredCount: number;
      search: { district: string; propertyType: PropertyType; windowDays: number; asOf: Date };
    };

export type ValidatedSubmission = PropertySubmission & { district: string };
