/**
 * Read-only DLD adapter for Comparable Selection v1.0 presentation.
 *
 * This adapter supplies the existing deterministic CS-v1.0 service with DLD
 * transaction candidates. It does not alter candidate facts, selection guards,
 * ranking, configured constants, valuation, confidence, or fallbacks.
 */

import type {
  ComparableExclusionReason,
  ComparableSelectionOutcome,
  ComparableSelectionSubject,
} from "../../contracts/comparable-selection.contracts";
import { listDldComparableSelectionCandidates } from "../db";
import { selectComparables } from "../valuation/comparable-selection";

export type ComparableSelectionPreviewExclusion = {
  readonly sourceTransactionId: string;
  readonly transactionDate: Date;
  readonly district: string;
  readonly propertyType: ComparableSelectionSubject["propertyType"];
  readonly areaSqm: number;
  readonly salePriceAed: number;
  readonly pricePerSqm: number;
  readonly reason: ComparableExclusionReason;
};

export type ComparableSelectionPreview = {
  readonly status: ComparableSelectionOutcome["status"];
  readonly comparables: ComparableSelectionOutcome["comparables"];
  readonly excluded: readonly ComparableSelectionPreviewExclusion[];
  readonly search: ComparableSelectionOutcome["search"];
  readonly requiredCount?: number;
};

function presentOutcome(
  outcome: ComparableSelectionOutcome,
  candidates: Awaited<ReturnType<typeof listDldComparableSelectionCandidates>>
): ComparableSelectionPreview {
  const candidatesById = new Map(
    candidates.map(candidate => [candidate.sourceTransactionId, candidate])
  );

  const excluded = outcome.excluded.map(exclusion => {
    const candidate = candidatesById.get(exclusion.sourceTransactionId);
    if (!candidate) {
      throw new Error(
        "Comparable Selection preview could not locate a server-returned candidate."
      );
    }

    return {
      sourceTransactionId: candidate.sourceTransactionId,
      transactionDate: candidate.transactionDate,
      district: candidate.district,
      propertyType: candidate.propertyType,
      areaSqm: candidate.areaSqm,
      salePriceAed: candidate.salePriceAed,
      pricePerSqm: candidate.pricePerSqm,
      reason: exclusion.reason,
    } satisfies ComparableSelectionPreviewExclusion;
  });

  return outcome.status === "insufficient"
    ? {
        status: outcome.status,
        comparables: outcome.comparables,
        excluded,
        search: outcome.search,
        requiredCount: outcome.requiredCount,
      }
    : {
        status: outcome.status,
        comparables: outcome.comparables,
        excluded,
        search: outcome.search,
      };
}

export class DldComparableSelectionPreviewService {
  async preview(
    subject: ComparableSelectionSubject
  ): Promise<ComparableSelectionPreview> {
    const candidates = await listDldComparableSelectionCandidates();
    return presentOutcome(selectComparables(candidates, subject), candidates);
  }
}
