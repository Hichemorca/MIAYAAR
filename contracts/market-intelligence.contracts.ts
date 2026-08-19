/**
 * Market Intelligence v1.0 contracts.
 *
 * This module is intentionally independent of valuation, confidence, and
 * comparable-selection contracts. It describes read-only DLD benchmark
 * evidence and its auditable descriptive result.
 */

export const MARKET_INTELLIGENCE_POLICY_VERSION = "MI-v1.0" as const;
export const MARKET_INTELLIGENCE_WINDOW_DAYS = 90 as const;
export const MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE = 5 as const;

export type MarketIntelligencePropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "office"
  | "retail"
  | "land"
  | "warehouse";

export type MarketIntelligenceRequest = {
  readonly district: string;
  readonly propertyType: MarketIntelligencePropertyType;
  readonly asOf: Date;
};

export type MarketIntelligenceFilters = {
  readonly district: string;
  readonly propertyType: MarketIntelligencePropertyType;
  readonly source: "DLD";
  readonly evidenceStatus: "eligible";
  readonly from: Date;
  readonly asOf: Date;
};

/** The complete DLD evidence payload permitted to enter MI v1.0. */
export type MarketIntelligenceEvidenceRecord = {
  readonly source: "DLD";
  readonly sourceTransactionId: string;
  readonly sourceChecksum: string;
  readonly transactionDate: Date;
  readonly district: string;
  readonly propertyType: MarketIntelligencePropertyType;
  readonly pricePerSqm: number;
  readonly ingestedAt: Date;
  readonly evidenceStatus: "eligible";
};

export type MarketIntelligenceRecordProvenance = Pick<
  MarketIntelligenceEvidenceRecord,
  "sourceTransactionId" | "sourceChecksum" | "transactionDate" | "ingestedAt"
>;

export type MarketIntelligenceProvenance = {
  readonly source: "DLD";
  readonly policyVersion: typeof MARKET_INTELLIGENCE_POLICY_VERSION;
  readonly asOf: Date;
  readonly filters: MarketIntelligenceFilters;
  readonly recordCount: number;
  readonly records: readonly MarketIntelligenceRecordProvenance[];
  readonly sourceTransactionIds: readonly string[];
  readonly sourceChecksums: readonly string[];
};

export type MarketIntelligenceStatistics = {
  readonly mean: number;
  readonly standardDeviation: number;
  readonly count: number;
  readonly min: number;
  readonly max: number;
};

export type AvailableMarketIntelligenceBenchmark = {
  readonly status: "available";
  readonly statistics: MarketIntelligenceStatistics;
  readonly provenance: MarketIntelligenceProvenance;
};

export type UnavailableMarketIntelligenceBenchmark = {
  readonly status: "unavailable";
  readonly reason: "insufficient_benchmark_evidence";
  readonly requiredCount: typeof MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE;
  readonly provenance: MarketIntelligenceProvenance;
};

export type MarketIntelligenceBenchmark =
  | AvailableMarketIntelligenceBenchmark
  | UnavailableMarketIntelligenceBenchmark;

/** A server-side, read-only source of eligible DLD evidence. */
export interface MarketIntelligenceEvidenceProvider {
  listEligibleDldEvidence(
    filters: MarketIntelligenceFilters
  ): Promise<readonly MarketIntelligenceEvidenceRecord[]>;
}
