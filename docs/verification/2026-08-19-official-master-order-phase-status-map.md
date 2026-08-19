# MIAYAAR — Governed Phase-Status Map

**Date:** 2026-08-19
**Scope:** Official eleven-phase execution order, updated after the implementation proposed in PR #14.
**Status vocabulary:** **Implemented** means delivered in the current branch or protected `main`; **Partial** means an evidenced subset exists but the official phase has explicit remaining limits; **Blocked** means an owner policy or new evidence source is required; **Not started** means no governed implementation is present.

> This map distinguishes implemented technical work from approval and merge state. The Market Intelligence implementation is complete on `feature/market-intelligence-v1` and awaits review and merge through PR #14; it is not claimed as protected-`main` functionality until that merge occurs.

| Official phase | Governed status | File-level evidence | Remaining boundary or decision |
|---|---|---|---|
| 1. Architecture & Contracts | **Implemented** | `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, and `docs/ADR/ADR-011-canonical-frozen-valuation-methodology-v1-2.md` | A new architecture decision is required before changing frozen canonical contracts or methodology. |
| 2. Data Pipeline & Classification | **Partial** | `scripts/lib/dld-evidence-cleaning.mjs`, `server/valuation/evidence.contracts.ts`, and `drizzle/schema.ts` | DLD does not evidence project-level identifiers or secondary transaction attributes; they must not be inferred. |
| 3. Market Intelligence | **Implemented on PR #14 — pending merge** | `docs/policies/MARKET-INTELLIGENCE-POLICY.md`, `contracts/market-intelligence.contracts.ts`, `server/market-intelligence/dld-market-intelligence-provider.ts`, `engines/market-intelligence/market-intelligence.service.ts`, and `server/market-intelligence/market-intelligence.service.test.ts` | The v1.0 policy deliberately has no API, UI, diagnostics, fallback expansion, candidate-price classification, enrichment source, or valuation integration. |
| 4. Comparable Selection | **Partial** | `server/valuation/comparable-search.ts` | The local deterministic selection remains distinct from Market Intelligence. Project/size hierarchy and per-record exclusion explanation require separate governed evidence and policy. |
| 5. Canonical Valuation Engine | **Implemented** | `engines/valuation/valuation.engine.ts`, `engines/valuation/methodology-v1_2.ts`, and ADR-011 | Weights, coefficients, and methodology version are frozen; any change needs a new approved governance decision. |
| 6. Confidence & Explainability | **Partial** | `server/engines/confidence/confidence.ts`, `core/types/confidence.ts`, and valuation report contracts | Market Intelligence intentionally does not modify confidence. Market context can only be exposed after a separately approved API/UI scope. |
| 7. Forensic Diagnostics | **Blocked** | No governed diagnostics module; the policy map records no approved thresholds or taxonomy. | Owner approval is required for diagnostic taxonomy, thresholds, source evidence, and non-interference rules. |
| 8. Temporal Backtesting | **Partial** | `server/valuation/dld-observable-backtesting.ts`, `scripts/run-dld-observable-backtest.mts`, and `docs/verification/2026-08-19-dld-observable-backtest-results.md` | The study covers DLD-observable evidence only; it cannot validate unrecorded finish, view, floor, or rent attributes. |
| 9. API | **Partial** | `server/routers.ts`, `server/engines/orchestrator/valuation-orchestrator.ts`, and `netlify/functions/api.ts` | `valuation.run` is public and rate-limited. Market Intelligence has no endpoint by its approved v1.0 scope. |
| 10. UI | **Partial** | `client/src/pages/Home.tsx`, `client/src/pages/ValuationReport.tsx`, and `client/src/App.tsx` | No Market Intelligence, diagnostics, explorer, or administrative UI was added in this phase. |
| 11. Full Testing & Regression | **Partial** | `.github/workflows/ci.yml`, `server/market-intelligence/market-intelligence.service.test.ts`, and the PR #14 verification record | The complete suite now has 21 files and 72 tests on the branch. Diagnostics and UI coverage remain unavailable because those scopes are not implemented. |

## PR #14 verification record

The branch implementation recorded in `docs/verification/2026-08-19-market-intelligence-v1-implementation.md` passed TypeScript checking, the full Vitest suite, the production build, Prettier validation, `git diff --check`, GitHub CI, and Netlify Deploy Preview. Its five focused tests cover DLD provenance, insufficient evidence without a synthetic benchmark, inclusive ninety-day temporal bounds, future-data exclusion, no fallback expansion, and structural independence from the valuation, confidence, and comparable-search modules.

## Explicit non-claims

This map does not claim that PR #14 is merged, deployed to production, connected to an end-user route, or capable of changing a valuation. It also does not claim empirical calibration of secondary attributes, a diagnostic anomaly model, or a management interface. Those remain outside the approved Market Intelligence v1.0 scope.

## Related repository evidence

| Evidence | Repository path |
|---|---|
| Market Intelligence v1.0 implementation verification | `docs/verification/2026-08-19-market-intelligence-v1-implementation.md` |
| Market Intelligence policy | `docs/policies/MARKET-INTELLIGENCE-POLICY.md` |
| Frozen methodology decision | `docs/ADR/ADR-011-canonical-frozen-valuation-methodology-v1-2.md` |
