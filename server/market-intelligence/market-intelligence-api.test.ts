import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketIntelligenceEvidenceRecord } from "../../contracts/market-intelligence.contracts";
import type { TrpcContext } from "../_core/context";

const { executeValuation, listEligibleDldEvidence } = vi.hoisted(() => ({
  executeValuation: vi.fn(),
  listEligibleDldEvidence: vi.fn(),
}));

vi.mock("../engines/orchestrator/valuation-orchestrator", () => ({
  executeValuation,
}));

vi.mock("./dld-market-intelligence-provider", () => ({
  DldMarketIntelligenceProvider: class {
    listEligibleDldEvidence = listEligibleDldEvidence;
  },
}));

import { appRouter } from "../routers";

const AS_OF = new Date("2026-08-20T00:00:00.000Z");

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function record(
  sourceTransactionId: string,
  overrides: Partial<MarketIntelligenceEvidenceRecord> = {}
): MarketIntelligenceEvidenceRecord {
  return {
    source: "DLD",
    sourceTransactionId,
    sourceChecksum: `checksum-${sourceTransactionId}`,
    transactionDate: new Date("2026-08-01T00:00:00.000Z"),
    district: "Business Bay",
    propertyType: "apartment",
    pricePerSqm: 15_000,
    ingestedAt: new Date("2026-08-02T00:00:00.000Z"),
    evidenceStatus: "eligible",
    ...overrides,
  };
}

describe("marketIntelligence.benchmark", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only the existing DLD benchmark contract through a read-only server procedure", async () => {
    listEligibleDldEvidence.mockResolvedValue([
      record("DLD-001", { pricePerSqm: 14_000 }),
      record("DLD-002", { pricePerSqm: 14_500 }),
      record("DLD-003", { pricePerSqm: 15_000 }),
      record("DLD-004", { pricePerSqm: 15_500 }),
      record("DLD-005", { pricePerSqm: 16_000 }),
    ]);

    const result = await appRouter
      .createCaller(createPublicContext())
      .marketIntelligence.benchmark({
        district: "Business Bay",
        propertyType: "apartment",
        asOf: AS_OF,
      });

    expect(listEligibleDldEvidence).toHaveBeenCalledWith({
      district: "Business Bay",
      propertyType: "apartment",
      source: "DLD",
      evidenceStatus: "eligible",
      from: new Date("2026-05-22T00:00:00.000Z"),
      asOf: AS_OF,
    });
    expect(result).toMatchObject({
      status: "available",
      statistics: { count: 5, mean: 15_000, min: 14_000, max: 16_000 },
      provenance: {
        source: "DLD",
        policyVersion: "MI-v1.0",
        recordCount: 5,
      },
    });
    expect(result).not.toHaveProperty("confidence");
    expect(result).not.toHaveProperty("valuation");
    expect(result).not.toHaveProperty("diagnostics");
    expect(executeValuation).not.toHaveBeenCalled();
  });

  it("returns the existing unavailable union without a benchmark or fallback", async () => {
    listEligibleDldEvidence.mockResolvedValue([
      record("DLD-001"),
      record("DLD-002"),
    ]);

    const result = await appRouter
      .createCaller(createPublicContext())
      .marketIntelligence.benchmark({
        district: "Business Bay",
        propertyType: "apartment",
        asOf: AS_OF,
      });

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "insufficient_benchmark_evidence",
      requiredCount: 5,
      provenance: { recordCount: 2, source: "DLD" },
    });
    expect(result).not.toHaveProperty("statistics");
    expect(executeValuation).not.toHaveBeenCalled();
  });

  it("rejects scope expansion inputs not admitted by the governed request", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.marketIntelligence.benchmark({
        district: "",
        propertyType: "apartment",
        asOf: AS_OF,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      caller.marketIntelligence.benchmark({
        district: "Business Bay",
        propertyType: "apartment",
        asOf: AS_OF,
        areaSqm: 100,
      } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
