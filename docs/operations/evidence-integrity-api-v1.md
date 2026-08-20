# Evidence Integrity Report API v1.0

- **Status:** Implemented in `main`
- **Policy:** `EID-v1.0`
- **Surface:** Public tRPC query `evidenceIntegrity.report`
  **Implementation date:** 2026-08-20

## Purpose and boundary

This query provides the existing **facts-only** Evidence Integrity v1.0 report
through the server. It is a read-only presentation surface over the approved
DLD provider and `EvidenceIntegrityService`; it is not a valuation endpoint,
a price benchmark, a confidence service, or a diagnostic classification engine.

The route is intentionally independent of `valuation.run`. It neither calls
the Valuation Engine nor returns a value opinion, comparable set, confidence
score, pricing classification, candidate-price comparison, or synthetic
fallback.

## Request contract

| Field          | Required | Accepted value                                                                | Governing rationale                                 |
| -------------- | -------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| `district`     | Yes      | Trimmed non-empty string, maximum 160 characters                              | The policy authorizes one local district scope.     |
| `propertyType` | Yes      | `apartment`, `villa`, `townhouse`, `office`, `retail`, `land`, or `warehouse` | The canonical Evidence Integrity property taxonomy. |
| `asOf`         | Yes      | A date accepted by the server date coercion                                   | The policy requires an explicit temporal boundary.  |

The input object is strict. In particular, `areaSqm` is rejected rather than
silently ignored because v1.0 has no approved size dimension, size category,
or size-based fallback rule.

## Response contract

The procedure returns the existing `EvidenceIntegrityResult` without adapting
or enriching it. The result is one of the following governed states.

| Status        | Meaning                                                     | Required response content                                                     |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `available`   | At least five scoped, in-window DLD records are eligible.   | Facts-only observations, summary, and record-level provenance.                |
| `unavailable` | Fewer than five scoped, in-window DLD records are eligible. | `reason: insufficient_local_evidence`, observations, summary, and provenance. |

Every response records `source: DLD`, `policyVersion: EID-v1.0`, the inclusive
90-calendar-day filters, and the actual scoped records' transaction IDs,
checksums, transaction dates, ingestion timestamps, evidence statuses, and
stored rejection reasons. Future-dated records and records outside the window
remain visible only as exclusion facts; they do not contribute to availability.

## Explicit exclusions

The API cannot return the following because neither the contract nor the
approved policy authorizes them:

- Any valuation, price estimate, price-per-square-metre result, or fair-value assertion.
- Any confidence score, evidence score, quality score, or pricing classification.
- Any size-based, district, property-type, city, project, or date fallback beyond the exact request scope.
- Any data source other than the existing DLD transaction evidence.
- Any persistent report record, dashboard, or client-side calculation path.

## Verification scope

`server/evidence-integrity/evidence-integrity-api.test.ts` verifies that the
public procedure passes the exact DLD scope to the provider, preserves
provenance and temporal-exclusion facts, returns the governed unavailable
state, rejects malformed or unsupported input, and does not call
`executeValuation`.
