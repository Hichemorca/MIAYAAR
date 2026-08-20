# MIAYAAR — IMP-001 Platform Metadata Policy Gate

**Date:** 2026-08-20  
**Status:** Owner-approved inventory complete; owner decisions pending  
**Scope:** Read-only comparison of local audit/time/origin fields with canonical `Metadata`.

> This Policy Gate changes no Core Type, interface, contract, methodology v1.2, weight, coefficient, Valuation Engine, API, UI, data, or Market Intelligence behavior. It creates no timestamp rule, fallback, provenance value, or migration.

## Governing rule

ADR-002 makes canonical `Metadata` mandatory for every **Entity Contract** and excludes it from Value Objects.[1] Canonical `Metadata` owns technical creation and update time, actor audit information, versioning, provenance, and technical status.[2] Accordingly, a similarly named local field is not automatically a violation: its role must first be classified as either technical lifecycle/audit information, a business-domain fact, bounded operational provenance, or processing-envelope information.

**Outcome:** IMP-001 remains **PARTIAL**. The inventory confirms direct `Metadata` coverage for Property, Valuation, and Confidence, but identifies unresolved classification and duplication questions. Core Types Freeze remains **PENDING**.

## Inventory and classification

| Contract or field                                                                                    | Current evidence                                                                                                                   | Classification                                                                                  | Gate result                                                                                               |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Property.metadata`                                                                                  | The canonical Property entity imports and requires `Metadata`; it has no local lifecycle/audit clock.                              | Entity technical metadata                                                                       | **Conforming evidence**.[3]                                                                               |
| `Valuation.metadata`                                                                                 | The canonical Valuation entity requires `Metadata`.                                                                                | Entity technical metadata                                                                       | **Conforming coverage**, subject to the separate `createdAt` ambiguity below.[4]                          |
| `Valuation.createdAt`                                                                                | A top-level creation timestamp coexists with `metadata.timestamps.createdAt`.                                                      | Potential duplicate technical audit field, unless owner defines it as a distinct business fact. | **MET-01 required**; no field may be removed, renamed, or reinterpreted in this scope.[4]                 |
| `ValuationMetadata.valuationDate`                                                                    | The comment identifies the valuation's date; it is nested business metadata, distinct in wording from entity creation.             | Business-domain event date                                                                      | **Retain as separate fact**; it is not automatically a technical audit duplicate.[4]                      |
| `Confidence.metadata`                                                                                | The canonical Confidence entity requires `Metadata`.                                                                               | Entity technical metadata                                                                       | **Conforming coverage**, subject to the separate `createdAt` ambiguity below.[5]                          |
| `Confidence.createdAt`                                                                               | A top-level creation timestamp coexists with `metadata.timestamps.createdAt`.                                                      | Potential duplicate technical audit field, unless owner defines it as a distinct business fact. | **MET-01 required**; no field may be removed, renamed, or reinterpreted in this scope.[5]                 |
| `ConfidenceAssessment.assessedAt`                                                                    | The timestamp describes when an assessment occurred, rather than the technical creation/update lifecycle of the containing entity. | Business-domain assessment fact                                                                 | **Retain as separate fact**; no audit-role substitution is authorized.[5]                                 |
| `MarketSnapshot`                                                                                     | The named canonical snapshot has an ID, source, and temporal/provenance-like facts but does not carry canonical `Metadata`.        | Entity-versus-read-model classification unresolved                                              | **MET-02 required** before determining ADR-002 compliance; no `Metadata` attachment is authorized now.[6] |
| `MarketTimestamp.asOf`, `AvailableMarketIndicator.observedAt`, `ComparableReference.transactionDate` | These fields establish snapshot, observation, and transaction context.                                                             | Domain observation/evidence time                                                                | **Not a local entity-audit replacement**; retain semantics unchanged.[6]                                  |
| `Result<T>.metadata` / `ResultMetadata.timestamp`                                                    | ADR-007 output envelope metadata holds request, engine, version, and processing time for every engine result.                      | Processing-envelope metadata, not an Entity Contract                                            | **Outside ADR-002 entity attachment rule**; no unification change requested.[7]                           |
| Evidence Integrity `transactionDate`, `ingestedAt`, checksum, source ID, and request `asOf`          | Bounded, read-only evidence observations preserve record provenance and query time.                                                | Operational evidence provenance and filter context                                              | **Outside entity lifecycle metadata**; no substitution into `Metadata` is authorized.[8]                  |

## Owner decisions required

| Decision ID | Decision required                                                                                                                                                                                       | Affected evidence                                                                    | Prohibited inference                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| MET-01      | Classify each top-level `createdAt` on `Valuation` and `Confidence` as either duplicated technical lifecycle information or a distinct business-domain fact, and state the governing semantic for each. | `Valuation.createdAt`; `Confidence.createdAt`                                        | No removal, rename, mapping, timestamp default, or presumption that it equals `metadata.timestamps.createdAt`. |
| MET-02      | Classify `MarketSnapshot` explicitly as an Entity Contract subject to ADR-002 or as a bounded read model/Value Object with no independent technical lifecycle.                                          | `MarketSnapshot`                                                                     | No automatic addition of `Metadata`, no persistence assumption, and no change to market data behavior.         |
| MET-03      | Confirm the project-wide boundary that domain-event and evidence-observation times remain separate from technical audit times, using the classifications in this inventory.                             | `valuationDate`, `assessedAt`, `asOf`, `observedAt`, `transactionDate`, `ingestedAt` | No new time fields, fallback rules, retention rules, provenance values, or data transformation.                |

## Post-gate status

| Item              | Status                     | Basis                                                                                                                                         |
| ----------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| IMP-001           | **PARTIAL**                | Direct `Metadata` coverage exists for Property, Valuation, and Confidence, but MET-01 and MET-02 remain unresolved.                           |
| IMP-002           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                       |
| IMP-003           | **PARTIAL**                | Unchanged by this gate; documented VOC policy does not constitute a Core Types implementation.                                                |
| IMP-004           | **IMPLEMENTED**            | Unchanged by this gate.                                                                                                                       |
| Core Types Freeze | **PENDING / not closable** | Critical items IMP-001 and IMP-003 remain Partial; the backlog requires completion of every critical task and Architecture Board approval.[9] |

## Stop condition

No implementation follows from this report. After the owner resolves MET-01 to MET-03, any technical change must be proposed in a separate, explicitly approved three-line scope and reviewed against ADR-002. The gate does not authorize an automatic next phase or any Market Intelligence change.

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
