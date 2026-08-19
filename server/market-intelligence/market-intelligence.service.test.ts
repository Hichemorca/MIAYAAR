import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE,
  type MarketIntelligenceEvidenceProvider,
  type MarketIntelligenceEvidenceRecord,
  type MarketIntelligenceFilters,
} from "../../contracts/market-intelligence.contracts";
import { MarketIntelligenceService } from "../../engines/market-intelligence/market-intelligence.service";

const asOf = new Date("2026-08-19T00:00:00.000Z");

function record(
  sourceTransactionId: string,
  transactionDate: string,
  pricePerSqm: number,
  overrides: Partial<MarketIntelligenceEvidenceRecord> = {}
): MarketIntelligenceEvidenceRecord {
  return {
    source: "DLD",
    sourceTransactionId,
    sourceChecksum: `checksum-${sourceTransactionId}`,
    transactionDate: new Date(transactionDate),
    district: "DUBAI MARINA",
    propertyType: "apartment",
    pricePerSqm,
    ingestedAt: new Date("2026-08-20T12:00:00.000Z"),
    evidenceStatus: "eligible",
    ...overrides,
  };
}

function createProvider(records: readonly MarketIntelligenceEvidenceRecord[]) {
  const listEligibleDldEvidence = vi.fn(
    async (_filters: MarketIntelligenceFilters) => records
  );
  const provider: MarketIntelligenceEvidenceProvider = {
    listEligibleDldEvidence,
  };
  return { provider, listEligibleDldEvidence };
}

describe("Market Intelligence v1.0", () => {
  it("returns descriptive price-per-sqm statistics and complete record-level provenance", async () => {
    const { provider } = createProvider([
      record("tx-3", "2026-08-17T00:00:00.000Z", 140),
      record("tx-1", "2026-06-01T00:00:00.000Z", 100),
      record("tx-5", "2026-08-19T00:00:00.000Z", 180),
      record("tx-2", "2026-07-01T00:00:00.000Z", 120),
      record("tx-4", "2026-08-18T00:00:00.000Z", 160),
    ]);

    const result = await new MarketIntelligenceService(provider).getBenchmark({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result.status).toBe("available");
    if (result.status !== "available")
      throw new Error("Expected an available benchmark.");

    expect(result.statistics).toEqual({
      mean: 140,
      standardDeviation: Math.sqrt(800),
      count: 5,
      min: 100,
      max: 180,
    });
    expect("inconsistent" in result).toBe(false);
    expect(result.provenance).toMatchObject({
      source: "DLD",
      policyVersion: "MI-v1.0",
      recordCount: 5,
      filters: {
        district: "DUBAI MARINA",
        propertyType: "apartment",
        source: "DLD",
        evidenceStatus: "eligible",
        from: new Date("2026-05-21T00:00:00.000Z"),
        asOf,
      },
      sourceTransactionIds: ["tx-1", "tx-2", "tx-3", "tx-4", "tx-5"],
      sourceChecksums: [
        "checksum-tx-1",
        "checksum-tx-2",
        "checksum-tx-3",
        "checksum-tx-4",
        "checksum-tx-5",
      ],
    });
    expect(
      result.provenance.records.map(item => item.transactionDate.toISOString())
    ).toEqual([
      "2026-06-01T00:00:00.000Z",
      "2026-07-01T00:00:00.000Z",
      "2026-08-17T00:00:00.000Z",
      "2026-08-18T00:00:00.000Z",
      "2026-08-19T00:00:00.000Z",
    ]);
  });

  it("reports explicit unavailable evidence without fabricating a benchmark", async () => {
    const { provider } = createProvider([
      record("tx-1", "2026-06-01T00:00:00.000Z", 100),
      record("tx-2", "2026-07-01T00:00:00.000Z", 120),
      record("tx-3", "2026-08-01T00:00:00.000Z", 140),
      record("tx-4", "2026-08-18T00:00:00.000Z", 160),
    ]);

    const result = await new MarketIntelligenceService(provider).getBenchmark({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "insufficient_benchmark_evidence",
      requiredCount: MARKET_INTELLIGENCE_MINIMUM_SAMPLE_SIZE,
      provenance: { recordCount: 4 },
    });
    expect("statistics" in result).toBe(false);
  });

  it("enforces both inclusive 90-day bounds and blocks temporal leakage from a provider", async () => {
    const { provider } = createProvider([
      record("too-old", "2026-05-20T23:59:59.999Z", 50),
      record("start", "2026-05-21T00:00:00.000Z", 100),
      record("middle-1", "2026-06-01T00:00:00.000Z", 120),
      record("middle-2", "2026-07-01T00:00:00.000Z", 140),
      record("middle-3", "2026-08-01T00:00:00.000Z", 160),
      record("end", "2026-08-19T00:00:00.000Z", 180),
      record("future", "2026-08-19T00:00:00.001Z", 999_999),
    ]);

    const result = await new MarketIntelligenceService(provider).getBenchmark({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result.status).toBe("available");
    expect(result.provenance.sourceTransactionIds).toEqual([
      "start",
      "middle-1",
      "middle-2",
      "middle-3",
      "end",
    ]);
    if (result.status === "available") {
      expect(result.statistics.max).toBe(180);
      expect(result.statistics.count).toBe(5);
    }
  });

  it("uses the single governed district-and-property-type level and never falls back", async () => {
    const { provider, listEligibleDldEvidence } = createProvider([
      record("other-district", "2026-08-18T00:00:00.000Z", 100, {
        district: "JUMEIRAH VILLAGE CIRCLE",
      }),
      record("other-type", "2026-08-18T00:00:00.000Z", 100, {
        propertyType: "villa",
      }),
    ]);

    const result = await new MarketIntelligenceService(provider).getBenchmark({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result).toMatchObject({
      status: "unavailable",
      provenance: { recordCount: 0 },
    });
    expect(listEligibleDldEvidence).toHaveBeenCalledTimes(1);
    expect(listEligibleDldEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        district: "DUBAI MARINA",
        propertyType: "apartment",
        source: "DLD",
        evidenceStatus: "eligible",
      })
    );
  });

  it("is structurally independent of valuation, confidence, and comparable-search modules", () => {
    const serviceSource = readFileSync(
      new URL(
        "../../engines/market-intelligence/market-intelligence.service.ts",
        import.meta.url
      ),
      "utf8"
    );
    const providerSource = readFileSync(
      new URL("./dld-market-intelligence-provider.ts", import.meta.url),
      "utf8"
    );
    const imports =
      `${serviceSource}\n${providerSource}`
        .match(/^import .*$/gm)
        ?.join("\n") ?? "";

    expect(imports).not.toMatch(
      /valuation\.engine|confidence|comparable-search|valuation-orchestrator/
    );
    expect(`${serviceSource}\n${providerSource}`).toContain(
      "market-intelligence.contracts"
    );
  });
});
