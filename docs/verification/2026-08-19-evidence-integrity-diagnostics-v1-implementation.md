# Evidence Integrity Diagnostics v1.0 — Implementation Verification

**Date:** 2026-08-19
**Implementation branch:** `feature/evidence-integrity-v1`
**Base revision:** `bf8b99ef58e96b978439cc2c01d16559e91fbe5f`
**Policy:** [`EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md`](../policies/EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md)

## Scope delivered

This change implements the owner-approved Evidence Integrity Diagnostics v1.0 policy as a read-only, server-side facts layer. It records DLD evidence availability and temporal eligibility; it does not claim that a price is erroneous, classify a transaction as special, calculate an outlier score, or produce a confidence score.

| Component    | File                                                           | Responsibility                                                                                                                               |
| ------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy       | `docs/policies/EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md`       | Records the DLD-only facts policy, the ninety-day window, and non-interference limits.                                                       |
| Contract     | `contracts/evidence-integrity.contracts.ts`                    | Defines scope, factual records, fixed observation codes, availability, provenance, provider boundary, and response shapes.                   |
| DLD provider | `server/evidence-integrity/dld-evidence-integrity-provider.ts` | Reads only eligible and rejected DLD evidence fields without selecting price fields or writing storage.                                      |
| Service      | `engines/evidence-integrity/evidence-integrity.service.ts`     | Applies the inclusive ninety-day and `asOf` filters defensively, returns factual observation states, and constructs record-level provenance. |
| Tests        | `server/evidence-integrity/*.test.ts`                          | Verifies service facts, provider mapping, provenance, time boundaries, missing evidence, and architectural independence.                     |

## Factual behavior

The service accepts explicit `district`, `propertyType`, and `asOf`. It keeps the local scope fixed, uses DLD evidence only, and distinguishes five facts: eligible evidence is available, local evidence is insufficient, evidence was excluded because it is future-dated, evidence was excluded because it is outside the ninety-day historical window, and rejected DLD evidence was observed.

| Condition                                                           | Response behavior                                                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| At least five eligible DLD records fall in `[asOf - 90 days, asOf]` | `available` with factual observations and provenance only.                                                   |
| Fewer than five eligible records fall in the local scope and window | `unavailable` with `insufficient_local_evidence`; no numeric surrogate, score, or classification is emitted. |
| Record has `transactionDate > asOf`                                 | It is excluded and recorded as `future_dated_evidence_excluded`.                                             |
| Record has `transactionDate < asOf - 90 days`                       | It is excluded and recorded as `outside_window_evidence_excluded`.                                           |
| Record is rejected by DLD                                           | It is not reclassified; its stored rejection reason is preserved in `rejected_evidence_observed`.            |

Every result contains `EID-v1.0`, the source, filters, record counts, record-level source transaction identifiers, checksums, transaction dates, and ingestion timestamps. No fallback, geographic expansion, or valuation integration exists in this version.

## Boundary confirmation

The service and provider do not import the valuation engine, methodology v1.2, confidence module, comparable search, valuation orchestrator, or Market Intelligence module. They do not add a router, endpoint, UI, dashboard, migration, data write, rating, or pricing feature. The implementation therefore cannot change `actualSalePrice`, valuation output, methodology weights, coefficients, comparable selection, or confidence thresholds.

## Verification evidence

| Command                                                                                                                                               | Result                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `pnpm exec vitest run server/evidence-integrity/evidence-integrity.service.test.ts server/evidence-integrity/dld-evidence-integrity-provider.test.ts` | Passed: 2 test files and 7 focused tests.                                         |
| `pnpm check`                                                                                                                                          | Passed: TypeScript emitted no errors.                                             |
| `pnpm test`                                                                                                                                           | Passed: 23 test files and 79 tests.                                               |
| `pnpm build`                                                                                                                                          | Passed: Vite client build and server bundle succeeded.                            |
| `pnpm exec prettier --check …`                                                                                                                        | Passed for the Evidence Integrity policy, contract, provider, service, and tests. |
| `git diff --check`                                                                                                                                    | Passed: no whitespace errors.                                                     |

The tests cover available evidence, insufficient local evidence, absence of synthetic statistics/scores/classifications, inclusive time-window boundaries, future-data exclusion, rejected-evidence provenance, fixed local scope, provider field minimisation, storage-unavailable failure, and structural independence.

## Explicitly deferred

Price-error claims, statistical outlier classification, special-transaction labels, confidence scoring, fallback expansion, valuation integration, API exposure, diagnostics UI, dashboard, data migration, and any mutation of evidence remain outside this pull request. Each requires a later approved policy and a separate governed scope.
