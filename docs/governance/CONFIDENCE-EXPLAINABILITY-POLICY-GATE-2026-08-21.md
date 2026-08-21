# Confidence & Explainability Policy Gate — Phase 6

**Status:** COMPLETE — policy-gate record only; no implementation authorized  
**Date:** 2026-08-21  
**Scope authority:** Owner-approved Phase 6 policy-gate scope  
**Implementation status:** No code, API, UI, contract, methodology, or data change

## 1. Purpose and governing conclusion

This record inventories the existing confidence and report outputs, establishes the factual distinctions that may be preserved in a future explanation design, and identifies every presentation or semantic decision that remains unapproved. It is not an approval to add a new confidence computation, response field, endpoint, screen, or consumer of an existing output.

> **Governing conclusion:** The current implementation permits a narrow factual explanation of an already-produced confidence assessment and report fields only. Any new explanation surface, visual treatment, interpretation, input, threshold, aggregation, or relationship to Evidence Integrity or Market Intelligence remains `UNRESOLVED_POLICY` until an independent owner decision approves it.

The Phase 6 policy gate is therefore complete as a documentation result. A separately approved implementation scope is required before any API or UI work begins.

## 2. Existing output inventory

### 2.1 Confidence assessment

The current confidence module produces one `ConfidenceAssessment` after a valuation range has already been independently produced. Its declared basis is exactly `valuation_range_width`. It returns a `high`, `moderate`, or `low` level; the rounded range-width percentage; comparable count; oldest comparable age in days; and a literal explanation derived from the range-width percentage.[1]

| Existing field                     | Current source fact                                                                                           | Permitted explanation boundary                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `level`                            | A literal `high`, `moderate`, or `low` emitted by the existing module.                                        | State the emitted level only; do not recalculate or relabel it.                                                 |
| `basis`                            | Constant literal `valuation_range_width`.                                                                     | State that the current level is based on valuation-range width.                                                 |
| `rangeWidthPercent`                | Derived from the already-generated lower, baseline, and upper valuation values, then rounded to two decimals. | State the returned percentage only; do not substitute a different uncertainty measure.                          |
| `evidence.comparableCount`         | Number of comparable records passed into the existing confidence function.                                    | Present only as returned evidence context, not as a stated cause of the level.                                  |
| `evidence.oldestComparableAgeDays` | Maximum `ageDays` across the passed comparable records.                                                       | Present only as returned evidence context, not as a stated cause of the level.                                  |
| `explanation`                      | Existing literal text: confidence is explained by valuation-range width.                                      | Preserve its limited meaning; do not expand it into a claim of market accuracy, price correctness, or fairness. |

The existing implementation defines the level with the frozen range-width branches `<= 10`, `<= 20`, and otherwise `low`. Comparable count and age are returned alongside the assessment, but the current function does **not** use either field to determine `level`.[1] A future explanation must not claim otherwise.

### 2.2 Valuation report assembly

`ValuationReport` is a presentation-ready assembly object. It carries the existing report status, methodology identifier and version, submitted property, evidence-search result, optional valuation, optional confidence assessment, and warnings. The assembler copies these already-produced values; it does not calculate valuation, confidence, evidence eligibility, or a new explanation.[2]

| Existing report element | Permitted factual description                                 | Prohibited extension in this policy gate                           |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `status`                | Report processing status as emitted by the canonical flow.    | Claiming that the status measures valuation quality or confidence. |
| `methodology`           | The existing methodology document identifier and version.     | Changing methodology v1.2, its weights, or its coefficients.       |
| `evidence`              | Existing comparable-search result and availability state.     | Re-ranking, enriching, or replacing comparable selection.          |
| `valuation`             | Optional canonical-engine result already calculated upstream. | Recalculating, adjusting, or judging the value.                    |
| `confidence`            | Optional existing `ConfidenceAssessment`.                     | Adding a confidence score, a new basis, or a threshold.            |
| `warnings`              | Warnings already emitted by the canonical flow.               | Creating a new warning taxonomy or a new fallback.                 |

## 3. Required separation of concerns

### 3.1 Confidence is not Evidence Integrity

Evidence Integrity v1.0 is a facts-only DLD evidence-observation layer. It reports eligible evidence availability, insufficient local evidence, future-dated exclusion, outside-window exclusion, and observed rejection facts with provenance. Its contract explicitly remains independent of valuation and confidence, and its policy prohibits it from influencing either.[3] [4]

Therefore, no Phase 6 explanation may describe an Evidence Integrity status as a confidence level, fold its record counts into confidence, derive a score from it, or imply that an individual transaction is correct, fair, anomalous, or special. The existing public `evidenceIntegrity.report` query remains the sole approved Evidence Integrity API surface; this policy gate adds no new request input or response field.[4] [7]

### 3.2 Confidence is not Market Intelligence

Market Intelligence v1.0 is a separate, read-only descriptive DLD benchmark service. It uses District + Property Type evidence under its own 90-day availability rule and returns descriptive `pricePerSqm` statistics with provenance. It does not create a confidence label, valuation adjustment, recommendation, or threshold-based decision, and it may not invoke the Confidence Engine or valuation flow.[5]

No Phase 6 explanation may use Market Intelligence statistics to explain, change, corroborate, or contradict the existing confidence level. Market Intelligence has no approved dashboard, diagnostics UI, or endpoint in its policy; this gate does not create one.[5]

### 3.3 Confidence is not Comparable Selection

Comparable Selection CS-v1.0 is a deterministic, DLD-only, explanation-capable selection service. Its exclusion reasons describe selection eligibility and ordering, not valuation certainty. The policy prevents it from altering methodology, valuation, Confidence, Evidence Integrity, or Market Intelligence.[6]

Consequently, a future explanation may not convert an exclusion reason, selected-count condition, or deterministic ordering into a confidence component without a separate owner decision and methodology review. This gate does not connect the new Comparable Selection service to the canonical valuation flow or to any report/API surface.[6]

## 4. Facts that a future, separately approved explanation scope may preserve

The following statements are factual descriptions of existing fields, not authorization to build a new presentation surface. If a later owner-approved implementation uses them, it must preserve the source field, the originating module, and the distinction stated here.

| Fact category            | Factual statement that may be preserved                                                                  | Source boundary                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Confidence basis         | The emitted confidence assessment states that its basis is valuation-range width.                        | `ConfidenceAssessment.basis` only.                         |
| Confidence output        | The emitted assessment has one of the existing levels and includes the emitted percentage.               | `ConfidenceAssessment.level` and `rangeWidthPercent` only. |
| Evidence context         | The emitted assessment includes comparable count and oldest comparable age.                              | Context only; not a cause of the level.                    |
| Report traceability      | The assembled report identifies the existing methodology document/version and carries existing warnings. | `ValuationReport` only.                                    |
| Evidence integrity facts | Evidence Integrity availability and exclusion observations are separate DLD facts with provenance.       | EID-v1.0 response only.                                    |
| Market context facts     | Market Intelligence statistics are independent descriptive market context with provenance.               | MI-v1.0 response only.                                     |
| Selection facts          | Comparable Selection reasons describe deterministic inclusion or exclusion only.                         | CS-v1.0 result only.                                       |

## 5. Unresolved policy register

No entry below is a technical backlog item that may be implemented by default. Every entry requires an explicit owner decision before code, contract, API, UI, or methodology work begins.

| ID     | Unresolved decision                                                                                          | Why it is not resolved by current implementation                                          | Consequence until approved                                        |
| ------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CEX-01 | Public/API/UI surface for confidence explanations.                                                           | No standalone confidence endpoint or approved expanded report contract exists.            | No new endpoint, field, or screen.                                |
| CEX-02 | Exact audience-facing wording, ordering, styling, and accessibility treatment of confidence facts.           | Existing level literals do not themselves approve language, colour, icons, or ordering.   | Preserve existing UI behavior; add no new presentation treatment. |
| CEX-03 | Whether range inputs or methodology-approach outputs may be explained beyond their existing report fields.   | The policy gate does not authorize a new explanatory model or methodology interpretation. | Do not create per-approach attribution or causal claims.          |
| CEX-04 | Whether comparable count or age may become a confidence factor.                                              | They are currently returned as context but are not level inputs.                          | Do not change the confidence calculation or imply causal use.     |
| CEX-05 | Any relationship, joint display, aggregation, or cross-reference between Confidence and Evidence Integrity.  | EID-v1.0 is intentionally independent and facts-only.                                     | Do not score, combine, or translate one into the other.           |
| CEX-06 | Any relationship, joint display, aggregation, or cross-reference between Confidence and Market Intelligence. | MI-v1.0 is independent descriptive context with no approved UI/API surface.               | Do not use benchmark statistics in confidence explanation.        |
| CEX-07 | Any use of Comparable Selection CS-v1.0 results in canonical valuation, confidence, report, API, or UI.      | CS-v1.0 was delivered as an isolated service and is not wired into the canonical flow.    | Do not connect or expose it.                                      |
| CEX-08 | New confidence levels, numerical scores, thresholds, colour scales, fallback rules, or coefficients.         | None is approved by this gate or by methodology v1.2.                                     | Do not add or infer them.                                         |
| CEX-09 | Audit-record changes for an expanded explanation surface.                                                    | The existing report does not approve new audit storage or data-retention behavior.        | No audit-write or schema change.                                  |

## 6. Non-interference commitments

This policy gate makes and authorizes none of the following changes:

| Protected area                                                                               | Policy-gate outcome |
| -------------------------------------------------------------------------------------------- | ------------------- |
| Core Types, core results, and frozen contracts                                               | No change.          |
| Methodology v1.2, weights, coefficients, and comparable-selection rules                      | No change.          |
| Canonical Valuation Engine, confidence calculation, and valuation output                     | No change.          |
| Public `valuation.run` procedure, rate limit, and Evidence Integrity API                     | No change.          |
| Market Intelligence, Evidence Integrity, Comparable Selection, DLD data, and database schema | No change.          |
| UI and dashboard                                                                             | No change.          |

## 7. Readiness statement

The platform now has a documented, auditable boundary for a future Confidence & Explainability implementation: it can repeat existing emitted facts without recasting them as a new measure, without introducing a new source of truth, and without collapsing the independently governed Confidence, Evidence Integrity, Market Intelligence, and Comparable Selection layers.

The platform is **not** authorized by this record to build that implementation. The owner must approve a distinct implementation scope that names the chosen surface, permitted fields, wording and accessibility treatment, audit behavior, and any requested relationship to the independently governed layers.

## References

[1]: ../../server/engines/confidence/confidence.ts "Confidence assessment implementation"
[2]: ../../server/engines/reporting/valuation-report.ts "Valuation report assembly"
[3]: ../../contracts/evidence-integrity.contracts.ts "Evidence Integrity contracts"
[4]: ../policies/EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md "Evidence Integrity Diagnostics Policy v1.0"
[5]: ../policies/MARKET-INTELLIGENCE-POLICY.md "Market Intelligence Policy v1.0"
[6]: ../policies/COMPARABLE-SELECTION-POLICY.md "Comparable Selection Policy CS-v1.0"
[7]: ../../server/routers.ts "Current public tRPC procedure registry"
