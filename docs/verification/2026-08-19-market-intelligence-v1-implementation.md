# Market Intelligence v1.0 — Implementation Verification

**Date:** 2026-08-19
**Implementation branch:** `feature/market-intelligence-v1`
**Base revision:** `d35ff3f6a9d8279ce395a864cb48e42db3430040`
**Policy:** [`MARKET-INTELLIGENCE-POLICY.md`](../policies/MARKET-INTELLIGENCE-POLICY.md)

## Scope delivered

This change delivers the read-only, server-side Market Intelligence v1.0 layer approved by the policy. It is a descriptive DLD benchmark service, not a valuation feature. It deliberately has no router registration, API endpoint, user interface, dashboard, diagnostic surface, database migration, or evidence/audit write path.

| Component           | File                                                             | Purpose                                                                                                    |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Policy              | `docs/policies/MARKET-INTELLIGENCE-POLICY.md`                    | Records the approved DLD-only benchmark policy and boundaries.                                             |
| Evidence contract   | `contracts/market-intelligence.contracts.ts`                     | Defines the only permitted fields, availability state, provenance, provider boundary, and response shapes. |
| DLD provider        | `server/market-intelligence/dld-market-intelligence-provider.ts` | Performs a read-only, parameterized query on documented DLD fields.                                        |
| Statistical service | `engines/market-intelligence/market-intelligence.service.ts`     | Enforces the filters defensively and returns descriptive statistics only.                                  |
| Tests               | `server/market-intelligence/market-intelligence.service.test.ts` | Verifies policy behavior and structural independence.                                                      |

## Policy behavior implemented

The service accepts an explicit `district`, `propertyType`, and mandatory `asOf`. It selects only transactions whose source is `DLD`, whose evidence status is `eligible`, whose district and property type match exactly, and whose `transactionDate` is inside the inclusive interval from `asOf - 90 calendar days` through `asOf`.

| Situation                                                       | Result                                                                                                |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| At least five eligible DLD transactions satisfy every filter    | `available` with `mean`, population `standardDeviation`, `count`, `min`, and `max` for `pricePerSqm`. |
| Fewer than five transactions satisfy every filter               | `unavailable` with `insufficient_benchmark_evidence`; no numeric substitute is emitted.               |
| Provider returns an out-of-window or future record              | The service excludes it again before calculating statistics or provenance.                            |
| A different district or property type is supplied by a provider | The service excludes it; it does not query or apply another fallback level.                           |

Every response includes `MI-v1.0`, the source, request filters, selected record count, and one record-level provenance item for each included transaction. Each item retains `sourceTransactionId`, `sourceChecksum`, `transactionDate`, and `ingestedAt`.

## Boundary confirmation

The implementation does not import `valuation.engine`, `confidence`, `comparable-search`, or `valuation-orchestrator`. It does not import or mutate `engines/valuation/methodology-v1_2.ts`, and it does not alter the Valuation Engine, methodology weights, coefficients, comparable selection, actual sale prices, confidence thresholds, router, or UI.

## Verification evidence

| Command                                                                               | Result                                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `pnpm exec vitest run server/market-intelligence/market-intelligence.service.test.ts` | Passed: 5 tests.                                       |
| `pnpm check`                                                                          | Passed: TypeScript emitted no errors.                  |
| `pnpm test`                                                                           | Passed: 21 test files and 72 tests.                    |
| `pnpm build`                                                                          | Passed: Vite client build and server bundle succeeded. |
| `git diff --check`                                                                    | Passed: no whitespace errors.                          |

The dedicated tests cover descriptive statistics and provenance, insufficient evidence, absence of synthetic output, inclusive 90-day boundaries, prevention of temporal leakage, single-level behavior without fallback, and structural independence from valuation and confidence modules.

## Explicitly deferred

Candidate-price consistency classification, additional benchmark dimensions, enrichment sources, fallback expansion, any integration with valuation, API exposure, diagnostics, dashboard, UI, and data schema changes remain outside this pull request and require a future approved policy change.
