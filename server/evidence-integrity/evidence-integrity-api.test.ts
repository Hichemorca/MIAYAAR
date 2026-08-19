import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EvidenceIntegrityEvidenceRecord } from "../../contracts/evidence-integrity.contracts";
import type { TrpcContext } from "../_core/context";

const { executeValuation, listDldEvidence } = vi.hoisted(() => ({
  executeValuation: vi.fn(),
  listDldEvidence: vi.fn(),
}));

vi.mock("../engines/orchestrator/valuation-orchestrator", () => ({
  executeValuation,
}));

vi.mock("./dld-evidence-integrity-provider", () => ({
  DldEvidenceIntegrityProvider: class {
    listDldEvidence = listDldEvidence;
  },
}));

import { appRouter } from "../routers";

const AS_OF = new Date("2026-08-01T00:00:00.000Z");

function record(
  sourceTransactionId: string,
  overrides: Partial<EvidenceIntegrityEvidenceRecord> = {}
): EvidenceIntegrityEvidenceRecord {
  return {
    source: "DLD",
    sourceTransactionId,
    sourceChecksum: `checksum-${sourceTransactionId}`,
    transactionDate: new Date("2026-07-15T00:00:00.000Z"),
    district: "Downtown Dubai",
    propertyType: "apartment",
    evidenceStatus: "eligible",
    rejectionReason: null,
    ingestedAt: new Date("2026-07-16T00:00:00.000Z"),
    ...overrides,
  };
}

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

describe("evidenceIntegrity.report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns DLD-only factual observations with complete record provenance", async () => {
    listDldEvidence.mockResolvedValue([
      record("DLD-001"),
      record("DLD-002"),
      record("DLD-003"),
      record("DLD-004"),
      record("DLD-005"),
      record("DLD-FUTURE", {
        transactionDate: new Date("2026-08-02T00:00:00.000Z"),
      }),
      record("DLD-OUTSIDE", {
        transactionDate: new Date("2026-04-30T00:00:00.000Z"),
      }),
      record("DLD-REJECTED", {
        evidenceStatus: "rejected",
        rejectionReason: "source_record_rejected",
      }),
    ]);

    const result = await appRouter
      .createCaller(createPublicContext())
      .evidenceIntegrity.report({
        district: "Downtown Dubai",
        propertyType: "apartment",
        asOf: AS_OF,
      });

    expect(listDldEvidence).toHaveBeenCalledWith({
      source: "DLD",
      district: "Downtown Dubai",
      propertyType: "apartment",
    });
    expect(executeValuation).not.toHaveBeenCalled();
    expect(result.status).toBe("available");
    expect(result.summary).toMatchObject({
      eligibleRecordCount: 5,
      rejectedRecordCount: 1,
      futureExcludedRecordCount: 1,
      outsideWindowExcludedRecordCount: 1,
    });
    expect(result.provenance).toMatchObject({
      source: "DLD",
      policyVersion: "EID-v1.0",
      asOf: AS_OF,
      recordCount: 8,
      sourceTransactionIds: [
        "DLD-OUTSIDE",
        "DLD-001",
        "DLD-002",
        "DLD-003",
        "DLD-004",
        "DLD-005",
        "DLD-REJECTED",
        "DLD-FUTURE",
      ],
    });
    expect(result.provenance.records).toContainEqual(
      expect.objectContaining({
        sourceTransactionId: "DLD-001",
        sourceChecksum: "checksum-DLD-001",
        evidenceStatus: "eligible",
      })
    );
  });

  it("returns the governed unavailable state when the local eligible sample is insufficient", async () => {
    listDldEvidence.mockResolvedValue([
      record("DLD-001"),
      record("DLD-002"),
      record("DLD-003"),
      record("DLD-004"),
    ]);

    const result = await appRouter
      .createCaller(createPublicContext())
      .evidenceIntegrity.report({
        district: "Downtown Dubai",
        propertyType: "apartment",
        asOf: AS_OF,
      });

    expect(result).toMatchObject({
      status: "unavailable",
      reason: "insufficient_local_evidence",
      summary: {
        eligibleRecordCount: 4,
        requiredEligibleRecordCount: 5,
      },
    });
    expect(executeValuation).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty("confidence");
    expect(result).not.toHaveProperty("priceClassification");
  });

  it("rejects malformed, missing, and unsupported scoped inputs", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await expect(
      caller.evidenceIntegrity.report({
        district: "",
        propertyType: "apartment",
        asOf: AS_OF,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      caller.evidenceIntegrity.report({
        district: "Downtown Dubai",
        propertyType: "apartment",
        asOf: "not-a-date",
      } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      caller.evidenceIntegrity.report({
        district: "Downtown Dubai",
        propertyType: "apartment",
        asOf: AS_OF,
        areaSqm: 100,
      } as never)
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
