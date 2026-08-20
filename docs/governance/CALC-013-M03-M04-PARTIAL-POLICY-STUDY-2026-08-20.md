# CALC-013 — M-03/M-04 Partial-Approach Policy Study

**Status:** Documentation study — no partial-result policy is accepted  
**Date:** 2026-08-20  
**Scope:** `M-03` sales-only availability and `M-04` mixed partial availability, evaluated by frozen v1.2 property type and scenario.  
**Methodology impact:** None. `MIAYAAR-METH-001` v1.2 remains frozen.

## 1. Purpose, owner direction, and binding boundary

The owner has permitted **policy design and evidence review only** for `M-03` and `M-04`. This study identifies the factual availability states that exist in the present server-side flow, records the evidence that would be required to investigate a later release, and preserves every unapproved decision as `UNRESOLVED_POLICY`. It does not approve a result subset, a normalization formula, a rejection rule, a confidence rule, a threshold, a coefficient, or a new methodology version.[1] [2]

The scope is deliberately narrower than a methodology release. It does not change source code, runtime behavior, `valuation.run`, contracts, data, database schema, weights, coefficients, comparable selection, confidence output, or historical records. The current normalized-active-weight behavior remains an **observed and disclosed provisional implementation**, not an accepted partial-result policy.[2] [3]

> “No policy formula, applicability matrix, acceptance threshold, coefficient, fallback rule, or new methodology version is adopted here.” — ADR-012.[1]

| Included in this study                                            | Explicitly excluded                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Identification of present `M-03` and `M-04` availability states   | Authorizing any state to return a deliverable valuation                     |
| Evidence provenance and validation gaps for income, cost, and DCF | Changing frozen v1.2 weights or active-weight normalization                 |
| A property-type/scenario research map                             | Inventing a benchmark, threshold, fallback, coefficient, or synthetic input |
| A future validation and release-gate checklist                    | Modifying client, server, engine, API, contracts, or database               |

## 2. Governing source hierarchy

The study uses the canonical runtime configuration and contracts where documentation differs. ADR-011 names `engines/valuation/methodology-v1_2.ts` as the immutable runtime source for `MIAYAAR-METH-001` v1.2, while `core/results/` defines `partial` only as an engine-completion status with reduced output. Neither source authorizes delivery of a valuation from an incomplete set of positive-weight approaches.[3] [4]

| Priority | Governing source                                      | Consequence for this study                                                                             |
| -------: | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
|        1 | `core/types/`, `core/results/`, and `core/contracts/` | The Result Object remains unchanged; `partial` is not an approval decision.[4]                         |
|        2 | `engines/valuation/methodology-v1_2.ts` and ADR-011   | Positive configured approaches are derived only from frozen v1.2 weights.[3]                           |
|        3 | ADR-012 and the CALC-013 policy gate                  | M-03/M-04 may be researched, but no formula or eligible subset is approved.[1] [2]                     |
|        4 | Eligibility matrix proposal                           | Local DLD sales evidence remains mandatory; only M-03/M-04 are candidates for future policy design.[5] |
|        5 | Foundational methodology narrative                    | It supplies background only where it does not conflict with the canonical v1.2 source.[6]              |

## 3. Established system facts

Eligible local DLD transactions are the sole current evidence source for the sales-comparison approach. The production adapter can construct income input only from user-supplied `annualRentAed`; it can construct cost input only when replacement cost and depreciation are supplied; and it intentionally does not construct DCF input because DCF requires independently supplied NOI. DLD evidence alone therefore cannot validate that any missing non-sales approach should be reweighted or that a partial value should be deliverable.[2] [7]

The engine currently calculates every structurally usable approach, normalizes its frozen configured weight by the sum of available weights, and emits `partial` whenever warnings exist. Both the aggregation and the status disposition are explicitly marked `PROVISIONAL` under `CALC-013` and `CALC-016`; they are implementation facts only.[2] [8]

| Fact                        | Source-backed present state                                                         | Policy consequence                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Local DLD sales evidence    | Required for the comparable path; its absence follows the evidence-unavailable path | `M-01` remains rejected; this study creates no exception.[5] [7]                      |
| Income input                | Present only when annual rent is submitted                                          | Its provenance, validation, and suitability for partial delivery are not approved.[7] |
| Cost input                  | Present only with replacement cost and depreciation inputs                          | Its provenance, validation, and suitability for partial delivery are not approved.[7] |
| DCF input                   | Intentionally absent from the current production adapter                            | A later release cannot infer availability from DLD or this study.[7]                  |
| Active-weight normalization | Executed by the engine and labelled provisional                                     | It is not evidence that M-03 or M-04 is eligible.[2] [8]                              |
| `partial` status            | Defined as reduced engine output; currently selected when warnings exist            | Deliverability and disclosure remain `UNRESOLVED_POLICY`.[4] [8]                      |

## 4. Definitions applied to M-03 and M-04

The definitions below describe availability, not valuation eligibility. “Positive” always means a weight greater than zero in the exact frozen v1.2 configuration for the relevant property type and scenario. A zero-weight approach is not a missing positive-weight approach and must not be used to create an artificial partial state.[3] [5]

| State                           | Availability definition                                                                                       | Status in this study                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `M-03`                          | Sales comparison is the only usable approach and one or more other positive-weight approaches are unavailable | Candidate for evidence research only; result disposition is `UNRESOLVED_POLICY`.[5]                       |
| `M-04`                          | Sales comparison and at least one, but not all, other positive-weight approaches are usable                   | Candidate for evidence research only; no subset is permitted or prohibited beyond existing rejections.[5] |
| `M-01`                          | No eligible local sales evidence                                                                              | Rejected by the existing architectural evidence rule; out of scope.[5]                                    |
| Full configured set             | All positive-weight approaches are usable                                                                     | Outside CALC-013; frozen configuration applies unchanged.[5]                                              |
| Indeterminate or invalid output | The positive set cannot be determined, or an output is invalid                                                | Rejected pending evidence; out of scope.[5]                                                               |

## 5. Frozen v1.2 availability map

The following map is a **research inventory**, not a future eligibility matrix. It names only what the frozen configuration makes logically relevant. It neither approves M-03/M-04 nor assigns any new weight. The production adapter facts are shown separately so that a configuration-level possibility is not mistaken for a currently evidenced server-side route.[3] [7]

| Frozen v1.2 property type | Positive configured approaches in every scenario | M-03 can be observed when                                 | M-04 can be observed in the current adapter                                                                      | Study boundary                                                                                      |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Apartment                 | Sales, income, cost, DCF                         | Sales is usable and income, cost, and DCF are unavailable | Income and/or cost are usable with sales, while DCF remains unavailable                                          | Every individual subset remains `UNRESOLVED_POLICY`.[3] [7]                                         |
| Villa                     | Sales, income, cost, DCF                         | Sales is usable and income, cost, and DCF are unavailable | Income and/or cost are usable with sales, while DCF remains unavailable                                          | Every individual subset remains `UNRESOLVED_POLICY`.[3] [7]                                         |
| Townhouse                 | Sales, income, cost, DCF                         | Sales is usable and income, cost, and DCF are unavailable | Income and/or cost are usable with sales, while DCF remains unavailable                                          | Every individual subset remains `UNRESOLVED_POLICY`.[3] [7]                                         |
| Office                    | Sales, income, cost, DCF                         | Sales is usable and income, cost, and DCF are unavailable | Income and/or cost are usable with sales, while DCF remains unavailable                                          | Every individual subset remains `UNRESOLVED_POLICY`.[3] [7]                                         |
| Retail                    | Sales, income, cost, DCF                         | Sales is usable and income, cost, and DCF are unavailable | Income and/or cost are usable with sales, while DCF remains unavailable                                          | Every individual subset remains `UNRESOLVED_POLICY`.[3] [7]                                         |
| Land                      | Sales and DCF                                    | Sales is usable and DCF is unavailable                    | Not logically present: the only non-sales positive approach is DCF, so sales plus DCF is the full configured set | M-04 has no frozen-v1.2 Land subset to evaluate; this is not an eligibility decision.[3] [7]        |
| Warehouse                 | No v1.2 allocation                               | Not applicable                                            | Not applicable                                                                                                   | The engine rejects the unsupported property type; no partial-policy exception is introduced.[3] [8] |

The foundational methodology narrative describes the cost approach as inapplicable to apartments, whereas the later canonical v1.2 configuration assigns it a positive weight. ADR-011 and the established source hierarchy resolve the runtime question in favor of v1.2. The textual mismatch remains a `DOCUMENT_ALIGNMENT_GAP`; it must be reconciled before any proposed methodology release relies on a property-type applicability narrative.[3] [6] [9]

## 6. M-03 study finding: sales-only availability

M-03 has a local DLD sales-evidence foundation but no currently approved rule that converts that fact into a deliverable valuation when another positive-weight approach is missing. This is particularly material for office and retail, whose frozen baseline allocations place more weight on income than on sales; the values are part of the frozen configuration, not evidence that sales-only delivery is appropriate.[3]

For apartment, villa, townhouse, office, and retail, the current adapter makes sales-only availability a reachable runtime condition because income and cost inputs are optional and DCF is intentionally absent. For land, sales-only is likewise reachable when DCF is unavailable. These facts do not establish equivalence across property types, scenarios, or missing-method patterns; a future policy must evaluate each exact configuration independently.[3] [7]

| M-03 policy question                                       | Present answer                                               | Required future artefact before an answer can be adopted                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| May sales-only output be delivered?                        | `UNRESOLVED_POLICY`                                          | Owner-approved property-type/scenario matrix and a methodology-release ADR.[1] [5]                                 |
| May active weights be normalized to sales?                 | `UNRESOLVED_POLICY`; current runtime behavior is provisional | Evidence-led formula decision, comparative validation, regression suite, and independent review.[1] [2]            |
| Are submitted rent/cost facts enough to avoid M-03?        | No provenance or validation policy is accepted               | Evidence contract for the non-sales input, including source, linkage, timing, validation, and audit record.[1] [7] |
| Can Land M-03 be treated like residential/commercial M-03? | `UNRESOLVED_POLICY`                                          | A Land-specific evidence and validation analysis for the missing DCF approach.[3] [5]                              |

## 7. M-04 study finding: mixed partial availability

M-04 concerns a set that retains sales evidence and one or more non-sales approach results but is still incomplete. In the present public server-side flow, this can occur for apartment, villa, townhouse, office, and retail when income and/or cost inputs are structurally valid. DCF remains unavailable through the adapter, so these states are not evidence that the full configured set is available.[3] [7]

The fact that two approaches are available is not a policy basis for preferring M-04 over M-03. No approved source specifies which retained subset is representative for a property type, which missing approach is material, how a subset should be weighted, or whether a partial value may be delivered. The study therefore records no permitted M-04 subset.[1] [2] [5]

| M-04 policy question                                | Present answer                             | Required future artefact before an answer can be adopted                                                     |
| --------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Which exact subsets may be delivered?               | `UNRESOLVED_POLICY`                        | Versioned mapping for every property type, scenario, configured positive set, and available subset.[1] [5]   |
| Does income plus sales differ from cost plus sales? | `UNRESOLVED_POLICY`                        | Independent evidence and a pre-specified comparison protocol for each retained approach.[1] [7]              |
| Is a DCF-missing subset permissible?                | `UNRESOLVED_POLICY`                        | A policy decision plus independently evidenced NOI/DCF availability; the adapter currently omits DCF.[1] [7] |
| Is M-04 available for Land?                         | No; the positive set is only sales and DCF | Not applicable under frozen v1.2 logic, without creating a new method or weight.[3]                          |

## 8. Evidence and provenance requirements for a later candidate

The following is a **research requirement list**, not an acceptance threshold or fallback policy. It derives from the absence of non-sales fields in the eligible DLD schema and from ADR-012’s requirement that a later release define insufficient-evidence outcomes without fabricating allocations.[1] [10]

| Retained or missing approach | Evidence that is currently established                                                                          | Gap that must be closed before a partial-policy release can be evaluated                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sales comparison             | Eligible local DLD transactions with transaction date, district, normalized property type, area, and sale price | Continue using the governed local-evidence policy; do not substitute geography or synthetic sales evidence.[5] [10]                                          |
| Income capitalization        | User can submit annual rent; DLD has no rental or NOI fields                                                    | Approved source/provenance, asset linkage, as-of handling, validation, audit retention, and a defined insufficient-evidence outcome.[1] [7] [10]             |
| Cost                         | User can submit replacement cost and depreciation; DLD does not carry those facts                               | Approved source/provenance, property-specific linkage, as-of handling, validation, audit retention, and a defined insufficient-evidence outcome.[1] [7] [10] |
| DCF                          | The engine can calculate DCF when input exists, but the public adapter intentionally does not supply it         | Approved independent NOI source, evidence contract, server-side input path, validation, audit retention, and a defined insufficient-evidence outcome.[1] [7] |

No source in the current evidence record authorizes invented rental income, replacement cost, depreciation, NOI, geographic substitutes, coefficients, or thresholds merely to complete a set. If the required evidence is unavailable, the later policy candidate must preserve an unavailable or rejected outcome rather than manufacture an approach.[1] [2] [5]

## 9. Validation design boundary

Current DLD-only backtesting validates a historically available local-comparables estimate, not the accuracy of income, cost, DCF, or an incomplete-approach aggregation policy. Any later candidate must therefore use a separately approved protocol and an evidence population in which observed non-sales inputs and the outcome can be independently audited. It may not derive a conclusion about M-03 or M-04 merely from the current DLD-only study.[9] [10]

| Required stage before a methodology decision | Required record                                                                                    | Prohibited shortcut                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Define the candidate population              | Versioned property-type/scenario map and data dictionary for all retained and missing approaches   | Treating all property types or scenarios as equivalent                           |
| Establish evidence                           | Source-level provenance, timing, property linkage, validation state, and immutable audit reference | Treating user submission or a missing DLD field as validated evidence by default |
| Pre-specify comparison                       | Candidate subset, rejection cases, observed outcome, and analysis procedure                        | Selecting a subset after observing its apparent performance                      |
| Run isolated validation                      | Read-only, time-aware evaluation with no leakage and no production audit writes                    | Replaying `valuation.run` against production evidence logs for research          |
| Preserve compatibility                       | Regression evidence proving v1.2 historic outputs and decision records remain unchanged            | Recalculating or reclassifying historical v1.2 valuations                        |
| Release only after review                    | Proposed ADR, independent review, owner approval, CI, and merge record                             | Treating this study or current runtime behavior as authorization to implement    |

## 10. Policy gaps retained explicitly

The following issues remain unresolved by design. They are not defects to be filled by an implementation choice, and they block a methodology change until suitable evidence and a separately accepted ADR exist.[1] [2]

| Identifier   | Unresolved decision                                                                                        | Effect now                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `PARTIAL-01` | Deliverability of M-03 by property type and scenario                                                       | No sales-only subset is approved                                                                         |
| `PARTIAL-02` | Deliverability of each M-04 available subset                                                               | No mixed subset is approved                                                                              |
| `PARTIAL-03` | Formula for any incomplete-set aggregation                                                                 | Current normalization remains provisional only                                                           |
| `PARTIAL-04` | Evidence provenance and validation standard for rent, cost, depreciation, NOI, and DCF                     | Non-sales availability cannot be treated as policy-qualified evidence                                    |
| `PARTIAL-05` | Relationship between result status `partial`, final reporting, and CALC-016                                | Contract status does not authorize delivery                                                              |
| `PARTIAL-06` | Comparative validation design and observed outcome source                                                  | DLD-only backtesting cannot validate the policy                                                          |
| `PARTIAL-07` | Reconciliation of the foundational cost-applicability narrative with v1.2 apartment weights                | Canonical v1.2 governs runtime; editorial alignment is still required                                    |
| `PARTIAL-08` | Identifier reconciliation between the owner-facing “invalid output” label and the merged matrix’s M-06 row | No state label is reinterpreted by this study; reconcile the audit vocabulary before a release candidate |

## 11. No implementation effect and next decision

This study makes no implementation recommendation. It confirms that M-03 and M-04 are appropriate **subjects for evidence research**, not that they are eligible for partial delivery. M-01 continues to reject when eligible local DLD sales evidence is absent, and invalid or indeterminate states retain the existing failure path. The frozen weights, formulas, warnings, result contract, API, and decision records remain unchanged.[2] [3] [5]

The next bounded owner decision, if the project chooses to continue, is whether to authorize a separate **evidence-acquisition and validation-protocol design** for M-03 and M-04. Such authorization would still not approve any subset, formula, coefficient, threshold, code change, or methodology release. A later acceptance would require a complete property-type/scenario matrix, evidence contract, comparative validation results, regression coverage, independent review, and a separately accepted methodology ADR.[1] [11]

## References

[1]: ../ADR/ADR-012-proposed-missing-approach-policy-direction.md "ADR-012 — Proposed Direction for Missing-Approach Weight Normalization"
[2]: CALC-013-POLICY-GATE-2026-08-20.md "CALC-013 — POLICY GATE"
[3]: ../ADR/ADR-011-canonical-frozen-valuation-methodology-v1-2.md "ADR-011 — Canonical Frozen Valuation Methodology v1.2"
[4]: ../../core/results/result.contract.ts "Canonical Result Object contract"
[5]: CALC-013-MISSING-APPROACH-ELIGIBILITY-MATRIX-PROPOSAL-2026-08-20.md "CALC-013 — Missing-Approach Eligibility Matrix Proposal"
[6]: ../VALUATION-METHODOLOGY.md "MIAYAAR Valuation Methodology"
[7]: ../../server/engines/orchestrator/core-valuation-adapter.ts "Server-side canonical valuation-data adapter"
[8]: ../../engines/valuation/valuation.engine.ts "Valuation Engine provisional aggregation and result status"
[9]: ../verification/2026-08-19-methodology-v1_2-governance-review.md "v1.2 methodology governance review"
[10]: ../verification/2026-08-19-dld-observable-backtesting-protocol.md "DLD-observable backtesting protocol"
[11]: ../ADR/ADR-TEMPLATE-METHODOLOGY-RELEASE.md "Methodology release ADR template"
