# Non-Sales Evidence Sources Research Governance Policy v1.0

**Status:** Approved for research governance only  
**Effective date:** 2026-08-20  
**Owner decision:** `SOURCE-01`, `IDENTITY-01`, `TIME-01`, `TRANSFORM-01`, `REVIEW-01`, and `USAGE-01` approved for the isolated research stage of `M-03` and `M-04`.  
**Policy version:** `NSE-RG-v1.0`

## Purpose

This policy governs the limited, isolated research of non-sales evidence that could eventually inform a separate missing-approach policy study. It applies only to the owner-approved research candidates `M-03` (sales evidence with another positive approach absent) and `M-04` (sales evidence plus some, but not all, positive approaches).

This policy does **not** approve a production evidence source, a partial valuation policy, a valuation-method subset, a method reweighting, a coefficient, a benchmark, a threshold, a valuation result, or a runtime implementation. Local eligible DLD sales evidence remains mandatory; its absence remains rejected under `M-01`.

## Scope and governing effect

The approvals below permit a controlled research process only. They do not supersede the frozen canonical methodology v1.2, the result contract, the CALC-013 policy gate, the `M-03`/`M-04` policy study, or the evidence-acquisition and validation protocol. Where a conflict exists, the canonical contracts and methodology prevail.

| Area             | Approved research-governance effect                                         | Explicitly not approved                                                            |
| ---------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Source classes   | Candidate classes may be scoped and studied with documented rights.         | A source registry entry, a provider, or a record is not production-approved.       |
| Property linkage | Link facts and conflicts may be recorded descriptively.                     | Legal identity inference from district, type, or area alone.                       |
| Time             | Source time facts and request `asOf` context may be recorded separately.    | A recency window, freshness rule, or temporal adjustment.                          |
| Transformations  | Raw values and any descriptive representation change may be recorded.       | FX, annualisation, normalisation, escalation, or another valuation transformation. |
| Review           | A separate descriptive review path may record what was and was not checked. | A price judgment, confidence score, valuation judgment, or release approval.       |
| Usage            | Rights for access, processing, retention, and sharing may be recorded.      | The assumption that access confers a right to use, retain, share, or deploy.       |

## SOURCE-01 — Candidate source classes

The isolated research stage may study the following **classes**, provided the applicable usage rights are documented: permitted lease or tenancy records; property-linked operating or financial records; construction or cost records; operating or expense records; and documents relevant to DCF inputs. A regulatory or official register may be studied only after its owner, access right, and permitted use are identified.

The approval is limited to collecting the raw artifact, preserving source and rights facts, recording linkage facts and temporal context, and conducting descriptive validation in isolation. It does not permit a class to be treated as a production source, to replace eligible local DLD sales evidence, or to be supplied to `valuation.run`.

## IDENTITY-01 — Property linkage

For every non-sales artifact, research may record the linkage facts as stated by the source and must distinguish those facts from any attempted inference. District, property type, or area similarity alone does not establish the identity of the subject property.

Until a separate external-identity contract is approved, the permitted descriptive linkage outputs are `link facts recorded`, `link incomplete`, `link conflict recorded`, and `not assessed`. None of those outputs permits calculation, partial valuation use, or value delivery.

## TIME-01 — Time and freshness

Where available, research must keep the artifact capture time, stated observation or effective time, the period described by the artifact, and the request `asOf` context distinct. If a time fact is absent, it must remain absent; a surrogate time must not be inferred.

No freshness window, temporal-consistency threshold, or `asOf` proximity rule is approved for non-sales evidence. The relevance of time facts to method availability or a valuation result remains `UNRESOLVED_POLICY` and requires separate evidence and owner approval.

## TRANSFORM-01 — Raw preservation and transformations

Research must preserve a source value with its stated unit, currency, and period. A descriptive transformation record may be maintained only when it identifies the raw value, the representation change, the reason, the actor, and the time of the change.

No FX source, annualisation method, normalisation rule, time adjustment, coefficient, or economic-input assumption is approved. A transformed value cannot become an engine input or a methodological result without a separate transformation policy, validation, independent review, and a methodology ADR where required.

## REVIEW-01 — Independent descriptive review

An evidence package may be checked through a path separate from its collection, extraction, or transformation. The reviewer must record the checked artifacts, any item that could not be checked, observed conflicts, artifact references, and review time.

Permitted review descriptions are `observed`, `incomplete`, `conflict recorded`, and `not assessed`. They do not express a judgment that a price is correct, fair, anomalous, or usable in valuation; they do not create a confidence score. If the reviewer is not separate from the collector or extractor, the review must be described as non-independent.

## USAGE-01 — Rights, privacy, retention, and sharing

Every candidate artifact must separately record known access, processing, retention, and sharing rights, or explicitly record that one or more rights are unresolved. Research use is restricted to the stated research purpose. An artifact with unresolved usage rights may not be used in valuation or a production test.

Availability on the internet or delivery by a third party is not, by itself, evidence of permission to process, retain, share, or deploy an artifact. Retention duration, deletion handling, access classes, and cross-border processing remain subject to a source- and jurisdiction-specific decision before any actual collection is authorised.

## Isolation and non-interference

All activity under this policy must remain isolated from production data and production evidence logs. It must not invoke or alter `valuation.run`, the Valuation Engine, methodology v1.2, methodology weights, coefficients, comparable selection, confidence, actual sale prices, valuation eligibility, valuation outputs, API responses, user interface, database schema, or DLD transaction rows.

The policy does not authorise a new API, data import, database table, connector, scheduled job, dashboard, or diagnostics surface. Such work requires separate approved scope, contracts, security and rights review, and implementation approval.

## Required research record — future gate

Before any actual collection is proposed, a separate, reviewable source-record design must show how it would preserve: source owner and class; access, processing, retention, and sharing rights; raw artifact reference; capture and stated times; raw unit/currency/period; linkage facts and conflicts; requested `asOf`; extraction and transformation lineage; reviewer record; and usage restrictions.

This is a **future design gate**, not a schema change and not an instruction to create a database record today.

## Deferred policy decisions

The following remain outside this policy and require separately evidenced owner decisions:

1. A named, production-approved source registry and the acceptance criteria for an individual provider or record.
2. An external subject-property identity contract, permitted identifiers, and conflict-resolution process.
3. Any non-sales freshness rule, time window, temporal adjustment, or data-sufficiency rule.
4. Any transformation rule for currency, unit, period, escalation, normalisation, or another economic adjustment.
5. Reviewer identity, qualifications, independence standard, and dispute-resolution governance.
6. Source-specific retention duration, deletion process, access roles, sharing controls, and cross-border processing terms.
7. Any partial valuation eligibility policy, permitted method subset, active-method weighting, fallback, output wording, validation protocol, regression test, methodology release, or implementation.

## References

1. `docs/ADR/ADR-011-canonical-frozen-valuation-methodology-v1-2.md`
2. `docs/ADR/ADR-012-proposed-missing-approach-policy-direction.md`
3. `docs/governance/CALC-013-MISSING-APPROACH-ELIGIBILITY-MATRIX-PROPOSAL-2026-08-20.md`
4. `docs/governance/CALC-013-M03-M04-PARTIAL-POLICY-STUDY-2026-08-20.md`
5. `docs/governance/CALC-013-M03-M04-EVIDENCE-ACQUISITION-VALIDATION-PROTOCOL-2026-08-20.md`
6. `core/results/result.contract.ts`
7. `engines/valuation/methodology-v1_2.ts`
