/**
 * Comparable Selection v1.0 contracts.
 *
 * This module defines the governed selection hierarchy for evidence-led
 * comparable selection over eligible DLD transactions. It is intentionally
 * independent of the valuation engine, methodology v1.2, confidence
 * assessment, the public valuation API, Market Intelligence v1.0, and the
 * frozen Core Types surface. It extends the frozen `ComparableEvidence` and
 * `ComparableSearchResult` shapes additively rather than modifying them:
 * selection outcomes reuse those shapes, and the selection layer attaches
 * per-record exclusion explanations that no downstream component consumes
 * today.
 *
 * Governing facts this layer reuses without redefining:
 * - The minimum eligible local comparables policy (5) and the selection cap
 *   (12) originate in `server/valuation/comparable-search.ts`.
 * - The evidence-validation area floor (areaSqm > 10) is reused as the
 *   selection area guard; no new numeric threshold is invented.
 * - The search window constants ([90, 180, 365, 730] days) are reused as the
 *   temporal configuration space; the selection service operates on one
 *   configurable window at a time.
 *
 * Any selection rule not listed here is deliberately absent and is recorded
 * as UNRESOLVED_POLICY by the implementation; no fallback, benchmark,
 * coefficient, or weighting rule is invented.
 */

import type { ComparableEvidence } from "../server/valuation/evidence.contracts";

export const COMPARABLE_SELECTION_POLICY_VERSION = "CS-v1.0" as const;

export const COMPARABLE_SELECTION_MINIMUM_COUNT = 5 as const;
export const COMPARABLE_SELECTION_MAXIMUM_COUNT = 12 as const;
export const COMPARABLE_SELECTION_MINIMUM_AREA_SQM = 10 as const;

export type ComparableExclusionReason =
  | "ineligible_record"
  | "district_mismatch"
  | "type_mismatch"
  | "outside_window"
  | "area_out_of_range"
  | "ranked_out_of_capacity";

/** A candidate DLD transaction presented to the selection service. */
export type ComparableSelectionCandidate = {
  readonly sourceTransactionId: string;
  readonly transactionDate: Date;
  readonly district: string;
  readonly propertyType: ComparableEvidence["propertyType"];
  readonly areaSqm: number;
  readonly salePriceAed: number;
  readonly pricePerSqm: number;
  readonly evidenceStatus: "eligible" | "rejected";
};

/** The subject property facts admitted to the selection hierarchy. */
export type ComparableSelectionSubject = {
  readonly district: string;
  readonly propertyType: ComparableEvidence["propertyType"];
  readonly areaSqm: number;
  readonly asOf: Date;
};

/** Per-record explanation of why a candidate did not become a comparable. */
export type ComparableExclusion = {
  readonly sourceTransactionId: string;
  readonly transactionDate: Date;
  readonly areaSqm: number;
  readonly pricePerSqm: number;
  readonly reason: ComparableExclusionReason;
};

export type ComparableSelectionSearch = {
  readonly district: string;
  readonly propertyType: ComparableEvidence["propertyType"];
  readonly asOf: Date;
  readonly windowDays: number;
  readonly candidateCount: number;
  readonly eligibleLocalCount: number;
};

export type SelectedComparables = {
  readonly status: "selected";
  readonly comparables: readonly ComparableEvidence[];
  readonly excluded: readonly ComparableExclusion[];
  readonly search: ComparableSelectionSearch;
  readonly unresolvedPolicies: readonly string[];
};

export type InsufficientSelectedComparables = {
  readonly status: "insufficient";
  readonly comparables: readonly ComparableEvidence[];
  readonly excluded: readonly ComparableExclusion[];
  readonly search: ComparableSelectionSearch;
  readonly requiredCount: typeof COMPARABLE_SELECTION_MINIMUM_COUNT;
  readonly unresolvedPolicies: readonly string[];
};

export type ComparableSelectionOutcome =
  | SelectedComparables
  | InsufficientSelectedComparables;

/** Configuration surface for the selection hierarchy; all constants are governed elsewhere. */
export type ComparableSelectionConfiguration = {
  readonly windowDays: number;
  readonly minimumCount: typeof COMPARABLE_SELECTION_MINIMUM_COUNT;
  readonly maximumCount: typeof COMPARABLE_SELECTION_MAXIMUM_COUNT;
  readonly minimumAreaSqm: typeof COMPARABLE_SELECTION_MINIMUM_AREA_SQM;
};

export const COMPARABLE_SELECTION_DEFAULT_CONFIGURATION: ComparableSelectionConfiguration =
  {
    windowDays: 365,
    minimumCount: COMPARABLE_SELECTION_MINIMUM_COUNT,
    maximumCount: COMPARABLE_SELECTION_MAXIMUM_COUNT,
    minimumAreaSqm: COMPARABLE_SELECTION_MINIMUM_AREA_SQM,
  };

/**
 * Selection rules that remain unapproved by policy as of CS-v1.0. Each entry
 * is descriptive only; the service does not act on them, and no default
 * value, threshold, or weight is implied.
 */
export const COMPARABLE_SELECTION_UNRESOLVED_POLICIES: readonly string[] = [
  "Area similarity band between subject and candidate (no subject-to-candidate area rule is approved; the service filters only the shared evidence-validation floor).",
  "Price-outlier band within the candidate set (no diagnostic thresholds are approved while the Forensic Diagnostics policy gate remains open).",
  "Sub-type level matching on rawSubType (source-native field; no matching policy is approved).",
  "Secondary-attribute adjustment using project, finish, view, floor, rent, legal-rights, or zoning (governed Phase 2 gaps; inference is prohibited).",
  "Recency-versus-quantity weighting (no weighting rule beyond deterministic most-recent-first ranking is approved).",
] as const;
