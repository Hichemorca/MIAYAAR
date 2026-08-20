# CALC-013 — M-03/M-04 Evidence Acquisition and Validation Protocol

**Status:** Research protocol — no partial-result policy is accepted  
**Date:** 2026-08-20  
**Scope:** Evidence acquisition and isolated validation design for `M-03` sales-only availability and `M-04` mixed partial availability.  
**Methodology impact:** None. `MIAYAAR-METH-001` v1.2 remains frozen.

## 1. Purpose and binding boundary

This protocol converts the approved M-03/M-04 research direction into a reproducible **evidence investigation process**. It defines what must be captured, preserved, and checked before a later methodology-release decision may assess non-sales evidence. It does not decide whether any partial set is representative, deliverable, or eligible for reweighting.[1] [2]

> “No policy formula, applicability matrix, acceptance threshold, coefficient, fallback rule, or new methodology version is adopted here.” — ADR-012.[1]

The protocol is deliberately a documentation and test-design artefact. It does not create a source catalogue, approve a data provider, set a sample minimum, define a linkage tolerance, assign a freshness window, introduce a benchmark, or change a runtime result. Any such choice remains an explicit `UNRESOLVED_POLICY` decision for a future owner-approved methodology release.[1] [3]

| Included                                                             | Explicitly excluded                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Evidence-pack structure for possible income, cost, and DCF inputs    | Permitting `M-03` or `M-04` to produce a deliverable valuation           |
| Provenance, subject-linkage, timing, integrity, and isolation checks | Changing the engine's active-weight normalization or `partial` behavior  |
| Isolated validation design and required audit artefacts              | Adding a source, storage table, API field, importer, contract, or UI     |
| Release-gate evidence for a later ADR                                | Defining a coefficient, threshold, fallback, subset, or reweighting rule |

## 2. Governing sources and established baseline

The canonical contracts and frozen v1.2 configuration govern this protocol. The present evidence flow contains auditable DLD transaction provenance for sales comparables, but non-sales inputs are presently derived from user submission fields without a separate source-evidence contract. The adapter intentionally omits DCF input because independently supplied NOI is absent.[2] [4] [5]

| Priority | Source                                                    | Protocol consequence                                                                              |
| -------: | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
|        1 | `core/types/`, `core/results/`, and `core/contracts/`     | No result-object or `partial` semantics may be changed by this protocol.                          |
|        2 | `engines/valuation/methodology-v1_2.ts` and ADR-011       | Property type, scenario, and positive-weight applicability remain frozen.                         |
|        3 | ADR-012, CALC-013 policy gate, and the M-03/M-04 study    | Research is permitted; delivery, formulas, and eligibility remain unresolved.                     |
|        4 | Existing evidence contracts, adapter, and database schema | The protocol must distinguish current DLD provenance from ungoverned non-sales submission fields. |

The `marketTransactions` and `dldImportRuns` records preserve source transaction identifiers, checksums, transaction dates, import metadata, and evidence eligibility for DLD sales evidence. No equivalent persisted provenance structure exists for income, cost, or DCF evidence, and this document does not add one.[4] [6]

## 3. Protocol model

The protocol separates **evidence collection** from **methodology eligibility**. A record may be complete enough to study its provenance yet still be unusable for valuation. Conversely, the absence of a non-sales evidence pack does not relax the local-DLD requirement for the sales approach.

| Layer                  | Required research question                                                                                               | Allowed output                                                   | Not an allowed output                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Source registration    | Who supplied the record, under what authority, and what exact source artefact identifies it?                             | A source record with unresolved-authority flags where applicable | An approved provider list                              |
| Capture and integrity  | Can the raw record, capture time, checksum or equivalent immutable fingerprint, and transformation history be preserved? | A reproducible evidence pack or an integrity-gap record          | A synthetic replacement value                          |
| Subject linkage        | What record-level facts support linkage to the submitted subject property?                                               | A documented linkage claim and unresolved-linkage flag if needed | An inferred legal-property identity                    |
| Timing                 | What are the source observation/effective date, acquisition time, and requested valuation `asOf`?                        | A three-date chronology                                          | A freshness threshold or automatic temporal acceptance |
| Approach mapping       | Which raw facts are proposed for the income, cost, or DCF input contract?                                                | A field-to-field mapping with units and currency preserved       | A calculated valuation input or adjustment             |
| Independent validation | Can another reviewer reproduce the raw-to-mapped evidence record in isolation?                                           | A pass, gap, or conflict observation with artefacts              | A partial-result approval                              |
| Release decision       | Have policy owners approved a methodology release after the evidence study?                                              | An ADR decision or an unresolved register                        | A runtime change made by this protocol                 |

## 4. Required evidence-pack envelope

Every candidate non-sales evidence pack must preserve the following envelope before its contents are considered in the research dataset. These are **recording requirements**, not value-acceptance thresholds.

| Envelope element          | Required record                                                                                              | Current status                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Evidence-pack identifier  | An immutable local research identifier, distinct from a valuation request identifier                         | No canonical non-sales evidence identifier exists.                                                            |
| Source identity           | Source organisation/system label and source-record identifier where exposed                                  | `UNRESOLVED_POLICY`: no non-sales source register is approved.                                                |
| Source artefact           | Reference to the original permitted document, response, or extract and its retention location                | No retention design is approved.                                                                              |
| Capture provenance        | Acquirer identity, acquisition timestamp, method, and raw-content checksum or equivalent fingerprint         | Existing DLD import provenance is not a substitute for non-sales provenance.                                  |
| Subject-linkage assertion | The exact facts offered to relate the record to the submitted subject, plus the submitted-request identifier | The current submitted-property identifier is request-scoped, not an independently verified legal identity.[5] |
| Temporal record           | Source observation/effective date, acquisition time, and the valuation request `asOf`                        | No cross-source temporal policy is approved.                                                                  |
| Raw values and units      | Untransformed source values, stated unit, currency, period, and source terminology                           | No normalization or conversion rule is approved.                                                              |
| Mapping record            | A transparent mapping from each raw fact to a named engine-contract field, including omissions               | Mapping may be studied; it must not call the engine.                                                          |
| Transformation ledger     | Ordered, reversible or otherwise fully disclosed extraction/normalization steps                              | No transformation method may introduce a coefficient or estimate.                                             |
| Reviewer record           | Independent reviewer identity, review time, evidence artefacts inspected, and recorded gaps/conflicts        | Independent-review role and acceptance rule remain unresolved.                                                |

## 5. Evidence lanes by approach

The following lanes are bounded by existing raw input contracts. They specify the facts that a future evidence pack must **document** if those engine inputs are later studied; they do not approve those facts, their sources, or their use in an approach.[5]

| Approach              | Current adapter status                                                | Candidate raw facts to preserve                                                                                                                                              | Mandatory protocol questions                                                                                                  | Prohibited inference                                                                                              |
| --------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Sales comparison      | Supported only with eligible local DLD comparables                    | Existing source transaction ID, DLD checksum/import provenance, transaction date, district, type, area, sale price, and eligibility status                                   | Does the DLD record remain eligible for the exact request context and `asOf`?                                                 | Replacing missing DLD sales evidence with another geography, source, or estimated price                           |
| Income capitalization | Constructed only when `annualRentAed` is submitted                    | Gross annual rent, stated rent period, currency, source identity, source artefact, subject-linkage facts, effective/observation date, and capture provenance                 | Can the submitted rent be traced to a source record and mapped to `grossRent` without hidden transformation?                  | Treating a submitted amount as independently verified, or deriving vacancy, expense, or cap-rate evidence from it |
| Cost                  | Constructed only when replacement cost and depreciation are submitted | Replacement cost per area unit, depreciation factor, optional land component, unit, currency, source identity, source artefact, subject-linkage facts, dates, and provenance | Can every proposed input be traced to a source record and mapped to the existing `CostData` fields?                           | Deriving missing cost/depreciation figures or converting an unsupported construction description into a factor    |
| DCF                   | Intentionally omitted by the current adapter                          | Initial NOI, projection period, rental growth, discount rate, exit cap rate, exit costs, period/currency/unit, source artefacts, linkage, dates, and provenance              | Can a future independent evidence pack establish each existing `DCFData` field without relying on DLD or a hidden assumption? | Inferring NOI, forward rates, or terminal assumptions from DLD sales evidence or from this protocol               |

The existing engine contracts define the raw `IncomeData`, `CostData`, and `DCFData` fields. This protocol does not alter the fact that the adapter currently derives some income assumptions from frozen methodology configuration and deliberately omits DCF input.[5] [7]

## 6. Property-type and scenario research units

Each evidence pack must be analysed against one exact **frozen v1.2 property type and scenario identifier**. Evidence must not be generalized from one property type, scenario, or missing-approach pattern to another without a future approved decision. The table is a research inventory, not an applicability matrix.[2] [3]

| Research unit | Positive v1.2 approaches | M-03 evidence investigation                             | M-04 evidence investigation                                                                 | Current protocol disposition             |
| ------------- | ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Apartment     | Sales, income, cost, DCF | Document missing income, cost, and DCF packs separately | Document any income/cost pack separately; DCF remains a distinct missing lane               | Research only                            |
| Villa         | Sales, income, cost, DCF | Document missing income, cost, and DCF packs separately | Document any income/cost pack separately; DCF remains a distinct missing lane               | Research only                            |
| Townhouse     | Sales, income, cost, DCF | Document missing income, cost, and DCF packs separately | Document any income/cost pack separately; DCF remains a distinct missing lane               | Research only                            |
| Office        | Sales, income, cost, DCF | Document missing income, cost, and DCF packs separately | Document any income/cost pack separately; DCF remains a distinct missing lane               | Research only                            |
| Retail        | Sales, income, cost, DCF | Document missing income, cost, and DCF packs separately | Document any income/cost pack separately; DCF remains a distinct missing lane               | Research only                            |
| Land          | Sales, DCF               | Document the absent DCF evidence lane                   | Not a partial subset when Sales and DCF are both available; that is the full configured set | Research only for M-03                   |
| Warehouse     | No v1.2 allocation       | Not applicable                                          | Not applicable                                                                              | Unsupported; no partial-policy exception |

## 7. Isolated validation protocol

Validation must run in an isolated research environment with no connection that can write to production DLD evidence, valuation requests, valuation audit events, methodology versions, or a public API response. Candidate packs are research artefacts only; a validation run must not invoke `valuation.run` or persist a valuation result.[4] [6]

| Validation check          | Required artefacts                                                                            | Valid observation                                                | Decision expressly withheld                         |
| ------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| Provenance reconstruction | Source artefact reference, capture record, fingerprint, and transformation ledger             | Whether an auditor can reconstruct the recorded lineage          | Whether the source is approved for production use   |
| Subject-linkage review    | Submitted-request context and documented linkage facts                                        | Whether linkage facts are present, absent, or conflicting        | Whether the linkage is sufficient for a valuation   |
| Temporal reconstruction   | Observation/effective date, acquisition date, and request `asOf`                              | Whether the chronology is fully recorded                         | Whether any date relationship is acceptable         |
| Field-mapping review      | Raw record, unit/currency/period labels, and mapping ledger                                   | Whether each proposed contract field has an explicit source path | Whether any input value is economically appropriate |
| Cross-review              | Two independently recorded review artefacts where the owner later defines reviewer governance | Whether reviewers agree, disagree, or record a gap               | Which reviewer outcome authorizes policy adoption   |
| Regression isolation      | Snapshot of the unchanged baseline and proof that no candidate data reaches runtime           | Whether current engine/API behavior remains unchanged            | Whether a partial result may be released            |

The protocol uses no numerical pass rate, confidence score, price classification, or materiality threshold. It records only the presence, absence, reproducibility, or conflict of evidence artefacts.

## 8. Audit package and decision record

Each research run should assemble a read-only audit package containing the request context, evidence-pack envelopes, raw-artifact references, checksums or fingerprints, all transformation ledgers, reviewer observations, a list of unresolved items, and a cryptographic or immutable reference to the frozen methodology version evaluated. The production schema already illustrates the requirement for immutable methodology versioning and append-only audit events; it does not provide authorization to extend those structures in this protocol.[6]

The decision record must state one of the following research outcomes without mapping it to a valuation status: **evidence not collected**, **provenance incomplete**, **linkage unresolved**, **timing unresolved**, **field mapping incomplete**, **review conflict recorded**, or **research pack documented**. “Research pack documented” means only that the protocol artefacts are present; it does not mean usable, representative, accepted, or deliverable.

## 9. Policy decisions intentionally left unresolved

| Identifier | Unresolved decision                                                                                    | Why the protocol cannot decide it                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| EP-01      | Approved source catalogue and data-use authority for income, cost, and DCF evidence                    | No governing source catalogue exists.                                                           |
| EP-02      | Subject-property identity/linkage contract                                                             | The current property identity is request-scoped and no external legal-linkage field is defined. |
| EP-03      | Permitted temporal relationship among observation date, acquisition date, and `asOf`                   | No cross-source freshness or temporal policy exists.                                            |
| EP-04      | Unit/currency/period normalization policy                                                              | Conversion or normalization can change economic meaning and is not approved.                    |
| EP-05      | Independent reviewer role, independence test, and resolution of disagreement                           | Governance is not defined in current contracts or ADRs.                                         |
| EP-06      | Any acceptance criterion for a non-sales evidence pack                                                 | It would be a methodology/policy threshold, which this protocol cannot invent.                  |
| EP-07      | Whether a complete evidence pack makes an approach usable, and whether an M-03/M-04 set is deliverable | This is the core future partial-policy decision.                                                |
| EP-08      | Change control, retention, and production storage design for non-sales evidence                        | No storage schema or operational policy is approved.                                            |

## 10. Required exit gate before any methodology proposal

No partial-policy ADR, code change, or release may rely on this protocol alone. A later proposal must separately provide an owner-approved source policy, evidence-linkage contract, temporal and normalization rules, an isolated validation corpus with documented provenance, regression evidence against the frozen baseline, an independent review record, and an explicit owner decision for each property type, scenario, and exact retained/missing approach set.[1] [2] [3]

Until those artefacts exist and a new methodology version is approved, `M-01` remains rejected where local DLD sales evidence is absent; `M-03` and `M-04` remain research states only; the full frozen approach set remains outside CALC-013; and unsupported or invalid configurations retain their existing rejection path.[2] [3]

## 11. Non-interference confirmation

This protocol creates no code, migration, API, database, importer, source connector, data record, UI element, valuation output, confidence score, pricing classification, coefficient, benchmark, threshold, fallback rule, formula, or methodology version. It does not modify the canonical valuation engine, frozen v1.2 weights, scenario configuration, comparable-selection behavior, DLD evidence registry, or decision-log behavior.

## References

[1]: ../ADR/ADR-012-proposed-missing-approach-policy-direction.md "ADR-012 — Missing Approach Policy Direction"
[2]: CALC-013-POLICY-GATE-2026-08-20.md "CALC-013 Policy Gate"
[3]: CALC-013-M03-M04-PARTIAL-POLICY-STUDY-2026-08-20.md "CALC-013 M-03/M-04 Partial-Approach Policy Study"
[4]: ../../server/valuation/evidence.contracts.ts "DLD Evidence Contracts"
[5]: ../../server/engines/orchestrator/core-valuation-adapter.ts "Core Valuation Adapter"
[6]: ../../drizzle/schema.ts "PostgreSQL Evidence and Audit Schema"
[7]: ../../engines/valuation/types/valuation-data.contracts.ts "Valuation Data Contracts"
