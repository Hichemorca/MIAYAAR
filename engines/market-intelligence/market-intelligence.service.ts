import {
  MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE,
  MARKET_INTELLIGENCE_POLICY_VERSION,
  MARKET_INTELLIGENCE_WINDOW_DAYS,
  type MarketIntelligenceBenchmark,
  type MarketIntelligenceEvidenceProvider,
  type MarketIntelligenceEvidenceRecord,
  type MarketIntelligenceFilters,
  type MarketIntelligenceProvenance,
  type MarketIntelligenceRequest,
  type MarketIntelligenceStatistics,
} from "../../contracts/market-intelligence.contracts";

function copyDate(value: Date): Date {
  return new Date(value.getTime());
}

function subtractCalendarDays(asOf: Date, days: number): Date {
  const result = copyDate(asOf);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

function assertRequest(request: MarketIntelligenceRequest): void {
  if (!request.district.trim())
    throw new Error("Market intelligence district is required.");
  if (Number.isNaN(request.asOf.getTime()))
    throw new Error("Market intelligence asOf must be a valid date.");
}

function belongsToFilters(
  record: MarketIntelligenceEvidenceRecord,
  filters: MarketIntelligenceFilters
): boolean {
  const transactionTime = record.transactionDate.getTime();
  return (
    record.source === filters.source &&
    record.evidenceStatus === filters.evidenceStatus &&
    record.district === filters.district &&
    record.propertyType === filters.propertyType &&
    transactionTime >= filters.from.getTime() &&
    transactionTime <= filters.asOf.getTime() &&
    Number.isFinite(record.pricePerSqm)
  );
}

function ordered(
  records: readonly MarketIntelligenceEvidenceRecord[]
): MarketIntelligenceEvidenceRecord[] {
  return [...records].sort((left, right) => {
    const dateDifference =
      left.transactionDate.getTime() - right.transactionDate.getTime();
    return dateDifference !== 0
      ? dateDifference
      : left.sourceTransactionId.localeCompare(right.sourceTransactionId);
  });
}

function buildProvenance(
  filters: MarketIntelligenceFilters,
  records: readonly MarketIntelligenceEvidenceRecord[]
): MarketIntelligenceProvenance {
  const provenanceRecords = records.map(record => ({
    sourceTransactionId: record.sourceTransactionId,
    sourceChecksum: record.sourceChecksum,
    transactionDate: copyDate(record.transactionDate),
    ingestedAt: copyDate(record.ingestedAt),
  }));

  return {
    source: "DLD",
    policyVersion: MARKET_INTELLIGENCE_POLICY_VERSION,
    asOf: copyDate(filters.asOf),
    filters: {
      ...filters,
      from: copyDate(filters.from),
      asOf: copyDate(filters.asOf),
    },
    recordCount: provenanceRecords.length,
    records: provenanceRecords,
    sourceTransactionIds: provenanceRecords.map(
      record => record.sourceTransactionId
    ),
    sourceChecksums: provenanceRecords.map(record => record.sourceChecksum),
  };
}

function describePricePerSqm(
  records: readonly MarketIntelligenceEvidenceRecord[]
): MarketIntelligenceStatistics {
  const values = records.map(record => record.pricePerSqm);
  const count = values.length;
  const mean = values.reduce((total, value) => total + value, 0) / count;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / count;

  return {
    mean,
    standardDeviation: Math.sqrt(variance),
    count,
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

/**
 * Policy-driven, descriptive MI v1.0 service.
 *
 * This class has no valuation or confidence dependency. It computes only the
 * DLD benchmark permitted by MARKET-INTELLIGENCE-POLICY.md.
 */
export class MarketIntelligenceService {
  constructor(
    private readonly evidenceProvider: MarketIntelligenceEvidenceProvider
  ) {}

  async getBenchmark(
    request: MarketIntelligenceRequest
  ): Promise<MarketIntelligenceBenchmark> {
    assertRequest(request);

    const asOf = copyDate(request.asOf);
    const filters: MarketIntelligenceFilters = {
      district: request.district,
      propertyType: request.propertyType,
      source: "DLD",
      evidenceStatus: "eligible",
      from: subtractCalendarDays(asOf, MARKET_INTELLIGENCE_WINDOW_DAYS),
      asOf,
    };

    const providedRecords =
      await this.evidenceProvider.listEligibleDldEvidence(filters);
    const selectedRecords = ordered(
      providedRecords.filter(record => belongsToFilters(record, filters))
    );
    const provenance = buildProvenance(filters, selectedRecords);

    if (selectedRecords.length < MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE) {
      return {
        status: "unavailable",
        reason: "insufficient_benchmark_evidence",
        requiredCount: MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE,
        provenance,
      };
    }

    return {
      status: "available",
      statistics: describePricePerSqm(selectedRecords),
      provenance,
    };
  }
}
