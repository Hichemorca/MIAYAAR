# MIAYAAR — IMP-001 Platform Metadata Policy Gate

- **Date:** 2026-08-20
- **Status:** Implemented — owner-approved MET-01 to MET-03 contract consolidation completed
- **Scope:** Policy-gate inventory plus the separately approved technical consolidation of local entity audit fields into canonical `Metadata`.

> The original Policy Gate was read-only. The owner then approved a separate IMP-001 implementation scope. This follow-through removes only duplicated local entity audit fields from `Valuation` and `Confidence`, preserves all domain/evidence timestamps, leaves `MarketSnapshot` unchanged, and introduces no new timestamp rule, fallback, provenance value, migration, methodology change, valuation-output change, API change, UI change, or Market Intelligence behavior.

## Governing rule

ADR-002 makes canonical `Metadata` mandatory for every **Entity Contract** and excludes it from Value Objects.[1] Canonical `Metadata` owns technical creation and update time, actor audit information, versioning, provenance, and technical status.[2] Accordingly, a similarly named local field is not automatically a violation: its role must first be classified as either technical lifecycle/audit information, a business-domain fact, bounded operational provenance, or processing-envelope information.

**Outcome:** IMP-001 is **IMPLEMENTED**. The owner decisions resolved the classification questions, and the separately approved contract consolidation removed duplicated local entity audit representation. Core Types Freeze remains **PENDING** because IMP-003 remains Partial.

## Inventory and classification

| Contract or field                                                                                    | Current evidence                                                                                                                   | Classification                                                                                           | Gate result                                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `Property.metadata`                                                                                  | The canonical Property entity imports and requires `Metadata`; it has no local lifecycle/audit clock.                              | Entity technical metadata                                                                                | **Conforming evidence**.[3]                                                                                          |
| `Valuation.metadata`                                                                                 | The canonical Valuation entity requires `Metadata`.                                                                                | Entity technical metadata                                                                                | **Conforming coverage**; the local `createdAt` role is resolved separately.[4]                                       |
| `Valuation.createdAt`                                                                                | A top-level creation timestamp formerly coexisted with `metadata.timestamps.createdAt`.                                            | Technical audit time for technical record/object creation, not a business-domain fact.                   | **Implemented**: removed; `metadata.timestamps.createdAt` is the sole entity audit-creation time.[4]                  |
| `ValuationMetadata.valuationDate`                                                                    | The comment identifies the valuation's date; it is nested business metadata, distinct in wording from entity creation.             | Business-domain event date                                                                               | **Retain as separate fact**; it is not automatically a technical audit duplicate.[4]                                 |
| `Confidence.metadata`                                                                                | The canonical Confidence entity requires `Metadata`.                                                                               | Entity technical metadata                                                                                | **Conforming coverage**; the local `createdAt` role is resolved separately.[5]                                       |
| `Confidence.createdAt`                                                                               | A top-level creation timestamp formerly coexisted with `metadata.timestamps.createdAt`.                                            | Technical audit time for technical record/object creation, not a business-domain fact.                   | **Implemented**: removed; `metadata.timestamps.createdAt` is the sole entity audit-creation time.[5]                  |
| `ConfidenceAssessment.assessedAt`                                                                    | The timestamp describes when an assessment occurred, rather than the technical creation/update lifecycle of the containing entity. | Business-domain assessment fact                                                                          | **Retain as separate fact**; no audit-role substitution is authorized.[5]                                            |
| `MarketSnapshot`                                                                                     | The named canonical snapshot has an ID, source, and temporal/provenance-like facts but does not carry canonical `Metadata`.        | Bounded read model / Value Object without independent domain lifecycle, identity, or decision authority. | **MET-02 recorded**: it is outside ADR-002's Entity Contract requirement at this stage; no `Metadata` attachment.[6] |
| `MarketTimestamp.asOf`, `AvailableMarketIndicator.observedAt`, `ComparableReference.transactionDate` | These fields establish snapshot, observation, and transaction context.                                                             | Domain observation/evidence time                                                                         | **MET-03 recorded**: remain separate from technical audit time; retain semantics unchanged.[6]                       |
| `Result<T>.metadata` / `ResultMetadata.timestamp`                                                    | ADR-007 output envelope metadata holds request, engine, version, and processing time for every engine result.                      | Processing-envelope metadata, not an Entity Contract                                                     | **Outside ADR-002 entity attachment rule**; no unification change requested.[7]                                      |
| Evidence Integrity `transactionDate`, `ingestedAt`, checksum, source ID, and request `asOf`          | Bounded, read-only evidence observations preserve record provenance and query time.                                                | Operational evidence provenance and filter context                                                       | **Outside entity lifecycle metadata**; no substitution into `Metadata` is authorized.[8]                             |

## Owner decisions recorded

| Decision ID | Recorded policy                                                                                                                                                                                                                                                          | Boundary retained                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| MET-01      | `Valuation.createdAt` and `Confidence.createdAt` are technical audit fields recording technical record/object creation. They are not transaction, evidence, market, or other domain-event time.                                                                          | Implemented by removing duplicated local fields; canonical `metadata.timestamps.createdAt` may not replace a domain or evidence date.              |
| MET-02      | `MarketSnapshot` is a bounded read model / Value Object at this stage, used for traceable analysis and reading only. It has no independent domain lifecycle, domain identity, or decision authority.                                                                     | It is not subject to ADR-002 as an Entity Contract unless a future governance decision changes its classification.                                  |
| MET-03      | Domain and evidence times remain explicitly separate from technical audit time. Domain/evidence time includes source-appropriate transaction, evidence, or market-observation validity time; `createdAt`, `updatedAt`, and equivalents are technical system-record time. | Neither the Valuation Engine nor Market Intelligence may substitute an audit timestamp for a domain/evidence timestamp or treat them as equivalent. |

## Post-gate status

| Item              | Status                     | Basis                                                                                                                                           |
| ----------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| IMP-001           | **IMPLEMENTED**            | `Property`, `Valuation`, and `Confidence` require canonical `Metadata`; local entity audit `createdAt` fields have been removed and regression-tested. |
| IMP-002           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                         |
| IMP-003           | **PARTIAL**                | Unchanged by this gate; documented VOC policy does not constitute a Core Types implementation.                                                  |
| IMP-004           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                         |
| Core Types Freeze | **PENDING / not closable** | IMP-003 remains Partial; the backlog requires completion of every critical task and Architecture Board approval.[9]                              |

## Implementation closure and stop condition

The separately approved IMP-001 scope has removed the duplicated local entity audit fields and added regression coverage for their absence and for the separation of domain/assessment time from canonical audit time.[10] No further implementation follows automatically. In particular, this closure does not authorize IMP-003, a Core Types Freeze declaration, any Market Intelligence change, or any change to the frozen valuation methodology.

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
[10]: IMP-001-IMPLEMENTATION-ACCEPTANCE-2026-08-20.md "IMP-001 implementation acceptance evidence"
