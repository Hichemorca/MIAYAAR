import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ComparableSelectionSnapshot } from "../../client/src/components/ComparableSelectionPanel";

const AS_OF = new Date("2026-08-20T00:00:00.000Z");

const selectedPreview = {
  status: "selected" as const,
  comparables: [
    {
      sourceTransactionId: "DLD-1001",
      transactionDate: new Date("2026-08-10T00:00:00.000Z"),
      district: "Business Bay",
      propertyType: "apartment" as const,
      areaSqm: 100,
      salePriceAed: 1_500_000,
      pricePerSqm: 15_000,
      ageDays: 10,
      timeAdjustedPricePerSqm: 15_000,
    },
  ],
  excluded: [
    {
      sourceTransactionId: "DLD-EXCLUDED",
      transactionDate: new Date("2026-08-10T00:00:00.000Z"),
      district: "Dubai Marina",
      propertyType: "apartment" as const,
      areaSqm: 100,
      salePriceAed: 1_600_000,
      pricePerSqm: 16_000,
      reason: "district_mismatch" as const,
    },
  ],
  search: {
    district: "Business Bay",
    propertyType: "apartment" as const,
    asOf: AS_OF,
    windowDays: 365,
    candidateCount: 2,
    eligibleLocalCount: 1,
  },
};

describe("ComparableSelectionSnapshot", () => {
  it("renders only selected and excluded facts returned by the server preview", () => {
    const markup = renderToStaticMarkup(
      <ComparableSelectionSnapshot preview={selectedPreview} state="ready" />
    );

    expect(markup).toContain("Comparables selected");
    expect(markup).toContain("DLD-1001");
    expect(markup).toContain("DLD-EXCLUDED");
    expect(markup).toContain("district_mismatch");
    expect(markup).toContain("Selected comparables");
    expect(markup).toContain("Excluded candidates");
    expect(markup).not.toContain("confidence level");
    expect(markup).not.toContain("fallback");
  });

  it("renders the existing insufficient outcome as unavailable without an invented replacement", () => {
    const markup = renderToStaticMarkup(
      <ComparableSelectionSnapshot
        preview={{
          ...selectedPreview,
          status: "insufficient",
          requiredCount: 5,
        }}
        state="ready"
      />
    );

    expect(markup).toContain("Comparable Selection unavailable");
    expect(markup).toContain("UNAVAILABLE");
    expect(markup).toContain("CS-v1.0 requires 5");
    expect(markup).not.toContain("city-wide");
  });

  it("renders a generic unavailable boundary when no server preview arrives", () => {
    const markup = renderToStaticMarkup(
      <ComparableSelectionSnapshot state="error" />
    );

    expect(markup).toContain("Comparable Selection Unavailable");
    expect(markup).toContain("No comparable was created by the interface.");
  });
});
