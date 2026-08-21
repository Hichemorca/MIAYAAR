# Temporal Backtesting Governance Reconciliation — Phase 8

**Status:** Documentation-only governance review; no rerun authorized  
**Date:** 2026-08-21  
**Scope:** Reconcile the existing DLD-observable historical backtest with the subsequently implemented Comparable Selection policy (`CS-v1.0`).  
**Authority:** Owner-approved Phase 8 review scope of 2026-08-21.  
**Non-claim:** This record does not authorize a new backtest, alter a historical result, adopt a benchmark, establish a performance threshold, modify an estimate, or integrate Comparable Selection into a valuation path.

## 1. Governing conclusion

The repository contains a reproducible, read-only historical study under `MIAYAAR-BT-001`. It evaluates only the DLD-observable local-comparables estimator and explicitly does **not** validate the full MIAYAAR valuation engine, secondary attributes, or frozen methodology factors.[1] [2]

`CS-v1.0` was subsequently implemented as a distinct, standalone deterministic selection service. It is not imported by the valuation engine, the public API, Market Intelligence, confidence, or the historical backtest.[3] This reconciliation therefore records **partial conceptual alignment** and several material replay differences. The existing results must not be relabelled as results of `CS-v1.0`.

## 2. Evidence reviewed

| Evidence                           | Current fact relevant to this review                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `MIAYAAR-BT-001` protocol          | Defines a read-only, DLD-observable holdout study using only historically earlier local transactions.                                    |
| Historical backtest implementation | Replays a legacy local-comparables sequence in memory, with escalating windows and no per-candidate exclusion record.                    |
| Historical results record          | Labels its conclusions as descriptive and prohibits a full-engine accuracy or factor-calibration claim.                                  |
| `CS-v1.0` policy and contract      | Defines a single configured selection window, area floor, deterministic ascending identifier tie-break, and full exclusion explanations. |
| `CS-v1.0` implementation           | Is stateless and architecturally independent; it has no current consumer in the valuation or historical-study path.                      |

## 3. Confirmed historical-study boundary

The historical harness reads an exported, eligible DLD cohort, partitions targets by the documented target period, uses the target transaction date as its historical information boundary, and writes a deterministic aggregate output with source-input checksum and Git revision.[1] [4] It neither creates a valuation request nor writes to audit, methodology, or DLD evidence storage.[1] [4]

Its primary estimate applies the frozen value-growth assumption to selected price-per-square-metre observations, while its comparator is the median **unadjusted** price per square metre from the same historical selected rows.[1] [5] Those estimate and comparator formulae are part of the historical study; they are not functions provided by `CS-v1.0`.

## 4. Reconciliation with CS-v1.0

| Selection concern             | Historical backtest fact                                                                               | CS-v1.0 fact                                                                                                                                                             | Reconciliation status                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Locality and property type    | Requires the same district and property type as the target.                                            | Requires the same district and property type as the subject.                                                                                                             | **Aligned at principle level.** District comparison is not implemented identically: the historical replay compares source strings directly, while CS-v1.0 normalizes case and whitespace before comparison. |
| Historical knowledge boundary | Excludes the target itself and every same-day or future row; only an earlier timestamp is admitted.    | The configured window permits a transaction date up to and including `asOf`; the standalone selector does not itself define target-self or same-day replay handling.     | **Divergent.** A future replay needs an explicit temporal-boundary decision before it can claim equivalence.                                                                                                |
| Eligibility representation    | Receives an eligible export and independently validates required positive fields.                      | Requires the candidate field `evidenceStatus` to equal `"eligible"`.                                                                                                     | **Partially aligned.** The existing export does not prove that the CS-v1.0 representation and historical eligibility guard are identical for a future rerun.                                                |
| Search windows                | Tests `90`, `180`, `365`, then `730` days and selects the first window with at least five rows.        | Uses one explicitly configured window; its default configuration is `365` days, while the shared contract records the historical window set as configuration space only. | **Divergent.** No adaptive-window replay policy has been adopted for CS-v1.0.                                                                                                                               |
| Minimum and capacity          | Requires at least five rows and retains at most twelve.                                                | Requires at least five rows and retains at most twelve.                                                                                                                  | **Aligned.** These bounds are reused governing facts, not new backtest policy.                                                                                                                              |
| Area guard                    | Requires a finite positive area.                                                                       | Excludes candidate areas at or below the shared `10 sqm` floor.                                                                                                          | **Divergent.** The historical replay does not apply the CS-v1.0 candidate-area guard.                                                                                                                       |
| Recency ranking and ties      | Sorts newest first; for equal dates it orders source identifiers in the opposite direction to CS-v1.0. | Sorts newest first; equal dates use ascending lexicographic `sourceTransactionId`.                                                                                       | **Divergent.** Identical-date cohorts can select a different capped subset.                                                                                                                                 |
| Exclusion trace               | Returns selected or insufficient results with aggregate rejection information.                         | Records one governed exclusion reason for every non-selected candidate.                                                                                                  | **Divergent in audit surface.** The historical output cannot be retroactively claimed to contain CS-v1.0 exclusion explanations.                                                                            |
| Estimation and baseline       | Computes a time-adjusted mean estimate and a median unadjusted baseline from the selected rows.        | Selects evidence only and does not compute a valuation, performance metric, or baseline.                                                                                 | **Separate responsibilities.** No performance inference about CS-v1.0 follows from the historical estimate metrics.                                                                                         |

## 5. What remains valid

The historical study remains valid only under its recorded protocol and implementation revision. It provides evidence that the legacy DLD-observable local-comparables replay can be run without temporal leakage, without production writes, and with explicit insufficient-local-evidence rejection.[1] [2] It does **not** establish that the current `CS-v1.0` selector would produce the same comparables, coverage, or error metrics.

The study’s previously documented interpretation also remains unchanged: the observed result does not justify modifying the frozen growth assumption, methodology weights, or secondary-attribute factors.[2] [5]

## 6. Unresolved policy decisions

The following decisions are deliberately preserved as `UNRESOLVED_POLICY`. This review creates no default, threshold, fallback, benchmark, coefficient, or implementation for any of them.

| ID      | Decision required from governance                                                                                                                                                                                                   | Why the current record cannot decide it                                                                                          |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `TB-01` | Decide whether a future temporal replay must preserve the legacy selector or use CS-v1.0.                                                                                                                                           | These are separate services and their observable rules are not identical.                                                        |
| `TB-02` | If CS-v1.0 is used, decide the replay-specific treatment of target-self exclusion, same-day evidence, the configured temporal window, district normalization, eligibility representation, area guard, and identifier tie direction. | Each difference can change the selected cohort; no equivalence rule is approved.                                                 |
| `TB-03` | Decide whether any future study may retain, replace, or separately evaluate the historical estimate and baseline formulae.                                                                                                          | CS-v1.0 selects evidence only; the current formulae are not a CS-v1.0 valuation or benchmark policy.                             |
| `TB-04` | Define any future performance-interpretation or acceptance framework only through a separate governance decision.                                                                                                                   | No approved acceptance threshold, comparative claim, or methodology-change trigger exists.                                       |
| `TB-05` | Define the provenance record required for a newly authorized rerun, including the study revision, source cohort definition, temporal boundary, and selector version.                                                                | The existing output records its own input checksum and Git revision but predates CS-v1.0.                                        |
| `TB-06` | Decide whether a future authorized study may expose any new result through an API, UI, or report surface.                                                                                                                           | Neither the historical study nor CS-v1.0 authorizes such exposure.                                                               |
| `TB-07` | Decide whether a separately evidenced data source and protocol are sufficient to test any secondary attribute.                                                                                                                      | Current DLD evidence still lacks the recorded finish, view, floor, rent, legal-rights, zoning, and related property-level facts. |

## 7. Non-interference attestation

This reconciliation changes no executable code, tests, data, schema, contract, Core Type, methodology, weight, coefficient, growth assumption, valuation engine, Comparable Selection implementation, Market Intelligence service, Evidence Integrity service, confidence output, public procedure, rate limit, API response, UI, or deployment configuration.

It does not rerun the historical study, write results, alter the historical report, create a temporal benchmark, classify any price, diagnose an anomaly, infer an unavailable attribute, or provide a value where local evidence is insufficient.

## 8. Required gate before further work

No Temporal Backtesting implementation, rerun, refactor, integration, or performance claim is authorized by this document. A separately owner-approved scope must resolve the applicable `TB-*` decisions before any new historical replay is designed or executed.

## References

[1]: ../verification/2026-08-19-dld-observable-backtesting-protocol.md "MIAYAAR-BT-001 — DLD-Observable Backtesting Protocol"
[2]: ../verification/2026-08-19-dld-observable-backtest-results.md "DLD-observable backtesting results"
[3]: ../policies/COMPARABLE-SELECTION-POLICY.md "Comparable Selection Policy — CS-v1.0"
[4]: ../../server/valuation/dld-observable-backtesting.ts "Historical DLD-observable replay"
[5]: ../verification/2026-08-19-methodology-v1_2-governance-review.md "Methodology v1.2 governance review"
