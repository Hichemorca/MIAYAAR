import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EvidenceIntegrityResult } from "../../contracts/evidence-integrity.contracts";
import { EvidenceIntegritySnapshot } from "../../client/src/components/EvidenceIntegrityPanel";

const provenance = {
  source: "DLD" as const,
  policyVersion: "EID-v1.0" as const,
  asOf: new Date("2026-08-22T00:00:00.000Z"),
  filters: {
    source: "DLD" as const,
    district: "Business Bay",
    propertyType: "apartment" as const,
    from: new Date("2026-05-24T00:00:00.000Z"),
    asOf: new Date("2026-08-22T00:00:00.000Z"),
  },
  recordCount: 5,
  records: [
    {
      sourceTransactionId: "DLD-2001",
      sourceChecksum: "checksum-2001",
      transactionDate: new Date("2026-08-10T00:00:00.000Z"),
      ingestedAt: new Date("2026-08-11T00:00:00.000Z"),
      evidenceStatus: "eligible" as const,
      rejectionReason: null,
    },
  ],
  sourceTransactionIds: ["DLD-2001"],
  sourceChecksums: ["checksum-2001"],
};

const summary = {
  eligibleRecordCount: 5,
  requiredEligibleRecordCount: 5 as const,
  rejectedRecordCount: 1,
  futureExcludedRecordCount: 0,
  outsideWindowExcludedRecordCount: 1,
};

describe("EvidenceIntegritySnapshot presentation", () => {
  it("renders only server-provided available DLD evidence facts and explicit limits", () => {
    const result: EvidenceIntegrityResult = {
      status: "available",
      summary,
      provenance,
      observations: [
        {
          code: "eligible_evidence_available",
          recordCount: 5,
          records: provenance.records,
        },
      ],
    };

    const markup = renderToStaticMarkup(
      createElement(EvidenceIntegritySnapshot, { result })
    );

    expect(markup).toContain("FACT · Evidence available");
    expect(markup).toContain("5 eligible DLD records");
    expect(markup).toContain("Source");
    expect(markup).toContain("Reporting window");
    expect(markup).toContain("DLD");
    expect(markup).toContain("Evidence limits");
    expect(markup).toContain(
      "No valuation or price-per-sqm result is produced."
    );
    expect(markup).not.toContain("confidence score of");
  });

  it("renders insufficient evidence as unavailable without a synthetic substitute", () => {
    const result: EvidenceIntegrityResult = {
      status: "unavailable",
      reason: "insufficient_local_evidence",
      summary: { ...summary, eligibleRecordCount: 2 },
      provenance: { ...provenance, recordCount: 2, records: [] },
      observations: [
        {
          code: "insufficient_local_evidence",
          recordCount: 2,
          records: [],
        },
      ],
    };

    const markup = renderToStaticMarkup(
      createElement(EvidenceIntegritySnapshot, { result })
    );

    expect(markup).toContain("UNAVAILABLE · Evidence insufficient");
    expect(markup).toContain(
      "Found 2 eligible DLD records; this report requires 5."
    );
    expect(markup).toContain("No substitute evidence was used.");
    expect(markup).not.toContain("synthetic evidence");
  });
});
