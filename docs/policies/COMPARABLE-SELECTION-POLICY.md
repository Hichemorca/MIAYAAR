# Comparable Selection Policy — CS-v1.0

**Status:** IMPLEMENTED
**Date:** 2026-08-20
**Scope:** Deterministic comparable selection over eligible DLD evidence; no valuation, methodology, confidence, API, UI, or Market Intelligence change.
**Governance lineage:** Phase 2 DLD Evidence Completeness Review (2026-08-20), Market Intelligence v1.0 policy, Evidence Integrity Diagnostics v1.0 facts-only policy, Core Types Freeze acceptance (PR #45), NSE-RG-v1.0 (SRC-001 HOLD), owner-approved Phase 4 scope of 2026-08-20.

## 1. Purpose and position

Comparable Selection v1.0 ranks eligible DLD transactions against a subject property and attaches a per-record exclusion explanation to every candidate that does not become a comparable. It is a standalone, stateless, deterministic service operating on in-memory evidence; it imports no database module, is imported by no valuation component, and does not consume or produce Market Intelligence, confidence, valuation engine, or API output artefacts. The frozen `ComparableEvidence` and `ComparableSearchResult` shapes are reused additively, and the frozen Core Types surface (`core/types`, `core/results`, `core/contracts`, `engines/valuation`) is untouched.

## 2. Selection hierarchy

The service applies the following fixed guard sequence, documented here exactly as implemented in `server/valuation/comparable-selection.ts` and contracted in `contracts/comparable-selection.contracts.ts`. No other rule exists.

| Step | Guard           | Rule                                                                                                | Governing source                                                                                                       |
| ---- | --------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1    | Eligibility     | `evidenceStatus` must be `"eligible"`                                                               | Phase 2 evidence pipeline                                                                                              |
| 2    | Locality        | Same district and same `propertyType` as the subject                                                | MI v1.0 district-plus-property-type policy (city-wide broadening refused)                                              |
| 3    | Temporal window | `asOf - windowDays <= transactionDate <= asOf`; future records never admitted                       | Phase 2 temporal-window facts; default window 365 days from the comparable-search constant space `[90, 180, 365, 730]` |
| 4    | Area floor      | `areaSqm > 10`                                                                                      | Shared evidence-validation floor; no subject-relative band                                                             |
| 5    | Ranking         | Ascending age (most recent first); tie-break by lexicographic `sourceTransactionId` for determinism | Determinism requirement                                                                                                |
| 6    | Capacity        | First 12 ranked candidates selected; remainder excluded as `ranked_out_of_capacity`                 | Existing comparable-search cap (minimum 5, maximum 12)                                                                 |

## 3. Exclusion taxonomy

Every candidate not selected carries one `ComparableExclusion` record containing `sourceTransactionId`, `transactionDate`, `areaSqm`, `pricePerSqm`, and exactly one `ComparableExclusionReason`:

| Reason                   | Meaning                                                              |
| ------------------------ | -------------------------------------------------------------------- |
| `ineligible_record`      | Candidate is not eligible evidence                                   |
| `district_mismatch`      | District differs from the subject                                    |
| `type_mismatch`          | Property type differs from the subject                               |
| `outside_window`         | Transaction date outside the configured window relative to `asOf`    |
| `area_out_of_range`      | Area at or below the 10 sqm floor                                    |
| `ranked_out_of_capacity` | Candidate passed all guards but ranked beyond the 12-record capacity |

Records passing all guards but displaced by ranking are **not** silently dropped; they appear in the exclusion set, making the selection auditable end to end.

## 4. Outcomes

The outcome is a discriminated union: `selected` (at least 5 comparables) or `insufficient` (fewer than 5, with the governed `requiredCount` of 5), both carrying the complete selected set, the full exclusion list, immutable search metadata (`district`, `propertyType`, `asOf`, `windowDays`, `candidateCount`, `eligibleLocalCount`), and the live `unresolvedPolicies` list.

## 5. Governing gaps preserved (no inference)

Secondary attributes remain excluded from selection exactly as governed by the Phase 2 evidence completeness review: `project`, `finish`, `view`, `floor`, `rent`, `legal-rights`, and `zoning` are neither filtered on nor inferred for, and the service never reads them. Sub-type (`rawSubType`) is preserved source-native and unused.

## 6. Unresolved policy (UNRESOLVED_POLICY)

The following selection rules are explicitly **not** defined by CS-v1.0. The service performs no default, fallback, threshold, or weighting in these areas; each is recorded live in the outcome.

1. **Area similarity band** between subject and candidate — no subject-to-candidate area rule is approved; only the shared 10 sqm floor applies.
2. **Price-outlier band** within the candidate set — no diagnostic thresholds are approved while the Forensic Diagnostics policy gate remains open.
3. **Sub-type level matching** on `rawSubType` — source-native field with no approved matching policy.
4. **Secondary-attribute adjustment** (project, finish, view, floor, rent, legal-rights, zoning) — governed Phase 2 gaps; inference is prohibited.
5. **Recency-versus-quantity weighting** — no weighting rule beyond deterministic most-recent-first ranking is approved.

## 7. Non-interference attestation

This policy and its implementation: do not modify `engines/valuation` (methodology v1.2, weights, coefficients, comparable selection rules of the canonical engine); do not modify `core/types`, `core/results`, `core/contracts`, or their governing interfaces; do not modify `valuation.run`, its rate limits, or its public response shape; do not modify `server/valuation/comparable-search.ts`, `Market Intelligence v1.0`, `Evidence Integrity Diagnostics v1.0`, `confidence`, `valuation-report`, the orchestrator, or the database schema and data; do not introduce any new benchmark, coefficient, threshold, fallback rule, or vocabulary.

## 8. Verification record

Implementation is verified before pull-request submission with `pnpm check`, `pnpm test`, `pnpm build`, `pnpm format:check`, and `git diff --check`. GitHub CI and Netlify Deploy Preview must also pass on the documentation and implementation pull request before the owner considers merging it.
