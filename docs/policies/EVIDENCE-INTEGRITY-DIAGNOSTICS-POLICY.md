# Evidence Integrity Diagnostics Policy v1.0

**Status:** Approved
**Effective date:** 2026-08-19
**Owner decision:** Approved scope: facts-only DLD evidence integrity diagnostics.
**Policy version:** `EID-v1.0`

## Purpose

Evidence Integrity Diagnostics v1.0 reports whether DLD evidence is eligible for a governed local evidence window. It is a read-only, server-side layer that describes evidence facts. It does not determine whether a transaction price is correct, fair, anomalous, special, related-party, or suitable for a valuation adjustment.

## Source and scope

The sole permitted source is the existing DLD transaction evidence. The request scope is one `district`, one `propertyType`, and an explicit `asOf` timestamp. The policy evaluates the inclusive 90-calendar-day interval from `asOf - 90 days` through `asOf`.

| Observation                        | Deterministic rule                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `eligible_evidence_available`      | At least five DLD records are `eligible` after applying the request scope and time window.                                   |
| `insufficient_local_evidence`      | Fewer than five DLD records are `eligible` after applying the request scope and time window.                                 |
| `future_dated_evidence_excluded`   | A scoped record has `transactionDate > asOf`; it is excluded from eligibility.                                               |
| `outside_window_evidence_excluded` | A scoped record has `transactionDate < asOf - 90 days`; it is excluded from eligibility.                                     |
| `rejected_evidence_observed`       | A scoped record inside the window has `evidenceStatus = rejected`; its stored rejection reason is reported as a source fact. |
| `not_assessed`                     | A proposed observation has no policy rule or permitted source field. No score or substitute classification is emitted.       |

## Availability and provenance

The response is `available` only when the eligibility rule is satisfied. Otherwise it is `unavailable` with `insufficient_local_evidence`; it must not emit a synthetic benchmark, numeric score, price quality judgment, or confidence score.

Each response records `source`, `policyVersion`, `asOf`, the request filters, and record-level `sourceTransactionId`, `sourceChecksum`, `transactionDate`, `ingestedAt`, `evidenceStatus`, and stored `rejectionReason` where applicable. This preserves the provenance of included and excluded evidence without deriving an unrecorded cause.

## Approved report API surface

The approved server-side report surface is the public tRPC query
`evidenceIntegrity.report`. It accepts only one `district`, one
`propertyType`, and one explicit `asOf` date, then returns the existing
Evidence Integrity v1.0 result unchanged. The procedure has no `areaSqm`,
price, candidate-property, confidence, or valuation input because those
dimensions are not part of this policy or its evidence contract.

The query may expose only the observations, availability state, summary, and
record-level provenance specified above. It uses the existing read-only DLD
provider and must not persist a report, add a fallback scope, or derive a new
observation. Any future API input, report field, access-control policy, or
endpoint-specific rate-limit policy requires a separately approved policy and
contract change.

## Non-interference

This policy and its report API must not import, invoke, mutate, or alter the Valuation Engine, methodology v1.2, methodology weights or coefficients, actual sale prices, Comparable Selection, Confidence, valuation eligibility, valuation output, source transaction rows, dashboard, or user interface. The report result must not be consumed as an input to valuation or confidence processing.

## Deferred

Price outlier classifications, scale-error claims, special-transaction classifications, candidate-price comparisons, confidence scores, new data sources, enrichment, any API or report surface beyond the approved facts-only query, and UI are outside v1.0. They require a separate approved policy and contract.
