import type { ComparableEvidence } from "../../valuation/evidence.contracts";

export type ConfidenceAssessment = {
  level: "high" | "moderate" | "low";
  basis: "valuation_range_width";
  rangeWidthPercent: number;
  evidence: { comparableCount: number; oldestComparableAgeDays: number };
  explanation: string;
};

/** The frozen methodology interprets confidence from the independently run valuation range. */
export function assessConfidence(input: { lowerValue: number; baselineValue: number; upperValue: number; comparables: readonly ComparableEvidence[] }): ConfidenceAssessment {
  const rangeWidthPercent = input.baselineValue > 0 ? ((input.upperValue - input.lowerValue) / input.baselineValue) * 100 : 0;
  const level = rangeWidthPercent <= 10 ? "high" : rangeWidthPercent <= 20 ? "moderate" : "low";
  const oldestComparableAgeDays = input.comparables.reduce((maximum, item) => Math.max(maximum, item.ageDays), 0);
  return {
    level,
    basis: "valuation_range_width",
    rangeWidthPercent: Math.round(rangeWidthPercent * 100) / 100,
    evidence: { comparableCount: input.comparables.length, oldestComparableAgeDays },
    explanation: `Confidence is ${level} because the valuation range width is ${rangeWidthPercent.toFixed(2)}%.`,
  };
}
