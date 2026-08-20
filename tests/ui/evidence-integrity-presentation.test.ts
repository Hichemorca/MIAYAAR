import { describe, expect, it } from "vitest";
import type { EvidenceIntegrityResult } from "../../contracts/evidence-integrity.contracts";
import {
  getEvidenceIntegrityHeading,
  getEvidenceIntegrityMetrics,
  getEvidenceIntegritySummary,
  getEvidenceIntegrityUiState,
  parseAsOfDate,
} from "../../client/src/components/evidence-integrity-presentation";

const availableResult: EvidenceIntegrityResult = {
  status: "available",
  observations: [
    { code: "eligible_evidence_available", recordCount: 6, records: [] },
  ],
  summary: {
    eligibleRecordCount: 6,
    requiredEligibleRecordCount: 5,
    rejectedRecordCount: 1,
    futureExcludedRecordCount: 2,
    outsideWindowExcludedRecordCount: 3,
  },
  provenance: {
    source: "DLD",
    policyVersion: "EID-v1.0",
    asOf: new Date("2026-08-20T00:00:00.000Z"),
    filters: {
      source: "DLD",
      district: "BUSINESS BAY",
      propertyType: "apartment",
      from: new Date("2026-05-22T00:00:00.000Z"),
      asOf: new Date("2026-08-20T00:00:00.000Z"),
    },
    recordCount: 9,
    records: [],
    sourceTransactionIds: [],
    sourceChecksums: [],
  },
};

const unavailableResult: EvidenceIntegrityResult = {
  ...availableResult,
  status: "unavailable",
  reason: "insufficient_local_evidence",
  summary: { ...availableResult.summary, eligibleRecordCount: 2 },
};

describe("Evidence Integrity UI presentation", () => {
  it("maps idle, validation, loading, error, and result states without valuation semantics", () => {
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: false,
        hasInvalidAsOf: false,
        isPending: false,
        isError: false,
      })
    ).toBe("idle");
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: true,
        hasInvalidAsOf: true,
        isPending: false,
        isError: false,
      })
    ).toBe("validation");
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: true,
        hasInvalidAsOf: false,
        isPending: true,
        isError: false,
      })
    ).toBe("loading");
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: true,
        hasInvalidAsOf: false,
        isPending: false,
        isError: true,
      })
    ).toBe("error");
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: true,
        hasInvalidAsOf: false,
        isPending: false,
        isError: false,
        result: availableResult,
      })
    ).toBe("available");
    expect(
      getEvidenceIntegrityUiState({
        hasRequested: true,
        hasInvalidAsOf: false,
        isPending: false,
        isError: false,
        result: unavailableResult,
      })
    ).toBe("unavailable");
    expect(getEvidenceIntegrityHeading("unavailable")).not.toMatch(
      /value|score|price/i
    );
  });

  it("presents provenance-oriented metrics without pricing data", () => {
    expect(getEvidenceIntegritySummary(availableResult)).toContain(
      "6 eligible DLD records"
    );
    expect(getEvidenceIntegritySummary(unavailableResult)).toContain(
      "No substitute evidence was used"
    );
    expect(getEvidenceIntegrityMetrics(availableResult.summary)).toEqual([
      { label: "Eligible", value: 6 },
      { label: "Required", value: 5 },
      { label: "Rejected", value: 1 },
      { label: "Time exclusions", value: 5 },
    ]);
  });

  it("accepts only a valid calendar as-of date", () => {
    expect(parseAsOfDate("2026-08-20")?.toISOString()).toBe(
      "2026-08-20T00:00:00.000Z"
    );
    expect(parseAsOfDate("20/08/2026")).toBeNull();
  });
});
