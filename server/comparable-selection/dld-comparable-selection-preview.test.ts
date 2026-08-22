import type { ComparableSelectionCandidate } from "../../contracts/comparable-selection.contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listDldComparableSelectionCandidates } = vi.hoisted(() => ({
  listDldComparableSelectionCandidates: vi.fn(),
}));

vi.mock("../db", () => ({ listDldComparableSelectionCandidates }));

import { DldComparableSelectionPreviewService } from "./dld-comparable-selection-preview";

const AS_OF = new Date("2026-08-20T00:00:00.000Z");

function candidate(
  sourceTransactionId: string,
  overrides: Partial<ComparableSelectionCandidate> = {}
): ComparableSelectionCandidate {
  return {
    sourceTransactionId,
    transactionDate: new Date("2026-08-10T00:00:00.000Z"),
    district: "Business Bay",
    propertyType: "apartment",
    areaSqm: 100,
    salePriceAed: 1_500_000,
    pricePerSqm: 15_000,
    evidenceStatus: "eligible",
    ...overrides,
  };
}

describe("DldComparableSelectionPreviewService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes DLD candidates unchanged through CS-v1.0 and joins only server exclusion reasons", async () => {
    listDldComparableSelectionCandidates.mockResolvedValue([
      candidate("DLD-001"),
      candidate("DLD-002"),
      candidate("DLD-003"),
      candidate("DLD-004"),
      candidate("DLD-005"),
      candidate("DLD-REJECTED", { evidenceStatus: "rejected" }),
      candidate("DLD-OTHER", { district: "Dubai Marina" }),
    ]);

    const result = await new DldComparableSelectionPreviewService().preview({
      district: "Business Bay",
      propertyType: "apartment",
      areaSqm: 100,
      asOf: AS_OF,
    });

    expect(result.status).toBe("selected");
    expect(result.comparables).toHaveLength(5);
    expect(result.comparables[0]).toMatchObject({
      sourceTransactionId: "DLD-001",
      district: "Business Bay",
      propertyType: "apartment",
      salePriceAed: 1_500_000,
      pricePerSqm: 15_000,
    });
    expect(result.excluded).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceTransactionId: "DLD-REJECTED",
          reason: "ineligible_record",
        }),
        expect.objectContaining({
          sourceTransactionId: "DLD-OTHER",
          reason: "district_mismatch",
        }),
      ])
    );
    expect(result).not.toHaveProperty("valuation");
    expect(result).not.toHaveProperty("confidence");
    expect(result).not.toHaveProperty("fallback");
  });

  it("returns the existing insufficient CS-v1.0 outcome without manufacturing comparables", async () => {
    listDldComparableSelectionCandidates.mockResolvedValue([
      candidate("DLD-001"),
      candidate("DLD-002"),
    ]);

    const result = await new DldComparableSelectionPreviewService().preview({
      district: "Business Bay",
      propertyType: "apartment",
      areaSqm: 100,
      asOf: AS_OF,
    });

    expect(result).toMatchObject({
      status: "insufficient",
      requiredCount: 5,
      comparables: [
        { sourceTransactionId: "DLD-001" },
        { sourceTransactionId: "DLD-002" },
      ],
    });
  });
});
