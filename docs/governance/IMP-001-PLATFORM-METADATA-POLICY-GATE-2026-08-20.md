# MIAYAAR — IMP-001 Platform Metadata Policy Gate

- **Date:** 2026-08-20
- **Status:** Owner-approved inventory and MET-01 to MET-03 decisions recorded
- **Scope:** Read-only comparison of local audit/time/origin fields with canonical `Metadata`.

> This Policy Gate changes no Core Type, interface, contract, methodology v1.2, weight, coefficient, Valuation Engine, API, UI, data, or Market Intelligence behavior. It creates no timestamp rule, fallback, provenance value, or migration.

## Governing rule

ADR-002 makes canonical `Metadata` mandatory for every **Entity Contract** and excludes it from Value Objects.[1] Canonical `Metadata` owns technical creation and update time, actor audit information, versioning, provenance, and technical status.[2] Accordingly, a similarly named local field is not automatically a violation: its role must first be classified as either technical lifecycle/audit information, a business-domain fact, bounded operational provenance, or processing-envelope information.

**Outcome:** IMP-001 remains **PARTIAL**. The owner decisions resolve the classification questions, but the approved work excludes the technical contract changes that would be needed to address the duplicated audit representation. Core Types Freeze remains **PENDING**.

## Inventory and classification

| Contract or field                                                                                    | Current evidence                                                                                                                   | Classification                                                                                           | Gate result                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Property.metadata`                                                                                  | The canonical Property entity imports and requires `Metadata`; it has no local lifecycle/audit clock.                              | Entity technical metadata                                                                                | **Conforming evidence**.[3]                                                                                          |
| `Valuation.metadata`                                                                                 | The canonical Valuation entity requires `Metadata`.                                                                                | Entity technical metadata                                                                                | **Conforming coverage**; the local `createdAt` role is resolved separately.[4]                                       |
| `Valuation.createdAt`                                                                                | A top-level creation timestamp coexists with `metadata.timestamps.createdAt`.                                                      | Technical audit time for technical record/object creation, not a business-domain fact.                   | **MET-01 recorded**: it must not substitute for transaction, evidence, or market time; no contract change.[4]        |
| `ValuationMetadata.valuationDate`                                                                    | The comment identifies the valuation's date; it is nested business metadata, distinct in wording from entity creation.             | Business-domain event date                                                                               | **Retain as separate fact**; it is not automatically a technical audit duplicate.[4]                                 |
| `Confidence.metadata`                                                                                | The canonical Confidence entity requires `Metadata`.                                                                               | Entity technical metadata                                                                                | **Conforming coverage**; the local `createdAt` role is resolved separately.[5]                                       |
| `Confidence.createdAt`                                                                               | A top-level creation timestamp coexists with `metadata.timestamps.createdAt`.                                                      | Technical audit time for technical record/object creation, not a business-domain fact.                   | **MET-01 recorded**: it must not substitute for transaction, evidence, or market time; no contract change.[5]        |
| `ConfidenceAssessment.assessedAt`                                                                    | The timestamp describes when an assessment occurred, rather than the technical creation/update lifecycle of the containing entity. | Business-domain assessment fact                                                                          | **Retain as separate fact**; no audit-role substitution is authorized.[5]                                            |
| `MarketSnapshot`                                                                                     | The named canonical snapshot has an ID, source, and temporal/provenance-like facts but does not carry canonical `Metadata`.        | Bounded read model / Value Object without independent domain lifecycle, identity, or decision authority. | **MET-02 recorded**: it is outside ADR-002's Entity Contract requirement at this stage; no `Metadata` attachment.[6] |
| `MarketTimestamp.asOf`, `AvailableMarketIndicator.observedAt`, `ComparableReference.transactionDate` | These fields establish snapshot, observation, and transaction context.                                                             | Domain observation/evidence time                                                                         | **MET-03 recorded**: remain separate from technical audit time; retain semantics unchanged.[6]                       |
| `Result<T>.metadata` / `ResultMetadata.timestamp`                                                    | ADR-007 output envelope metadata holds request, engine, version, and processing time for every engine result.                      | Processing-envelope metadata, not an Entity Contract                                                     | **Outside ADR-002 entity attachment rule**; no unification change requested.[7]                                      |
| Evidence Integrity `transactionDate`, `ingestedAt`, checksum, source ID, and request `asOf`          | Bounded, read-only evidence observations preserve record provenance and query time.                                                | Operational evidence provenance and filter context                                                       | **Outside entity lifecycle metadata**; no substitution into `Metadata` is authorized.[8]                             |

## Owner decisions recorded

| Decision ID | Recorded policy                                                                                                                                                                                                                                                          | Boundary retained                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| MET-01      | `Valuation.createdAt` and `Confidence.createdAt` are technical audit fields recording technical record/object creation. They are not transaction, evidence, market, or other domain-event time.                                                                          | They may not replace a domain or evidence date; this decision makes no Core Types change.                                                           |
| MET-02      | `MarketSnapshot` is a bounded read model / Value Object at this stage, used for traceable analysis and reading only. It has no independent domain lifecycle, domain identity, or decision authority.                                                                     | It is not subject to ADR-002 as an Entity Contract unless a future governance decision changes its classification.                                  |
| MET-03      | Domain and evidence times remain explicitly separate from technical audit time. Domain/evidence time includes source-appropriate transaction, evidence, or market-observation validity time; `createdAt`, `updatedAt`, and equivalents are technical system-record time. | Neither the Valuation Engine nor Market Intelligence may substitute an audit timestamp for a domain/evidence timestamp or treat them as equivalent. |

## Post-gate status

| Item              | Status                     | Basis                                                                                                                                           |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| IMP-001           | **PARTIAL**                | MET-01 to MET-03 are resolved, but the documented technical audit duplication remains in contracts and this scope authorizes no implementation. |
| IMP-002           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                         |
| IMP-003           | **PARTIAL**                | Unchanged by this gate; documented VOC policy does not constitute a Core Types implementation.                                                  |
| IMP-004           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                         |
| Core Types Freeze | **PENDING / not closable** | Critical items IMP-001 and IMP-003 remain Partial; the backlog requires completion of every critical task and Architecture Board approval.[9]   |

## Stop condition

No implementation follows from this report. No further policy decision is required to preserve the present documented state. Any technical change to remove, derive, or otherwise normalize duplicated audit representation must be proposed in a separate, explicitly approved three-line scope and reviewed against ADR-002. The gate does not authorize an automatic next phase or any Market Intelligence change.

## References

[1]: ../ADR/ADR-002-Platform-Metadata.md "ADR-002 — Decision"
[2]: ../../core/types/metadata.ts "Canonical Metadata contract"
[3]: ../../core/types/property.ts "Canonical Property entity"
[4]: ../../core/types/valuation.ts "Canonical Valuation entity and business metadata"
[5]: ../../core/types/confidence.ts "Canonical Confidence entity and assessment"
[6]: ../../core/types/market.ts "Market snapshot and observed evidence contracts"
[7]: ../../core/results/result.contract.ts "Standardized Result Object and ResultMetadata"
[8]: ../../contracts/evidence-integrity.contracts.ts "Read-only evidence provenance contracts"
[9]: ../implementation/core-types-backlog.md "Critical completion and Architecture Board acceptance"
