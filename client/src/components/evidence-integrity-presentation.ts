import type {
  EvidenceIntegrityResult,
  EvidenceIntegritySummary,
} from "../../../contracts/evidence-integrity.contracts";

export type EvidenceIntegrityUiState =
  | "idle"
  | "validation"
  | "loading"
  | "error"
  | "available"
  | "unavailable";

type EvidenceIntegrityUiStateInput = {
  hasRequested: boolean;
  hasInvalidAsOf: boolean;
  isPending: boolean;
  isError: boolean;
  result?: EvidenceIntegrityResult;
};

export function getEvidenceIntegrityUiState({
  hasRequested,
  hasInvalidAsOf,
  isPending,
  isError,
  result,
}: EvidenceIntegrityUiStateInput): EvidenceIntegrityUiState {
  if (hasRequested && hasInvalidAsOf) return "validation";
  if (!hasRequested) return "idle";
  if (isError) return "error";
  if (isPending || !result) return "loading";
  return result.status;
}

export function getEvidenceIntegrityHeading(state: EvidenceIntegrityUiState) {
  const headings = {
    idle: "Inspect the DLD evidence record before relying on it.",
    validation: "Choose a valid as-of date to inspect the evidence record.",
    loading: "Inspecting the local DLD evidence record…",
    error: "The evidence record could not be retrieved.",
    available: "Eligible local DLD evidence is available.",
    unavailable: "Local DLD evidence is insufficient for this scope.",
  } as const;

  return headings[state];
}

export function getEvidenceIntegritySummary(
  result: EvidenceIntegrityResult
): string {
  const summary = result.summary;
  if (result.status === "available") {
    return `${summary.eligibleRecordCount} eligible DLD records are available in the approved 90-day reporting window.`;
  }

  return `Found ${summary.eligibleRecordCount} eligible DLD records; this report requires ${summary.requiredEligibleRecordCount}. No substitute evidence was used.`;
}

export function getEvidenceIntegrityMetrics(summary: EvidenceIntegritySummary) {
  return [
    { label: "Eligible", value: summary.eligibleRecordCount },
    { label: "Required", value: summary.requiredEligibleRecordCount },
    { label: "Rejected", value: summary.rejectedRecordCount },
    {
      label: "Time exclusions",
      value:
        summary.futureExcludedRecordCount +
        summary.outsideWindowExcludedRecordCount,
    },
  ] as const;
}

export function parseAsOfDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const asOf = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(asOf.getTime()) ? null : asOf;
}
