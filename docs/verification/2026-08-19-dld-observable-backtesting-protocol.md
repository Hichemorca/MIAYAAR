# MIAYAAR-BT-001 — DLD-Observable Backtesting Protocol

**Status:** Proposed for governed implementation  
**Date:** 2026-08-19  
**Scope:** Read-only retrospective validation of the DLD-observable local-comparables layer, plus a separately labelled sensitivity analysis of frozen v1.2 secondary-attribute factors.

## 1. Claim boundary

This protocol does **not** estimate or claim the full-platform accuracy of a property valuation. The eligible DLD evidence schema contains a source identifier, transaction date, district, normalized property type, area, sale price, and price per square metre. It does not contain the observed finish, building/property condition, furnished state, floor, view, street position, rent, replacement cost, or depreciation of the transacted property.

Accordingly, the retrospective accuracy result is limited to a historically available, same-district and same-property-type DLD comparable estimate. A later sensitivity result will show the mathematical effect of the already frozen factors, but it will not be described as empirical calibration or validation of those factors.

## 2. Frozen study population and time boundary

The source is the existing `marketTransactions` registry, filtered to `evidenceStatus = 'eligible'`. The initial data-profile query found eligible records from **2026-01-02** through **2026-07-26**. The protocol fixes an evaluation-target period of **2026-04-02 through 2026-07-26 inclusive**. The three-month warm-up avoids presenting early-record estimates as if a 90-day local history were available.

Each eligible target transaction in that period is evaluated once. Its observed `salePriceAed` is held out as the outcome. The target is never passed as a comparable for itself, and a comparable must have `transactionDate < target.transactionDate`. Same-date transactions are excluded because the DLD evidence timestamp has date rather than reliable intra-day order.

> The strict historical predicate prevents a target from seeing an outcome that was not yet observable at its own transaction date. It is therefore stricter than an ordinary random train/test split.

## 3. Comparable-selection replay

For each target, the harness must preserve the production evidence-policy sequence: same district, same normalized property type, eligible status, and escalating lookback windows of 90, 180, 365, then 730 days. The first window containing at least five records is selected, and no more than the twelve most recent qualifying rows are retained. If every window has fewer than five records, the result is a governed rejection rather than an estimated value.

The primary estimate is the arithmetic mean of the selected, time-adjusted price per square metre multiplied by the target area. The adjustment uses the frozen `valueGrowthRate` only and retains the current evidence-layer convention. The comparator baseline is the median **unadjusted** price per square metre of precisely the same selected comparables multiplied by the target area. This baseline is intentionally simple, local, and evidence-compatible.

## 4. Pre-specified outputs

For completed primary and baseline estimates, the study will report the following values both overall and by property type. District-level accuracy is reported only where the completed cohort size is at least 30; smaller districts receive only an explicit sample-size disclosure.

| Metric | Definition |
|---|---|
| `MAE` | Mean absolute error in AED: `mean(abs(predicted - observed))`. |
| `MdAPE` | Median absolute percentage error: `median(abs(predicted - observed) / observed)`. |
| Signed bias | Mean signed percentage error: `mean((predicted - observed) / observed)`. |
| Coverage | Completed estimates divided by all eligible held-out targets. |
| Rejection rate | Targets with fewer than five historical local comparables divided by all eligible held-out targets. |
| Baseline delta | Difference between the primary estimate and baseline on the same completed cohort only. |

No percentage-improvement assertion is permitted unless the completed primary and baseline cohorts are identical and the report states their sizes, time boundary, and uncertainty limitation.

## 5. Isolation, reproducibility, and write prohibition

The harness is read-only. It must not call the request-orchestration function that creates `valuationRequests` or `valuationAuditEvents`, and it must not alter `marketTransactions`, methodology records, or production evidence. The study records only aggregate results and deterministic metadata in version-controlled output.

The run metadata must include this protocol identifier, methodology document/version, source-query constraints, target-period bounds, selected row count, completed count, rejected count, and the Git revision. No raw transaction values or personally identifying data are written to the report.

## 6. Secondary-attribute sensitivity boundary

The sensitivity work uses the existing frozen lower/baseline/upper factors for property condition, building condition, view, floor, street position, finish quality, and furnished state. It reports isolated one-factor multipliers and clearly named multi-factor illustrative combinations against a neutral evidence-only base.

It may demonstrate, for example, the arithmetic difference between `SEA` and `STREET` view factors. It may not assert that this difference equals the observed Dubai market premium without a separately governed data set that labels both transaction outcomes and those attributes.

## 7. Non-goals and governance

This protocol does not recalibrate factors, reweight the four approaches, modify `MIAYAAR-METH-001 v1.2`, create a configuration dashboard, or make a fair-value guarantee. Any later change to factors, weights, or calculation policy requires a proposed methodology release, the applicable ADR decision, automated regression coverage, independent review, and owner approval.

## 8. Implementation references

The selection policy is defined in [`server/valuation/comparable-search.ts`](../../server/valuation/comparable-search.ts), and the frozen v1.2 growth assumption and factor tables are in [`engines/valuation/methodology-v1_2.ts`](../../engines/valuation/methodology-v1_2.ts). The input-domain constraint is recorded in [`server/valuation/evidence.contracts.ts`](../../server/valuation/evidence.contracts.ts).
