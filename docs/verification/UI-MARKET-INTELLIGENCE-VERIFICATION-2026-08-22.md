# UI Market Intelligence Verification — 2026-08-22

## Scope

Phase 6 exposes the approved, read-only Market Intelligence v1.0 benchmark in the valuation-results interface. The presentation reads the existing `MarketIntelligenceBenchmark` union from a dedicated server procedure scoped to the report's district, property type, and server-held as-of date. It does not add Market Intelligence to the valuation report contract or invoke it from the valuation orchestrator.

## Display contract

**Market status** comes from `benchmark.status` and renders either the explicit `available` or `unavailable` contract union. **Sample size** comes from `statistics.count` when available, or `provenance.recordCount` when unavailable, and refers only to selected eligible DLD transactions.

**Date range** comes from `provenance.filters.from` and `provenance.asOf`, showing the server-provided inclusive window. **Data quality** is limited to the governed `filters.evidenceStatus = eligible` fact; it is not shown as a quality score.

MI v1.0 has no market-confidence field. The UI therefore renders **UNAVAILABLE — not produced by MI-v1.0** and does not reuse valuation confidence. **Source and provenance** come from `provenance`, including DLD, policy version, as-of scope, count, and available per-record trace facts.

## Boundaries verified by implementation

The `marketIntelligence.benchmark` procedure is read-only and calls only `MarketIntelligenceService` with `DldMarketIntelligenceProvider`. It accepts district, property type, and as-of date only. It accepts no candidate price, property size, valuation input, confidence input, or diagnostic control. The UI labels the result as independent market context and explicitly states that it does not change valuation, create confidence, or perform diagnostics.

When the server returns fewer than five governed records, the interface renders `UNAVAILABLE`, the server's selected-record count, the required count, and the absence of a fallback. It does not render descriptive price statistics in this state.

## Verification record

**TypeScript.** `pnpm run check` passed.

**Vitest.** `pnpm test` passed: 38 files and 162 tests, including available, unavailable, and missing-report presentation states plus server-procedure contract tests.

**Production build.** `pnpm run build` passed. The pre-existing Vite chunk-size advisory remains and is unrelated to this change.

**Formatting and diff hygiene.** `pnpm run format:check` and `git diff --check` passed after the final documentation update.

**Browser flow.** A local Apartment / Business Bay / 100 sqm submission reached the pre-existing generic valuation failure state, so no valuation report or Market Snapshot was rendered. No report, benchmark, or sample was fabricated to force a visual result.

The available and unavailable visual states are covered deterministically by server-contract and SSR presentation tests. The browser outcome above demonstrates the unchanged no-report boundary only; it does not claim a live DLD-backed Market Snapshot.
