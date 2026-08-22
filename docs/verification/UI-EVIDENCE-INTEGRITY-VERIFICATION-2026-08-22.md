# UI Evidence Integrity Verification — 2026-08-22

## Scope

Phase 8 presents the existing `evidenceIntegrity.report` response in the valuation workflow as a **read-only facts surface**. The interface accepts no valuation, confidence, quality-score, price, or diagnostic input and makes no client-side calculation.

## Server contract boundary

| Contract state | UI treatment                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `available`    | Shows `FACT · Evidence available`, server-returned eligible-record statistics, DLD source, exact approved date window, policy version, observations, and provenance. |
| `unavailable`  | Shows `UNAVAILABLE · Evidence insufficient`, the server-returned count and required count, and the existing statement that no substitute evidence was used.          |
| Query error    | Shows no report as unavailable; no evidence or score is manufactured.                                                                                                |

## Explicit limits shown

The UI repeats only limits authorized by EID-v1.0: it cannot establish valuation, price fairness, price per square metre, confidence, evidence/quality score, or diagnostic classification. It does not use a source or geographic fallback.

## Change boundary

- No change to the Evidence Integrity service, provider, API contract, valuation engine, methodology, weights, comparable selection, Market Intelligence, database, or diagnostics policy.
- All facts, counts, dates, observations, and provenance remain server-returned fields.
- The existing panel remains independently read-only from valuation and displays the valuation-linked district, property type, and as-of date when embedded in the report.

## Verification record

The local browser submission for Apartment / Business Bay / 100 sqm reached the pre-existing generic valuation failure state. Consequently, no valuation report or Evidence Integrity response was rendered. No evidence record, count, date, or score was fabricated to force a visual result.

Available and insufficient presentation states are covered deterministically by SSR tests using server-contract fixtures. The browser outcome above verifies the no-report boundary only and does not claim a live DLD-backed Evidence Integrity response.

| Check            | Result                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript       | `pnpm run check` passed.                                                                                                         |
| Vitest           | `pnpm test` passed: 41 files and 168 tests, including the available and insufficient snapshot SSR states.                        |
| Production build | `pnpm run build` passed. The existing Vite chunk-size advisory remains unrelated to this change.                                 |
| Formatting       | `pnpm run format:check` passed. Baseline files that predate the phase remain excluded by the repository's incremental formatter. |
| Diff hygiene     | `git diff --check` passed.                                                                                                       |
