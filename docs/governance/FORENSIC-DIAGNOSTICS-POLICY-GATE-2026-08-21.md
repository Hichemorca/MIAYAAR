# Forensic Diagnostics Policy Gate — Phase 7

**Status:** COMPLETE — policy-gate record only; no implementation authorized  
**Date:** 2026-08-21  
**Scope authority:** Owner-approved Phase 7 policy-gate scope  
**Implementation status:** No code, API, UI, contract, methodology, data, or database change

## 1. Purpose and governing conclusion

This policy gate determines what the platform can already state factually, what it must not call a forensic diagnosis, and which owner decisions are required before a separately scoped diagnostic capability could be considered. It does not authorize a new diagnostic service, classification, score, threshold, rule, API, user interface, report field, audit record, or use in valuation.

> **Governing conclusion:** MIAYAAR currently has Evidence Integrity Diagnostics v1.0, a deliberately narrow DLD facts-only evidence-observation layer. It is not a forensic-diagnostics engine. No additional forensic claim, taxonomy, decision rule, or output is approved by this gate.

The Phase 7 policy gate is complete as a documentation result. Phase 7 implementation remains blocked until the owner approves an independent scope that resolves every decision necessary for the requested diagnostic class.

## 2. Existing capability inventory

### 2.1 Evidence Integrity v1.0 is the only approved diagnostic-adjacent layer

Evidence Integrity v1.0 has a single DLD-only request scope: district, canonical property type, and explicit `asOf` date. Its evidence record permits only source identity and checksum, transaction date, district, property type, eligibility status, rejection reason, and ingest timestamp.[1]

Its bounded observation codes are:

| Existing observation               | Factual meaning                                                                        | What it does not mean                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `eligible_evidence_available`      | Eligible DLD records exist in the bounded request scope.                               | A transaction, price, or valuation is correct.                  |
| `insufficient_local_evidence`      | Fewer than the existing minimum eligible DLD records are present in the bounded scope. | A market, property, or valuation is defective.                  |
| `future_dated_evidence_excluded`   | A record is dated after the explicit `asOf` date.                                      | The record is invalid or suspicious.                            |
| `outside_window_evidence_excluded` | A record falls before the existing EID observation window.                             | The record is erroneous or irrelevant for every use.            |
| `rejected_evidence_observed`       | A record carries its existing eligibility/rejection state in the DLD path.             | A transaction is fraudulent, artificial, special, or mispriced. |

The current contract defines a 90-day EID window and a minimum eligible-record count of five. These are bounded Evidence Integrity v1.0 availability facts. They are not approved forensic thresholds, outlier limits, fraud indicators, data-quality scores, or valuation rules.[1] [2]

### 2.2 Existing provenance supports factual traceability, not a forensic conclusion

For each EID response, provenance preserves the DLD source, policy version, `asOf`, filters, count, source transaction identifiers, checksums, and record-level evidence status/rejection facts. This enables an observer to trace the factual observation to the approved DLD path.[1]

The presence of provenance does not authorize a system to infer motive, legal status, transaction validity, market manipulation, price error, seller intent, or property condition. Any such inference would require a separately approved claim definition, source basis, validation design, and governance decision.

### 2.3 Adjacent layers remain independent

| Layer                | Existing approved role                                                                          | Forensic Diagnostics boundary                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Confidence           | Emits a valuation-range-width confidence assessment and limited evidence context.               | It is not a data-quality or forensic score and may not absorb diagnostic signals.[3]                           |
| Market Intelligence  | Provides DLD-only descriptive market-context statistics with provenance.                        | It does not determine whether an observation is anomalous, correct, or suspicious.[4]                          |
| Comparable Selection | Selects/excludes in-memory DLD candidates deterministically and explains its selection reasons. | Exclusion reasons are not forensic labels and may not become diagnoses.[5]                                     |
| Canonical valuation  | Produces the canonical valuation under methodology v1.2.                                        | It must not be changed, blocked, adjusted, or scored by a diagnostic layer without a new methodology decision. |

## 3. Facts that may be preserved without a forensic implementation

The statements below are factual descriptions of existing approved outputs. They are not permission to compose a new diagnostic response, add a cross-layer display, or draw a conclusion beyond each source layer's contract.

| Fact category            | Permitted factual statement                                                                    | Source boundary                        |
| ------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| Evidence availability    | The current EID result is `available` or `unavailable` for its DLD district/type/`asOf` scope. | `EvidenceIntegrityResult.status` only. |
| Local sample observation | The current EID summary returns its eligible-record count and required existing count.         | `EvidenceIntegritySummary` only.       |
| Temporal exclusion       | EID reports future-dated and outside-window record counts within its explicit scope.           | Existing EID observations only.        |
| Existing rejection fact  | EID reports records that retain an existing DLD-path `rejected` status and rejection reason.   | Existing source status only.           |
| Traceability             | EID provenance identifies the existing source records and filters used by the response.        | `EvidenceIntegrityProvenance` only.    |
| Selection trace          | CS-v1.0 returns deterministic selection/exclusion reasons under its own policy.                | Comparable Selection result only.      |

## 4. Prohibited claims and actions

The following are expressly outside the approved EID-v1.0 facts-only boundary and remain prohibited unless an owner decision approves a future diagnostic methodology and implementation scope.

| Prohibited claim or action                                                                                      | Reason                                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Calling a sale price wrong, unfair, fabricated, inflated, depressed, or an outlier.                             | No approved definition, population, threshold, validation protocol, or appeal/correction process exists. |
| Labeling a transaction as special, distressed, related-party, manipulated, fraudulent, or non-arm's-length.     | No source-native evidence contract or approved inference rule supports the claim.                        |
| Creating a data-quality, integrity, risk, anomaly, or forensic score.                                           | No approved scale, input set, weights, threshold, calibration, or interpretation exists.                 |
| Converting EID availability/exclusion counts into a confidence factor.                                          | Confidence is independently governed and has an existing range-width basis only.                         |
| Using Market Intelligence statistics as an anomaly benchmark.                                                   | MI-v1.0 is descriptive market context, not an approved diagnostic benchmark.                             |
| Treating Comparable Selection exclusion as a finding about a transaction's truth or price.                      | CS-v1.0 reasons describe eligibility/selection only.                                                     |
| Altering, blocking, adjusting, ranking, or annotating canonical valuation output based on a diagnostic finding. | No methodology, engine, or audit-governance change is authorized.                                        |
| Building an endpoint, dashboard, report section, storage table, alert, or audit write for forensic diagnostics. | No surface, contract, audience, data-retention, or rights decision exists.                               |

## 5. Unresolved policy register

Every item in this register is `UNRESOLVED_POLICY`. It is not an implementation backlog that may be inferred, filled with defaults, or resolved by engineering discretion.

| ID     | Owner decision required                                                                                              | Why current policy is insufficient                                                                 | Consequence until approved                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| FDG-01 | Whether a forensic-diagnostics capability is needed beyond EID-v1.0.                                                 | Current policy authorizes facts-only evidence observations, not a forensic service.                | No additional diagnostic capability.                                                   |
| FDG-02 | The exact diagnostic claim taxonomy, including definitions and prohibited wording.                                   | No meaning has been approved for anomaly, error, integrity, risk, or special transaction.          | No labels or classifications.                                                          |
| FDG-03 | Source-of-truth and rights basis for each proposed diagnostic input.                                                 | DLD path does not provide the secondary/legal/intent attributes needed for many diagnostic claims. | No inferred project, finish, view, floor, rent, legal-rights, zoning, or intent facts. |
| FDG-04 | Unit of analysis and population: individual record, comparable set, district/type cohort, or another approved scope. | Existing layers operate on different bounded scopes and cannot be combined by default.             | No cross-record or cohort diagnostic rule.                                             |
| FDG-05 | Temporal policy: `asOf`, observation window, backfill, and treatment of late/revised records.                        | The EID 90-day window is an availability rule, not a forensic policy.                              | No diagnostic time rule.                                                               |
| FDG-06 | Rule origin, thresholds, coefficients, and calibration/validation protocol.                                          | No benchmark, coefficient, threshold, or fallback rule is approved.                                | No scoring, flagging, or threshold-based result.                                       |
| FDG-07 | Provenance, reproducibility, human-review, correction, and appeal requirements.                                      | Existing provenance is factual traceability only and has no diagnostic case-management protocol.   | No case record or operational workflow.                                                |
| FDG-08 | Whether and how diagnostics may relate to valuation, confidence, MI, EID, or CS.                                     | All current layers are explicitly independent.                                                     | No interaction or combined display.                                                    |
| FDG-09 | API/UI audience, authorization, language, accessibility, retention, and audit behavior.                              | No exposure surface has been approved.                                                             | No API/UI/storage/alert implementation.                                                |

## 6. Non-interference commitments

This policy gate neither makes nor authorizes a change to any protected area below.

| Protected area                                                                           | Policy-gate outcome |
| ---------------------------------------------------------------------------------------- | ------------------- |
| Core Types, core results, and frozen contracts                                           | No change.          |
| Methodology v1.2, weights, coefficients, time adjustment, and comparable-selection rules | No change.          |
| Canonical Valuation Engine, valuation output, and existing Confidence calculation        | No change.          |
| Public `valuation.run`, rate limit, EID API, and router surface                          | No change.          |
| DLD ingestion, data, database schema, provenance store, and source rights posture        | No change.          |
| Evidence Integrity, Market Intelligence, Comparable Selection, and UI                    | No change.          |

## 7. Readiness statement

The governance prerequisite for a future forensic-diagnostics discussion is now explicit: EID-v1.0 remains the sole approved diagnostic-adjacent capability, and it may preserve only its existing DLD evidence facts with provenance. A future implementation must begin with an owner-approved resolution of the relevant FDG decisions above; it may not promote EID observations, confidence context, market statistics, or comparable-selection reasons into forensic findings by default.

No Phase 7 implementation is authorized by this document. The owner must approve a separate scope before any rule, contract, source, API, UI, storage, test fixture, or operational workflow is created.

## References

[1]: ../../contracts/evidence-integrity.contracts.ts "Evidence Integrity contracts"
[2]: ../policies/EVIDENCE-INTEGRITY-DIAGNOSTICS-POLICY.md "Evidence Integrity Diagnostics Policy v1.0"
[3]: ../../server/engines/confidence/confidence.ts "Confidence assessment implementation"
[4]: ../policies/MARKET-INTELLIGENCE-POLICY.md "Market Intelligence Policy v1.0"
[5]: ../policies/COMPARABLE-SELECTION-POLICY.md "Comparable Selection Policy CS-v1.0"
