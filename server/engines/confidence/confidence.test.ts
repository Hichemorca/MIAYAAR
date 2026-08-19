import { describe, expect, it } from "vitest";
import { assessConfidence } from "./confidence";

describe("assessConfidence", () => {
  it("derives confidence from the independently computed scenario range", () => {
    const result = assessConfidence({ lowerValue: 950_000, baselineValue: 1_000_000, upperValue: 1_050_000, comparables: [{ ageDays: 80 }] as never });
    expect(result.level).toBe("high");
    expect(result.basis).toBe("valuation_range_width");
    expect(result.rangeWidthPercent).toBe(10);
  });
});
