import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../db";
import { DldEvidenceIntegrityProvider } from "./dld-evidence-integrity-provider";

vi.mock("../db", () => ({ getDb: vi.fn() }));

const mockedGetDb = vi.mocked(getDb);

function createReadOnlyDb(rows: readonly Record<string, unknown>[]) {
  const orderBy = vi.fn(async () => rows);
  const where = vi.fn(() => ({ orderBy }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  return { db: { select }, select, from, where, orderBy };
}

describe("DldEvidenceIntegrityProvider", () => {
  beforeEach(() => vi.resetAllMocks());

  it("performs a read-only scoped DLD lookup and maps only factual evidence fields", async () => {
    const row = {
      source: "DLD",
      sourceTransactionId: "tx-1",
      sourceChecksum: "checksum-tx-1",
      transactionDate: new Date("2026-08-18T00:00:00.000Z"),
      district: "DUBAI MARINA",
      propertyType: "apartment",
      evidenceStatus: "eligible",
      rejectionReason: null,
      ingestedAt: new Date("2026-08-20T00:00:00.000Z"),
      salePriceAed: 999_999,
      pricePerSqm: 99_999,
    };
    const fake = createReadOnlyDb([row]);
    mockedGetDb.mockResolvedValue(fake.db as never);

    const records = await new DldEvidenceIntegrityProvider().listDldEvidence({
      source: "DLD",
      district: "DUBAI MARINA",
      propertyType: "apartment",
    });

    expect(fake.select).toHaveBeenCalledTimes(1);
    expect(fake.from).toHaveBeenCalledTimes(1);
    expect(fake.where).toHaveBeenCalledTimes(1);
    expect(fake.orderBy).toHaveBeenCalledTimes(1);
    expect(records).toEqual([
      {
        source: "DLD",
        sourceTransactionId: "tx-1",
        sourceChecksum: "checksum-tx-1",
        transactionDate: new Date("2026-08-18T00:00:00.000Z"),
        district: "DUBAI MARINA",
        propertyType: "apartment",
        evidenceStatus: "eligible",
        rejectionReason: null,
        ingestedAt: new Date("2026-08-20T00:00:00.000Z"),
      },
    ]);
    expect(records[0]).not.toHaveProperty("salePriceAed");
    expect(records[0]).not.toHaveProperty("pricePerSqm");
  });

  it("fails explicitly when read-only DLD storage is unavailable", async () => {
    mockedGetDb.mockResolvedValue(null);

    await expect(
      new DldEvidenceIntegrityProvider().listDldEvidence({
        source: "DLD",
        district: "DUBAI MARINA",
        propertyType: "apartment",
      })
    ).rejects.toThrow("Evidence integrity evidence storage is unavailable.");
  });
});
