/**
 * Evidence Integrity Diagnostics v1.0 contracts.
 *
 * This module describes factual DLD evidence observations only. It is
 * intentionally independent of valuation, confidence, and market-intelligence
 * contracts so it cannot influence a valuation result.
 */

export const EVIDENCE_INTEGRITY_POLICY_VERSION = "EID-v1.0" as const;
export const EVIDENCE_INTEGRITY_WINDOW_DAYS = 90 as const;
export const EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS = 5 as const;

export type EvidenceIntegrityPropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "office"
  | "retail"
  | "land"
  | "warehouse";

export type EvidenceIntegrityRequest = {
  readonly district: string;
  readonly propertyType: EvidenceIntegrityPropertyType;
  readonly asOf: Date;
};

export type EvidenceIntegrityScope = {
  readonly source: "DLD";
  readonly district: string;
  readonly propertyType: EvidenceIntegrityPropertyType;
};

export type EvidenceIntegrityFilters = EvidenceIntegrityScope & {
  readonly from: Date;
  readonly asOf: Date;
};

/** The factual DLD fields permitted to enter Evidence Integrity v1.0. */
export type EvidenceIntegrityEvidenceRecord = {
  readonly source: "DLD";
  readonly sourceTransactionId: string;
  readonly sourceChecksum: string;
  readonly transactionDate: Date;
  readonly district: string;
  readonly propertyType: EvidenceIntegrityPropertyType;
  readonly evidenceStatus: "eligible" | "rejected";
  readonly rejectionReason: string | null;
  readonly ingestedAt: Date;
};

export type EvidenceIntegrityRecordProvenance = Pick<
  EvidenceIntegrityEvidenceRecord,
  | "sourceTransactionId"
  | "sourceChecksum"
  | "transactionDate"
  | "ingestedAt"
  | "evidenceStatus"
  | "rejectionReason"
>;

export type EvidenceIntegrityProvenance = {
  readonly source: "DLD";
  readonly policyVersion: typeof EVIDENCE_INTEGRITY_POLICY_VERSION;
  readonly asOf: Date;
  readonly filters: EvidenceIntegrityFilters;
  readonly recordCount: number;
  readonly records: readonly EvidenceIntegrityRecordProvenance[];
  readonly sourceTransactionIds: readonly string[];
  readonly sourceChecksums: readonly string[];
};

export type EvidenceIntegrityObservationCode =
  | "eligible_evidence_available"
  | "insufficient_local_evidence"
  | "future_dated_evidence_excluded"
  | "outside_window_evidence_excluded"
  | "rejected_evidence_observed";

export type EvidenceIntegrityObservation = {
  readonly code: EvidenceIntegrityObservationCode;
  readonly recordCount: number;
  readonly records: readonly EvidenceIntegrityRecordProvenance[];
};

export type EvidenceIntegritySummary = {
  readonly eligibleRecordCount: number;
  readonly requiredEligibleRecordCount: typeof EVIDENCE_INTEGRITY_MINIMUM_ELIGIBLE_RECORDS;
  readonly rejectedRecordCount: number;
  readonly futureExcludedRecordCount: number;
  readonly outsideWindowExcludedRecordCount: number;
};

export type AvailableEvidenceIntegrityResult = {
  readonly status: "available";
  readonly observations: readonly EvidenceIntegrityObservation[];
  readonly summary: EvidenceIntegritySummary;
  readonly provenance: EvidenceIntegrityProvenance;
};

export type UnavailableEvidenceIntegrityResult = {
  readonly status: "unavailable";
  readonly reason: "insufficient_local_evidence";
  readonly observations: readonly EvidenceIntegrityObservation[];
  readonly summary: EvidenceIntegritySummary;
  readonly provenance: EvidenceIntegrityProvenance;
};

export type EvidenceIntegrityResult =
  | AvailableEvidenceIntegrityResult
  | UnavailableEvidenceIntegrityResult;

/** A server-side, read-only source of DLD evidence in one request scope. */
export interface EvidenceIntegrityEvidenceProvider {
  listDldEvidence(
    scope: EvidenceIntegrityScope
  ): Promise<readonly EvidenceIntegrityEvidenceRecord[]>;
}
