import { describe, expect, it } from "vitest";
import type { PropertyType } from "../../shared/valuation/contracts";
import {
  COMPARABLE_SELECTION_DEFAULT_CONFIGURATION,
  COMPARABLE_SELECTION_MAXIMUM_COUNT,
  COMPARABLE_SELECTION_MINIMUM_COUNT,
  COMPARABLE_SELECTION_MINIMUM_AREA_SQM,
  COMPARABLE_SELECTION_UNRESOLVED_POLICIES,
  type ComparableSelectionCandidate,
  type ComparableSelectionSubject,
} from "../../contracts/comparable-selection.contracts";
import { selectComparables } from "./comparable-selection";

const asOf = new Date("2026-08-20T00:00:00Z");

function candidate(
  index: number,
  overrides: Partial<ComparableSelectionCandidate> = {}
): ComparableSelectionCandidate {
  return {
    sourceTransactionId: `DLD-TXN-${String(index).padStart(6, "0")}`,
    transactionDate: new Date(`2026-08-20T00:00:00Z`),
    district: "BUSINESS BAY",
    propertyType: "apartment" as PropertyType,
    areaSqm: 120,
    salePriceAed: 1_500_000,
    pricePerSqm: 12_500,
    evidenceStatus: "eligible",
    ...overrides,
  };
}

function subject(
  overrides: Partial<ComparableSelectionSubject> = {}
): ComparableSelectionSubject {
  return {
    district: "BUSINESS BAY",
    propertyType: "apartment" as PropertyType,
    areaSqm: 115,
    asOf,
    ...overrides,
  };
}

function daysBefore(days: number): Date {
  return new Date(asOf.getTime() - days * 86_400_000);
}

describe("Comparable Selection v1.0", () => {
  it("selects the most recent candidates first in deterministic order", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(300) }),
      candidate(2, { transactionDate: daysBefore(20) }),
      candidate(3, { transactionDate: daysBefore(150) }),
      candidate(4, { transactionDate: daysBefore(10) }),
      candidate(5, { transactionDate: daysBefore(360) }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("selected");
    if (outcome.status !== "selected") throw new Error("Unexpected outcome");
    expect(
      outcome.comparables.map(comparable => comparable.sourceTransactionId)
    ).toEqual([
      "DLD-TXN-000004",
      "DLD-TXN-000002",
      "DLD-TXN-000003",
      "DLD-TXN-000001",
      "DLD-TXN-000005",
    ]);
    expect(outcome.excluded).toEqual([]);
    expect(outcome.unresolvedPolicies).toEqual(
      COMPARABLE_SELECTION_UNRESOLVED_POLICIES
    );
  });

  it("returns identical results for shuffled candidate order", () => {
    const ordered = [
      candidate(1, { transactionDate: daysBefore(40) }),
      candidate(2, { transactionDate: daysBefore(15) }),
      candidate(3, { transactionDate: daysBefore(200) }),
      candidate(4, { transactionDate: daysBefore(30) }),
      candidate(5, { transactionDate: daysBefore(100) }),
      candidate(6, { transactionDate: daysBefore(250) }),
    ];
    const shuffled = [
      ordered[3],
      ordered[5],
      ordered[0],
      ordered[4],
      ordered[1],
      ordered[2],
    ];

    const first = selectComparables(ordered, subject());
    const second = selectComparables(shuffled, subject());

    expect(first).toEqual(second);
    if (first.status !== "selected" || second.status !== "selected")
      throw new Error("Unexpected outcome");
    expect(first.comparables).toEqual(second.comparables);
    expect(first.excluded).toEqual(second.excluded);
  });

  it("breaks same-day ties deterministically by source transaction id", () => {
    const candidates = [
      candidate(3, { transactionDate: daysBefore(5) }),
      candidate(1, { transactionDate: daysBefore(5) }),
      candidate(2, { transactionDate: daysBefore(5) }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.comparables).toHaveLength(3);
    expect(
      outcome.comparables.map(comparable => comparable.sourceTransactionId)
    ).toEqual(["DLD-TXN-000001", "DLD-TXN-000002", "DLD-TXN-000003"]);
  });

  it("excludes ineligible records with a per-record explanation", () => {
    const candidates = [
      candidate(1),
      candidate(2, { evidenceStatus: "rejected" }),
      candidate(3),
      candidate(4, { evidenceStatus: "rejected" }),
      candidate(5),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.excluded).toHaveLength(2);
    expect(
      outcome.excluded.every(
        exclusion => exclusion.reason === "ineligible_record"
      )
    ).toBe(true);
    expect(
      outcome.excluded.map(exclusion => exclusion.sourceTransactionId)
    ).toEqual(["DLD-TXN-000002", "DLD-TXN-000004"]);
  });

  it("excludes candidates outside the subject district with type retained", () => {
    const candidates = [
      candidate(1, { district: "DUBAI MARINA" }),
      candidate(2),
      candidate(3, { district: "DOWNTOWN DUBAI" }),
      candidate(4),
      candidate(5),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.excluded).toHaveLength(2);
    expect(
      outcome.excluded.every(
        exclusion => exclusion.reason === "district_mismatch"
      )
    ).toBe(true);
  });

  it("excludes candidates with a different property type", () => {
    const candidates = [
      candidate(1, { propertyType: "villa" as PropertyType }),
      candidate(2),
      candidate(3),
      candidate(4),
      candidate(5),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.excluded).toHaveLength(1);
    expect(outcome.excluded[0].sourceTransactionId).toBe("DLD-TXN-000001");
    expect(outcome.excluded[0].reason).toBe("type_mismatch");
    expect(outcome.search.eligibleLocalCount).toBe(4);
  });

  it("excludes records outside the temporal window and future records", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(200) }),
      candidate(2, { transactionDate: daysBefore(500) }),
      candidate(3, { transactionDate: new Date(asOf.getTime() + 86_400_000) }),
      candidate(4, { transactionDate: daysBefore(100) }),
      candidate(5, { transactionDate: daysBefore(50) }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.excluded).toHaveLength(2);
    expect(
      outcome.excluded.every(exclusion => exclusion.reason === "outside_window")
    ).toBe(true);
    expect(
      outcome.excluded.map(exclusion => exclusion.sourceTransactionId)
    ).toEqual(["DLD-TXN-000003", "DLD-TXN-000002"]);
  });

  it("excludes records at or below the shared area floor of 10 sqm", () => {
    const candidates = [
      candidate(1, { areaSqm: 120 }),
      candidate(2, { areaSqm: 10 }),
      candidate(3, { areaSqm: 10.0001 }),
      candidate(4, { areaSqm: 5 }),
      candidate(5, { areaSqm: 9 }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.comparables).toHaveLength(2);
    const areaExclusions = outcome.excluded.filter(
      exclusion => exclusion.reason === "area_out_of_range"
    );
    expect(areaExclusions).toHaveLength(3);
    expect(
      areaExclusions.map(exclusion => exclusion.sourceTransactionId)
    ).toEqual(["DLD-TXN-000002", "DLD-TXN-000004", "DLD-TXN-000005"]);
  });

  it("caps selection at the governed maximum and explains ranked-out records", () => {
    const candidates = Array.from(
      { length: COMPARABLE_SELECTION_MAXIMUM_COUNT + 5 },
      (_, index) =>
        candidate(index + 1, { transactionDate: daysBefore(index * 10) })
    );

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("selected");
    if (outcome.status !== "selected") throw new Error("Unexpected outcome");
    expect(outcome.comparables).toHaveLength(
      COMPARABLE_SELECTION_MAXIMUM_COUNT
    );
    expect(outcome.excluded).toHaveLength(5);
    expect(
      outcome.excluded.every(
        exclusion => exclusion.reason === "ranked_out_of_capacity"
      )
    ).toBe(true);
    expect(outcome.search.eligibleLocalCount).toBe(candidates.length);
  });

  it("reports insufficient status when fewer than the minimum pass all guards", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(30) }),
      candidate(2, {
        transactionDate: daysBefore(30),
        district: "DUBAI MARINA",
      }),
      candidate(3, {
        transactionDate: daysBefore(30),
        evidenceStatus: "rejected",
      }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.comparables).toHaveLength(1);
    expect(outcome.requiredCount).toBe(COMPARABLE_SELECTION_MINIMUM_COUNT);
    expect(outcome.excluded).toHaveLength(2);
    expect(outcome.search.candidateCount).toBe(3);
    expect(outcome.search.eligibleLocalCount).toBe(1);
  });

  it("honours a custom window and custom configuration constants", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(50) }),
      candidate(2, { transactionDate: daysBefore(200) }),
      candidate(3, { transactionDate: daysBefore(400) }),
      candidate(4, { transactionDate: daysBefore(50) }),
      candidate(5, { transactionDate: daysBefore(50) }),
    ];

    const outcome = selectComparables(candidates, subject(), {
      windowDays: 90,
      minimumCount: COMPARABLE_SELECTION_MINIMUM_COUNT,
      maximumCount: COMPARABLE_SELECTION_MAXIMUM_COUNT,
      minimumAreaSqm: COMPARABLE_SELECTION_MINIMUM_AREA_SQM,
    });

    expect(outcome.status).toBe("insufficient");
    if (outcome.status !== "insufficient")
      throw new Error("Unexpected outcome");
    expect(outcome.comparables).toHaveLength(3);
    expect(outcome.excluded).toHaveLength(2);
    expect(
      outcome.excluded.every(exclusion => exclusion.reason === "outside_window")
    ).toBe(true);
    expect(
      outcome.excluded.map(exclusion => exclusion.sourceTransactionId)
    ).toEqual(["DLD-TXN-000002", "DLD-TXN-000003"]);
  });

  it("produces populated search metadata and attaches age days to each comparable", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(90) }),
      candidate(2, { transactionDate: daysBefore(30) }),
      candidate(3, { transactionDate: daysBefore(360) }),
      candidate(4, { transactionDate: daysBefore(365) }),
      candidate(5, { transactionDate: daysBefore(10) }),
    ];

    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("selected");
    if (outcome.status !== "selected") throw new Error("Unexpected outcome");
    expect(outcome.search.windowDays).toBe(
      COMPARABLE_SELECTION_DEFAULT_CONFIGURATION.windowDays
    );
    expect(outcome.search.asOf).toEqual(asOf);
    const ages = outcome.comparables.map(comparable => comparable.ageDays);
    expect(ages).toEqual([ages[0], ...ages.slice(1)]);
    for (let index = 1; index < ages.length; index += 1) {
      expect(ages[index]).toBeGreaterThanOrEqual(ages[index - 1]);
    }
  });

  it("does not invent secondary attributes or price statistics on comparables", () => {
    const candidates = [
      candidate(1, { transactionDate: daysBefore(10) }),
      candidate(2),
      candidate(3),
      candidate(4),
      candidate(5),
    ];
    const outcome = selectComparables(candidates, subject());

    expect(outcome.status).toBe("selected");
    if (outcome.status !== "selected") throw new Error("Unexpected outcome");
    for (const comparable of outcome.comparables) {
      expect(comparable.pricePerSqm).toBe(12_500);
      expect(comparable.timeAdjustedPricePerSqm).toBe(12_500);
      const keys = Object.keys(comparable).sort();
      expect(keys).toEqual([
        "ageDays",
        "areaSqm",
        "district",
        "pricePerSqm",
        "propertyType",
        "salePriceAed",
        "sourceTransactionId",
        "timeAdjustedPricePerSqm",
        "transactionDate",
      ]);
    }
  });
});
