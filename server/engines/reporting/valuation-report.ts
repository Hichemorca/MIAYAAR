import type { ConfidenceAssessment } from "../confidence/confidence";
import type { PropertySubmission } from "@shared/valuation/contracts";
import type { Valuation } from "../../../core/types";
import type { ComparableSearchResult } from "../../valuation/evidence.contracts";

export type ValuationReport = {
  status: "completed" | "partial" | "rejected";
  methodology: { documentId: string; version: string };
  property: PropertySubmission;
  evidence: ComparableSearchResult;
  valuation?: Valuation;
  confidence?: ConfidenceAssessment;
  warnings: string[];
};

/** Presentation-ready report assembly only; all calculations are completed by the canonical engine. */
export function assembleReport(input: Omit<ValuationReport, "methodology"> & { configuration: { documentId: string; version: string } }): ValuationReport {
  return {
    status: input.status,
    methodology: { documentId: input.configuration.documentId, version: input.configuration.version },
    property: input.property,
    evidence: input.evidence,
    valuation: input.valuation,
    confidence: input.confidence,
    warnings: input.warnings,
  };
}
