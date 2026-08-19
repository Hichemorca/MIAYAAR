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

## Non-interference

This policy must not import, invoke, mutate, or alter the Valuation Engine, methodology v1.2, methodology weights or coefficients, actual sale prices, Comparable Selection, Confidence, valuation eligibility, valuation output, source transaction rows, API exposure, reports, dashboard, or user interface.

## Deferred

Price outlier classifications, scale-error claims, special-transaction classifications, candidate-price comparisons, confidence scores, new data sources, enrichment, API endpoints, diagnostics reports, and UI are outside v1.0. They require a separate approved policy and contract.
