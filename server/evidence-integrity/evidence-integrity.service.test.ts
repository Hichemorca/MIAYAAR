import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS,
  type EvidenceIntegrityEvidenceProvider,
  type EvidenceIntegrityEvidenceRecord,
  type EvidenceIntegrityScope,
} from "../../contracts/evidence-integrity.contracts";
import { EvidenceIntegrityService } from "../../engines/evidence-integrity/evidence-integrity.service";

const asOf = new Date("2026-08-19T00:00:00.000Z");

function record(
  sourceTransactionId: string,
  transactionDate: string,
  overrides: Partial<EvidenceIntegrityEvidenceRecord> = {}
): EvidenceIntegrityEvidenceRecord {
  return {
    source: "DLD",
    sourceTransactionId,
    sourceChecksum: `checksum-${sourceTransactionId}`,
    transactionDate: new Date(transactionDate),
    district: "DUBAI MARINA",
    propertyType: "apartment",
    evidenceStatus: "eligible",
    rejectionReason: null,
    ingestedAt: new Date("2026-08-20T12:00:00.000Z"),
    ...overrides,
  };
}

function createProvider(records: readonly EvidenceIntegrityEvidenceRecord[]) {
  const listDldEvidence = vi.fn(
    async (_scope: EvidenceIntegrityScope) => records
  );
  const provider: EvidenceIntegrityEvidenceProvider = { listDldEvidence };
  return { provider, listDldEvidence };
}

function observationCodes(
  result: Awaited<ReturnType<EvidenceIntegrityService["inspect"]>>
) {
  return result.observations.map(item => item.code);
}

describe("Evidence Integrity Diagnostics v1.0", () => {
  it("reports factual eligible, rejected, future, and out-of-window observations with record-level provenance", async () => {
    const { provider } = createProvider([
      record("too-old", "2026-05-20T23:59:59.999Z"),
      record("start", "2026-05-21T00:00:00.000Z"),
      record("eligible-2", "2026-06-01T00:00:00.000Z"),
      record("eligible-3", "2026-07-01T00:00:00.000Z"),
      record("eligible-4", "2026-08-01T00:00:00.000Z"),
      record("end", "2026-08-19T00:00:00.000Z"),
      record("rejected", "2026-08-18T00:00:00.000Z", {
        evidenceStatus: "rejected",
        rejectionReason: "invalid_price",
      }),
      record("future", "2026-08-19T00:00:00.001Z"),
    ]);

    const result = await new EvidenceIntegrityService(provider).inspect({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result.status).toBe("available");
    expect(result.summary).toEqual({
      eligibleRecordCount: 5,
      requiredEligibleRecordCount: EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS,
      rejectedRecordCount: 1,
      futureExcludedRecordCount: 1,
      outsideWindowExcludedRecordCount: 1,
    });
    expect(observationCodes(result)).toEqual([
      "eligible_evidence_available",
      "future_dated_evidence_excluded",
      "outside_window_evidence_excluded",
      "rejected_evidence_observed",
    ]);
    expect(result.provenance).toMatchObject({
      source: "DLD",
      policyVersion: "EID-v1.0",
      asOf,
      filters: {
        district: "DUBAI MARINA",
        propertyType: "apartment",
        source: "DLD",
        from: new Date("2026-05-21T00:00:00.000Z"),
        asOf,
      },
      recordCount: 8,
      sourceTransactionIds: [
        "too-old",
        "start",
        "eligible-2",
        "eligible-3",
        "eligible-4",
        "rejected",
        "end",
        "future",
      ],
      sourceChecksums: [
        "checksum-too-old",
        "checksum-start",
        "checksum-eligible-2",
        "checksum-eligible-3",
        "checksum-eligible-4",
        "checksum-rejected",
        "checksum-end",
        "checksum-future",
      ],
    });
    expect(
      result.observations.find(
        item => item.code === "rejected_evidence_observed"
      )?.records
    ).toEqual([
      expect.objectContaining({
        sourceTransactionId: "rejected",
        rejectionReason: "invalid_price",
      }),
    ]);
  });

  it("returns explicit insufficient-local-evidence facts without synthetic values or confidence", async () => {
    const { provider } = createProvider([
      record("tx-1", "2026-06-01T00:00:00.000Z"),
      record("tx-2", "2026-07-01T00:00:00.000Z"),
      record("tx-3", "2026-08-01T00:00:00.000Z"),
      record("tx-4", "2026-08-18T00:00:00.000Z"),
    ]);

    const result = await new EvidenceIntegrityService(provider).inspect({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "insufficient_local_evidence",
      summary: {
        eligibleRecordCount: 4,
        requiredEligibleRecordCount:
          EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS,
      },
    });
    expect(observationCodes(result)).toEqual(["insufficient_local_evidence"]);
    expect("statistics" in result).toBe(false);
    expect("confidence" in result).toBe(false);
    expect("score" in result).toBe(false);
    expect("classification" in result).toBe(false);
  });

  it("enforces inclusive 90-day boundaries and excludes temporal leakage from a provider", async () => {
    const { provider } = createProvider([
      record("before", "2026-05-20T23:59:59.999Z"),
      record("at-start", "2026-05-21T00:00:00.000Z"),
      record("middle-1", "2026-06-01T00:00:00.000Z"),
      record("middle-2", "2026-07-01T00:00:00.000Z"),
      record("middle-3", "2026-08-01T00:00:00.000Z"),
      record("at-end", "2026-08-19T00:00:00.000Z"),
      record("after", "2026-08-19T00:00:00.001Z"),
    ]);

    const result = await new EvidenceIntegrityService(provider).inspect({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result.status).toBe("available");
    expect(result.summary).toMatchObject({
      eligibleRecordCount: 5,
      outsideWindowExcludedRecordCount: 1,
      futureExcludedRecordCount: 1,
    });
    expect(
      result.observations
        .find(item => item.code === "outside_window_evidence_excluded")
        ?.records.map(item => item.sourceTransactionId)
    ).toEqual(["before"]);
    expect(
      result.observations
        .find(item => item.code === "future_dated_evidence_excluded")
        ?.records.map(item => item.sourceTransactionId)
    ).toEqual(["after"]);
  });

  it("honours only the requested local scope and records no fallback", async () => {
    const { provider, listDldEvidence } = createProvider([
      record("other-district", "2026-08-18T00:00:00.000Z", {
        district: "JUMEIRAH VILLAGE CIRCLE",
      }),
      record("other-type", "2026-08-18T00:00:00.000Z", {
        propertyType: "villa",
      }),
    ]);

    const result = await new EvidenceIntegrityService(provider).inspect({
      district: "DUBAI MARINA",
      propertyType: "apartment",
      asOf,
    });

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "insufficient_local_evidence",
      summary: { eligibleRecordCount: 0 },
      provenance: { recordCount: 0 },
    });
    expect(listDldEvidence).toHaveBeenCalledTimes(1);
    expect(listDldEvidence).toHaveBeenCalledWith({
      source: "DLD",
      district: "DUBAI MARINA",
      propertyType: "apartment",
    });
  });

  it("is structurally independent of valuation, confidence, comparable-search, and market-intelligence modules", () => {
    const serviceSource = readFileSync(
      new URL(
        "../../engines/evidence-integrity/evidence-integrity.service.ts",
        import.meta.url
      ),
      "utf8"
    );
    const providerSource = readFileSync(
      new URL("./dld-evidence-integrity-provider.ts", import.meta.url),
      "utf8"
    );
    const imports =
      `${serviceSource}\n${providerSource}`
        .match(/^import .*$/gm)
        ?.join("\n") ?? "";

    expect(imports).not.toMatch(
      /valuation\.engine|confidence|comparable-search|valuation-orchestrator|market-intelligence/
    );
    expect(`${serviceSource}\n${providerSource}`).toContain(
      "evidence-integrity.contracts"
    );
  });
});
