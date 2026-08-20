# MIAYAAR — Core Types Status Reconciliation

**Date:** 2026-08-20  
**Review type:** Governance-only, read-only reconciliation  
**Reviewed baseline:** Protected `main` at `c1d1289`  
**Decision scope:** `IMP-001` through `IMP-004` only

> This record classifies the implementation state against the accepted Core Types ADRs and the Core Types backlog. It does **not** alter any contract, valuation behavior, methodology v1.2, weight, coefficient, API, database schema, UI, or source-governance decision.

> **Supersession notice — 2026-08-20:** This is a historical reconciliation of the `c1d1289` baseline. Its findings for IMP-001, IMP-003, and Core Types Freeze were superseded by the owner-approved implementations merged through PR #44 and the architecture acceptance record `CORE-TYPES-FREEZE-ARCHITECTURE-ACCEPTANCE-2026-08-20.md`. The current state is IMP-001 through IMP-004 implemented and **Core Types Freeze closed — architecture accepted**. The historical evidence and rationale below remain unchanged.

## Executive finding

The Core Types module contains material implementation of all four critical ADR directions, but only two backlog items satisfy their recorded acceptance criteria in full. **IMP-002** and **IMP-004** are **IMPLEMENTED**. **IMP-001** and **IMP-003** are **PARTIAL** because local audit timestamps remain outside the shared metadata model and because several lifecycle or classification vocabularies remain unconstrained strings. Accordingly, the Core Types Freeze cannot be represented as complete under the backlog's own completion criteria.[1]

| Item                          | Governing ADR | Reconciled status | Rationale                                                                                                                       |
| ----------------------------- | ------------- | ----------------: | ------------------------------------------------------------------------------------------------------------------------------- |
| IMP-001 — Platform Metadata   | ADR-002       |       **PARTIAL** | The shared model is used by the three named entity contracts, but local creation or assessment timestamps still remain.         |
| IMP-002 — Building Condition  | ADR-006       |   **IMPLEMENTED** | Dedicated property and building-condition enums exist, and `Property` exposes both conditions separately.                       |
| IMP-003 — Business Vocabulary | ADR-005       |       **PARTIAL** | The common enum catalog is substantial, but closed lifecycle or classification vocabulary is still represented by open strings. |
| IMP-004 — Immutable Contracts | ADR-004       |   **IMPLEMENTED** | The reviewed `core/types` interface properties are consistently declared `readonly`, including nested collections and records.  |

## Classification method

This reconciliation applies the same conservative standard to each item. **IMPLEMENTED** means every acceptance criterion recorded for the item is directly evidenced in the reviewed contracts. **PARTIAL** means the intended architectural direction is materially present but at least one explicit acceptance criterion is not met. **NOT_IMPLEMENTED** would require the absence of material evidence for the required architectural direction. The status is descriptive only; it does not retroactively amend the backlog, ADRs, or phase map.

## Item-level evidence

### IMP-001 — Platform Metadata: PARTIAL

ADR-002 makes `Metadata` mandatory for each Entity Contract and designates `core/types/metadata.ts` as the canonical technical metadata model.[2] The implementation meets the three explicit entity-reference checks in the backlog: `Property`, `Valuation`, and `Confidence` each contain a required `metadata: Metadata` field.[1] [6] [7] [8]

The item nevertheless does not meet the backlog requirement that **no local audit fields remain**. `Valuation` retains `createdAt: Timestamp`; `Confidence` retains `createdAt: Timestamp`; and the embedded `ConfidenceAssessment` retains `assessedAt: Timestamp`, while the canonical metadata model already contains `timestamps.createdAt`, `timestamps.updatedAt`, and audit information.[1] [7] [8] [9] These local timestamp fields may carry domain meaning in a future approved design, but the current contracts do not distinguish that meaning from the audit fields they duplicate. The acceptance criterion is therefore not demonstrably satisfied.

| Acceptance criterion                           | Evidence                                                                                                                   |                         Result |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -----------------------------: |
| All named entities reference shared `Metadata` | Required `metadata: Metadata` appears in `Property`, `Valuation`, and `Confidence`.                                        |                            Met |
| No local audit fields remain                   | Local `createdAt` and `assessedAt` timestamp fields remain alongside canonical metadata timestamps.                        |                        Not met |
| Metadata mandatory for every Entity Contract   | Met for the three entities explicitly named in IMP-001; a full module-wide entity inventory is not defined by the backlog. | Met within recorded item scope |

### IMP-002 — Building Condition: IMPLEMENTED

ADR-006 requires property condition and building condition to remain distinct concepts with dedicated enums, and requires the `Property` entity to carry both.[3] The enum catalog defines separate `PropertyCondition` and `BuildingCondition` types. `StructuralCharacteristics` then exposes required `propertyCondition` and `buildingCondition` fields, and `Property` requires `structural` as part of its canonical entity contract.[3] [6] [11]

| Acceptance criterion                   | Evidence                                                                                                                    | Result |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -----: |
| `BuildingCondition` enum exists        | Declared in `core/types/enums.ts`.                                                                                          |    Met |
| Property has separate condition fields | `StructuralCharacteristics` requires both condition fields.                                                                 |    Met |
| Both concepts documented               | The enum and property-contract comments distinguish the property itself from its containing building and reference ADR-006. |    Met |

### IMP-003 — Business Vocabulary: PARTIAL

ADR-005 requires each **closed** business vocabulary to be represented by an enum, while genuinely open human input remains a string.[4] The enum catalog already covers a meaningful set of fixed values, including property type, transaction type, property condition, building condition, use, data source, confidence level, furnishing, finish quality, and street position.[11]

However, the module cannot meet the backlog's absolute acceptance criterion while fields representing lifecycle or classification states remain unconstrained. `Status` is defined as `string` despite being documented as the state or phase of an entity or process; `PropertyClassification.status` uses that alias; and technical `StatusInfo.status` and `StatusInfo.category` are direct strings.[6] [9] [10] `SourceReference.type`, `ValuationApproachResult.approach`, and `ValuationMetadata.type` are further unconstrained labels whose open-versus-closed policy is not classified in the current ADR inventory.[7] [9]

This finding does **not** prescribe new enum members. A governed vocabulary inventory must first distinguish closed platform terms from valid human-entered or externally sourced values; inventing such enumerations would violate ADR-005 and the project's no-inference governance rule.

| Acceptance criterion              | Evidence                                                                                |                          Result |
| --------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------: |
| Closed vocabulary terms are enums | Numerous fixed property-domain terms are central enums.                                 |                   Partially met |
| Human-input fields remain strings | Narrative and free-form fields remain strings.                                          | Met where clearly human-entered |
| No mixed types                    | At least lifecycle or classification status remains an open string rather than an enum. |                         Not met |

### IMP-004 — Immutable Contracts: IMPLEMENTED

ADR-004 requires canonical contracts in `core/types` to be immutable by design and identifies `readonly` or `Readonly<T>` as the type-system enforcement mechanism.[5] The static review found no ordinary interface property declarations in `core/types/*.ts` without the `readonly` modifier. The reviewed entity contracts use `readonly` for their scalar members, `readonly T[]` for collection members, and `Readonly<Record<string, unknown>>` where extensible record data is retained.[6] [7] [8] [9]

The finding is limited to TypeScript contract mutability. It does not claim runtime deep-freezing, database immutability, or immutable behavior outside `core/types`, none of which are acceptance criteria for IMP-004.

| Acceptance criterion                  | Evidence                                                                         | Result |
| ------------------------------------- | -------------------------------------------------------------------------------- | -----: |
| All canonical contracts are immutable | Interface-property audit found no ordinary mutable declarations in `core/types`. |    Met |
| Type system enforces immutability     | `readonly` is applied consistently, including nested arrays and records.         |    Met |
| No mutable contract patterns remain   | No mutable interface-property pattern was identified in the reviewed module.     |    Met |

## Reconciliation of the official-status conflict

The official phase-status map marks **Phase 1 — Architecture & Contracts** as **Implemented**, based on the presence of `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, and ADR-011.[12] By contrast, the Core Types backlog labels all four critical items `Pending` and states that the Core Types Freeze Review can begin only after every critical task is completed.[1]

These documents measure different things, but the current wording leaves an operationally important ambiguity. The phase map reports broad architectural delivery, while the backlog reports the completion gate for a narrower Core Types Freeze. This review shows that the freeze gate is not complete: two critical items are partial, even though the architecture exists and is used.

| Source                    | Current claim                                                                                  | Reconciled reading                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Official phase-status map | Phase 1 is implemented.                                                                        | The broader architecture-and-contracts foundation exists.                              |
| Core Types backlog        | All four critical items remain pending; the freeze review requires all critical work complete. | The Core Types Freeze is incomplete because IMP-001 and IMP-003 are partial.           |
| This reconciliation       | Two critical items are implemented and two are partial.                                        | The status documents should distinguish the broad phase from the narrower freeze gate. |

## Single recommendation

**Recommendation: update the official phase-status map, in a separate documentation-only decision, from “Architecture & Contracts — Implemented” to “Partial — architecture foundation implemented; Core Types Freeze pending.”** The amended row should link to this record and preserve the rule that no contract code changes until the owner approves a separately scoped critical-item implementation.

This recommendation is intentionally limited to status language. It neither changes the `Pending` state of any backlog item nor approves an implementation scope. A future owner decision may authorize **one** critical-item scope at a time, beginning with either metadata audit-field consolidation (IMP-001) or governed vocabulary inventory and enum conversion (IMP-003).

## Explicit non-changes

No source file under `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, `server/`, `client/`, `drizzle/`, or `netlify/` was modified for this review. In particular, `valuation.run`, the frozen methodology v1.2, valuation weights, coefficients, comparable-selection rules, confidence behavior, Evidence Integrity, and SRC-001 governance remain unchanged.

## References

[1]: ../implementation/core-types-backlog.md "Core Types Implementation Backlog"
[2]: ../ADR/ADR-002-Platform-Metadata.md "ADR-002 — Platform Metadata"
[3]: ../ADR/ADR-006-building-condition-separation.md "ADR-006 — Building Condition Separation"
[4]: ../ADR/ADR-005-Business-Vocabulary.md "ADR-005 — Business Vocabulary"
[5]: ../ADR/ADR-004-Immutable-Contracts.md "ADR-004 — Immutable Contracts"
[6]: ../../core/types/property.ts "Canonical Property contract"
[7]: ../../core/types/valuation.ts "Canonical Valuation contract"
[8]: ../../core/types/confidence.ts "Canonical Confidence contract"
[9]: ../../core/types/metadata.ts "Canonical Metadata contract"
[10]: ../../core/types/primitives.ts "Core Types primitive aliases"
[11]: ../../core/types/enums.ts "Core Types enum catalog"
[12]: ../verification/2026-08-19-official-master-order-phase-status-map.md "MIAYAAR — Governed Phase-Status Map"
