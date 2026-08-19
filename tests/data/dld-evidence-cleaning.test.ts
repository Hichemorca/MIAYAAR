import { describe, expect, test } from "vitest";
import { cleanDldRecords } from "../../scripts/lib/dld-evidence-cleaning.mjs";

const validRecord = {
  id: "tx-100",
  d: "2026-01-15",
  t: "Apartment",
  s: "Residential",
  a: 98,
  p: 1_250_000,
  x: "Jumeirah Village Circle",
};

describe("DLD evidence cleaning", () => {
  test("retains the first transaction, emits a duplicate issue, and leaves the supplied raw records untouched", () => {
    const source = [validRecord, { ...validRecord, p: 1_300_000 }];
    const before = JSON.stringify(source);

    const cleaned = cleanDldRecords(source);

    expect(cleaned.cleanedRecords).toHaveLength(1);
    expect(cleaned.summary.duplicateTransactionIds).toBe(1);
    expect(cleaned.issues).toContainEqual(expect.objectContaining({
      issueType: "duplicate",
      sourceTransactionId: "dld:tx-100",
    }));
    expect(JSON.stringify(source)).toBe(before);
  });

  test("records invalid input and policy-rejected evidence separately", () => {
    const cleaned = cleanDldRecords([
      { ...validRecord, id: "invalid", a: 0 },
      { ...validRecord, id: "ultra", p: 60_000_000 },
    ]);

    expect(cleaned.summary.skipped).toBe(1);
    expect(cleaned.summary.rejected).toBe(1);
    expect(cleaned.cleanedRecords).toHaveLength(1);
    expect(cleaned.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ issueType: "invalid", reason: "invalid_area_sqm" }),
      expect.objectContaining({ issueType: "rejected", reason: "ultra_luxury" }),
    ]));
  });
});
