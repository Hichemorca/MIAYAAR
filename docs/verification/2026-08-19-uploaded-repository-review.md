# Uploaded Review — Repository Comparison and Foundation Remediation

**Review date:** 2026-08-19  
**Baseline:** `main` at `9b074272f5af2d8720b12536df6826f9ee86bf27`  
**Recovery reference:** `backup/pre-upload-review-20260819-175213` at the same commit  
**Source reviewed:** user-supplied `pasted_content.txt`

## Executive conclusion

The supplied brief is directionally aligned with MIAYAAR's evidence-led goals, especially its requirements to preserve source transactions, expose decision evidence, separate pipeline responsibilities, and prevent client-side valuation. The current platform already implements the governed core path: server orchestration, non-destructive DLD normalization, deterministic eligibility, same-district/same-type evidence selection, time awareness, confidence/warnings, decision records, and a public rate-limited valuation endpoint.

The brief also requests a much broader product surface. Its remaining items are **not evidence that the existing frozen valuation methodology or contracts are wrong**. They are product-architecture work that must proceed in staged, contract-safe increments. This change removes the confirmed duplicate browser valuation engine and makes the DLD property-type dictionary an explicit server-side single source of truth.

## Requirement comparison

| Brief area | Current status | Evidence / handling |
|---|---|---|
| Preserve raw DLD transactions; diagnose rather than alter prices | Implemented | Import cleaning records decisions and the evidence normalizer retains raw type/subtype and source identifiers. No price correction is introduced here. |
| Central ingestion, normalization, validation and rejection handling | Implemented for DLD; expandable | `scripts/lib/dld-evidence-cleaning.mjs` and `server/valuation/evidence-validation.ts` separate raw evidence from normalized eligibility decisions. Additional sources need their own governed adapters. |
| Canonical property classification | Partially implemented; remediated | The former type dictionary in evidence validation is now isolated in `server/valuation/property-classification.ts`, preserving labels and existing mapping behaviour. |
| Size classes in comparable selection and reporting | Not implemented | This is a policy-sensitive next step. It must be introduced with an ADR, data profiling, explicit boundary semantics, and contract changes only when approved. |
| Same-type, district-local, time-aware comparables | Implemented | `server/valuation/comparable-search.ts` rejects unsupported city-wide fallback and widens only the time window. |
| Subtype, project, readiness and usage similarity | Not implemented in the canonical search policy | The brief requests these fields, but current DLD schema/search contracts do not safely provide all of them. Add only after a data-availability audit and ADR; do not fabricate them. |
| Market intelligence service and dashboards | Not implemented as independent product surfaces | Current reports disclose evidence used per valuation. A reusable market-intelligence read model and UI remain a future phase. |
| Confidence, diagnostics, explainability and audit record | Implemented in core valuation flow | Server orchestration produces warnings, confidence and a decision record; the report renders them without running valuation logic. |
| Separate explorer, forensic, transaction, engine diagnostics and admin screens | Not implemented | These are product-surface phases. They require read-only APIs, access controls and raw/normalized evidence views before UI construction. |
| Client must not calculate valuations | Remediated | Removed the unreferenced legacy `client/src/lib/valuation.ts`. The governance test prevents its reintroduction. |

## Confirmed conflicts and safeguards

> The uploaded brief is explicit that it does not ask for new coefficients, weights, transaction manipulation, or detailed equations. Accordingly, this change does not alter `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, methodology version `1.2`, calculation weights, or valuation API behaviour.

The brief's desired broader comparable matching conflicts with the current frozen local-evidence contract only if it changes eligibility or broadens geography. This remediation intentionally **does not** alter that policy: insufficient local evidence remains an unavailable result rather than a synthetic value.

## Duplicate-logic finding

`client/src/lib/valuation.ts` contained a complete parallel browser valuation flow, including comparable fallback, confidence and scenario calculation. It was not used by the current UI, but its presence conflicted with the server-only source-of-truth requirement. It has been removed. Presentation components continue to render only the server tRPC result.

## Staged implementation map

| Stage | Safe next deliverable | Gate before implementation |
|---|---|---|
| A — completed here | Centralized classification; no browser valuation engine; governance tests | Full test, type and build validation |
| B | Read-only evidence query contracts for comparables, transaction provenance and diagnostics | Data-availability inventory and access-control design |
| C | Market intelligence read model, coverage/quality metrics and controlled dashboard | ADR for snapshot definitions and refresh behaviour |
| D | Comparable Explorer and Transaction Explorer | Read-only API contracts and raw-versus-normalized disclosure rules |
| E | Forensics and engine diagnostics surfaces | Admin authorization plus non-destructive diagnostic taxonomy |
| F | Size/subtype/project-aware matching | Explicit ADR, DLD field coverage analysis and canonical-contract approval |

## Validation

The accompanying tests cover source-label classification and enforce absence of the legacy client valuation module. The full repository validation suite is run before the associated pull request is opened.
