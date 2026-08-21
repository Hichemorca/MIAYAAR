/**
 * Comparable Selection v1.0 — a deterministic, stateless selection service.
 *
 * This service ranks eligible DLD candidates against a subject property and
 * explains, per record, why each candidate did not become a comparable. It is
 * architecturally independent of the valuation engine, methodology v1.2,
 * confidence assessment, the public valuation API, Market Intelligence v1.0,
 * and the frozen comparable-search module: it reads in-memory candidates
 * (no database import), returns the frozen `ComparableEvidence` shape for
 * compatibility, and never mutates or consumes any downstream component.
 *
 * Selection hierarchy (documented and fixed by CS-v1.0):
 * 1. Eligibility guard — `evidenceStatus` must be "eligible".
 * 2. Locality guard — same district and same property type as the subject.
 * 3. Temporal window guard — transactionDate within the configured window
 *    relative to `asOf` (future records are never admitted).
 * 4. Area guard — areaSqm strictly greater than the shared
 *    evidence-validation floor of 10 sqm; no subject-relative band is
 *    applied because no such policy is approved.
 * 5. Deterministic ranking — ascending age (most recent first), with the
 *    lexicographic sourceTransactionId as a stable tie-break.
 * 6. Capacity cap — the first `maximumCount` ranked candidates are selected;
 *    all remaining candidates are recorded as `ranked_out_of_capacity`.
 *
 * Candidates passing guards but excluded by ranking appear in `excluded` with
 * reason `ranked_out_of_capacity`. No coefficient, benchmark, threshold, or
 * fallback rule is applied beyond the constants governed in the contract
 * module; unspecified rules are surfaced in `unresolvedPolicies`.
 */

import type { ComparableEvidence } from "./evidence.contracts";
import {
  COMPARABLE_SELECTION_DEFAULT_CONFIGURATION,
  COMPARABLE_SELECTION_UNRESOLVED_POLICIES,
  type ComparableExclusion,
  type ComparableSelectionCandidate,
  type ComparableSelectionConfiguration,
  type ComparableSelectionOutcome,
  type ComparableSelectionSearch,
  type ComparableSelectionSubject,
} from "../../contracts/comparable-selection.contracts";

const dayMs = 86_400_000;

function ageInDays(transactionDate: Date, asOf: Date): number {
  return Math.max(
    0,
    Math.floor((asOf.getTime() - transactionDate.getTime()) / dayMs)
  );
}

function isWithinWindow(
  transactionDate: Date,
  asOf: Date,
  windowDays: number
): boolean {
  const earliest = asOf.getTime() - windowDays * dayMs;
  return (
    transactionDate.getTime() >= earliest &&
    transactionDate.getTime() <= asOf.getTime()
  );
}

function toComparable(
  candidate: ComparableSelectionCandidate,
  asOf: Date
): ComparableEvidence {
  const ageDays = ageInDays(candidate.transactionDate, asOf);
  return {
    sourceTransactionId: candidate.sourceTransactionId,
    transactionDate: candidate.transactionDate,
    district: candidate.district,
    propertyType: candidate.propertyType,
    areaSqm: candidate.areaSqm,
    salePriceAed: candidate.salePriceAed,
    pricePerSqm: candidate.pricePerSqm,
    ageDays,
    timeAdjustedPricePerSqm: candidate.pricePerSqm,
  };
}

/**
 * Pure deterministic selection. Given identical inputs it always returns the
 * same outcome, independent of the order in which candidates are presented.
 */
export function selectComparables(
  candidates: readonly ComparableSelectionCandidate[],
  subject: ComparableSelectionSubject,
  configuration: ComparableSelectionConfiguration = COMPARABLE_SELECTION_DEFAULT_CONFIGURATION
): ComparableSelectionOutcome {
  const { district, propertyType, asOf } = subject;
  // `subject.areaSqm` is part of the governed subject contract for future
  // area-similarity policy; no subject-relative rule is approved by CS-v1.0.
  void subject.areaSqm;

  const selected: ComparableEvidence[] = [];
  const excluded: ComparableExclusion[] = [];

  const ranked = [...candidates].sort((left, right) => {
    const ageComparison =
      right.transactionDate.getTime() - left.transactionDate.getTime();
    if (ageComparison !== 0) return ageComparison;
    return left.sourceTransactionId < right.sourceTransactionId
      ? -1
      : left.sourceTransactionId > right.sourceTransactionId
        ? 1
        : 0;
  });

  let eligibleLocalCount = 0;

  for (const candidate of ranked) {
    if (candidate.evidenceStatus !== "eligible") {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "ineligible_record",
      });
      continue;
    }

    if (
      candidate.district.toUpperCase().replace(/\s+/g, " ") !==
      district.toUpperCase().replace(/\s+/g, " ")
    ) {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "district_mismatch",
      });
      continue;
    }

    if (candidate.propertyType !== propertyType) {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "type_mismatch",
      });
      continue;
    }

    eligibleLocalCount += 1;

    if (
      !isWithinWindow(candidate.transactionDate, asOf, configuration.windowDays)
    ) {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "outside_window",
      });
      continue;
    }

    if (candidate.areaSqm <= configuration.minimumAreaSqm) {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "area_out_of_range",
      });
      continue;
    }

    if (selected.length >= configuration.maximumCount) {
      excluded.push({
        sourceTransactionId: candidate.sourceTransactionId,
        transactionDate: candidate.transactionDate,
        areaSqm: candidate.areaSqm,
        pricePerSqm: candidate.pricePerSqm,
        reason: "ranked_out_of_capacity",
      });
      continue;
    }

    selected.push(toComparable(candidate, asOf));
  }

  const search: ComparableSelectionSearch = {
    district,
    propertyType,
    asOf,
    windowDays: configuration.windowDays,
    candidateCount: candidates.length,
    eligibleLocalCount,
  };

  const unresolvedPolicies = COMPARABLE_SELECTION_UNRESOLVED_POLICIES;

  if (selected.length >= configuration.minimumCount) {
    return {
      status: "selected",
      comparables: selected,
      excluded,
      search,
      unresolvedPolicies,
    };
  }

  return {
    status: "insufficient",
    comparables: selected,
    excluded,
    search,
    requiredCount: configuration.minimumCount,
    unresolvedPolicies,
  };
}
