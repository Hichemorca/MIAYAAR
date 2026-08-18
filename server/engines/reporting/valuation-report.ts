import type { ComparableSearchResult } from "../../valuation/evidence.contracts";
import type { RuleEvaluation } from "../rules/property-adjustments";
import type { DeterministicValuation } from "../valuation/deterministic";
import type { ConfidenceAssessment } from "../confidence/confidence";
import type { MethodologyConfiguration, PropertySubmission } from "@shared/valuation/contracts";

export type ValuationReport = {
  status: "completed" | "partial" | "rejected";
  methodology: { documentId: string; version: string };
  property: PropertySubmission;
  evidence: ComparableSearchResult;
  rules?: RuleEvaluation;
  valuation?: DeterministicValuation;
  confidence?: ConfidenceAssessment;
  warnings: string[];
};

/** Presentation-ready report assembly only; all analytics are completed by earlier engines. */
export function assembleReport(input: Omit<ValuationReport, "methodology"> & { configuration: MethodologyConfiguration }): ValuationReport {
  return {
    status: input.status,
    methodology: { documentId: input.configuration.documentId, version: input.configuration.version },
    property: input.property,
    evidence: input.evidence,
    rules: input.rules,
    valuation: input.valuation,
    confidence: input.confidence,
    warnings: input.warnings,
  };
}
