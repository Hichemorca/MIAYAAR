import type { EvidenceIntegrityRequest } from "../../../contracts/evidence-integrity.contracts";
import type { ValuationReport } from "../../../server/engines/reporting/valuation-report";

type ValuationEvidenceContext = Pick<ValuationReport, "property" | "evidence">;

/**
 * Creates a read-only Evidence Integrity request from the evidence context
 * already preserved in a completed valuation report. It does not read or
 * transform any valuation result, confidence assessment, or methodology data.
 */
export function getCompletedValuationEvidenceContext(
  report: ValuationEvidenceContext
): EvidenceIntegrityRequest {
  return {
    district: report.property.district,
    propertyType: report.property.propertyType,
    asOf: new Date(report.evidence.search.asOf.getTime()),
  };
}
