# MIAYAAR — IMP-003 Business Vocabulary Policy Gate

**Date:** 2026-08-20  
**Status:** Owner-approved inventory and VOC-01 to VOC-06 decisions recorded
**Scope:** Documentation-only update to the IMP-003 Policy Gate in PR #39.

> This document creates no enum, literal value, fallback, threshold, coefficient, or code change. It does not amend Core Types, interfaces, contracts, methodology v1.2, weights, the Valuation Engine, API, UI, data, or Market Intelligence.

## Governing rule and result

IMP-003 requires **Closed Business Vocabulary** to use the approved representation, while open human input remains string.[1] ADR-005 supplies that distinction.[2] The owner decisions below determine the governance classification of each inventoried category; they do not create a value set or modify a contract.

**Result:** the policy-classification questions are resolved. **IMP-003 remains PARTIAL** because no Core Types implementation or acceptance review was authorized. **Core Types Freeze remains PENDING**.

## Inventory and recorded policy

| Contract field or representation                                                                                                                                   | Recorded policy                                                                                                                             | Result in this PR                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Existing `PropertyType`, `UsageType`, `PropertyCondition`, `BuildingCondition`, `ViewType`, `FloorLevel`, `FurnishedStatus`, `FinishQuality`, and `StreetPosition` | Existing governed vocabulary remains authoritative.                                                                                         | Conforming evidence; no change.[3]                                                                            |
| `PropertyClassification.status` and generic `Status`                                                                                                               | Property Status is a controlled decision-layer vocabulary; its governing source is the government transaction/source record when available. | No free decision-layer value is added; no contract change in this scope.[4]                                   |
| `PropertyClassification.subType`                                                                                                                                   | Subtype remains source-native with provenance.                                                                                              | MIAYAAR does not invent or close the vocabulary; a future controlled vocabulary needs separate governance.[4] |
| `ownershipType`, `tenureType`, `zoning`, `restrictions`, and `encumbrances`                                                                                        | Legal attributes remain source-native evidence with provenance.                                                                             | No local legal taxonomy or mapping is created.[4]                                                             |
| `SourceReference.type`; `StatusInfo.status` and `category`                                                                                                         | Metadata status is a technical vocabulary independent from Property Status and valuation.                                                   | It cannot create valuation rules automatically.[5]                                                            |
| `ConfidenceFactor.dataQuality`                                                                                                                                     | Confidence quality is technical and independent from Property Status and valuation.                                                         | It cannot create valuation rules automatically.[6]                                                            |
| Valuation approach, methodology, type, purpose, property type, and usage terms                                                                                     | Existing contracts and governing vocabularies remain authoritative.                                                                         | Market Intelligence may not introduce a synonym or alternate vocabulary.[7]                                   |
| Currency and external-standard fields                                                                                                                              | They are reference data requiring provenance and appropriate validation.                                                                    | They are not fixed Core Types enums.[8]                                                                       |
| `UnavailableMarketIndicator.reason` and availability `status`                                                                                                      | Existing literal unions remain unchanged.                                                                                                   | No enum conversion and no new literal value without a future ADR-005 or explicit governance decision.[9]      |
| Names, descriptions, notes, addresses, source labels, identifiers, timestamps, URLs, external references, and extension maps                                       | Open human/source input, technical identifiers, or provenance formats remain outside the closed-vocabulary rule.                            | No enum inference.[2] [5] [10] [11]                                                                           |

## Owner decisions recorded

| Decision ID | Approved policy                                                                                                                  | Boundary retained                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| VOC-01      | Property Status is one controlled decision-layer vocabulary governed by the government transaction/source record when available. | No free value is added to the decision layer.                                                  |
| VOC-02      | Subtype, legal rights, and zoning remain source-native with provenance.                                                          | MIAYAAR does not invent or close their vocabulary.                                             |
| VOC-03      | Metadata status and Confidence quality are technical vocabularies independent from Property Status and valuation.                | They do not create valuation rules.                                                            |
| VOC-04      | Current Market availability literal unions remain unchanged.                                                                     | No enum conversion and no new values without a future ADR-005 or explicit governance decision. |
| VOC-05      | Valuation approach, methodology, property type, and usage follow existing governing contracts and vocabularies.                  | Market Intelligence may not add synonyms or alternate vocabulary.                              |
| VOC-06      | Currencies and external standards are reference data with provenance and suitable validation.                                    | They are not fixed Core Types enums.                                                           |

## Post-decision status

| Item              | Status                     | Reason                                                                                                                          |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| IMP-001           | **PARTIAL**                | Local audit-field reconciliation remains outside this gate.[1]                                                                  |
| IMP-002           | **IMPLEMENTED**            | No change to the reconciled building-condition separation.                                                                      |
| IMP-003           | **PARTIAL**                | Policy ownership is documented, but no Core Types implementation or acceptance review was authorized.[1]                        |
| IMP-004           | **IMPLEMENTED**            | No change to the reconciled immutable-contract status.                                                                          |
| Core Types Freeze | **PENDING / not closable** | The backlog requires every Critical item to be complete and Architecture Board approval; IMP-001 and IMP-003 remain Partial.[1] |

No additional vocabulary value, benchmark, fallback, threshold, or coefficient decision is required to preserve the current documentation-only state. To close Core Types Freeze later, the owner must explicitly approve separate bounded implementation scopes for IMP-001 and IMP-003, then require acceptance review and Architecture Board approval. This statement does not authorize either scope.

## Stop condition

No successor implementation starts without a newly approved three-line scope. This update does not alter or start a new Market Intelligence phase and does not authorize work outside IMP-003.

## References

[1]: ../implementation/core-types-backlog.md "Core Types Implementation Backlog — IMP-003"
[2]: ../ADR/ADR-005-Business-Vocabulary.md "ADR-005 — Business Vocabulary Rule"
[3]: ../../core/types/enums.ts "Current Core Types enum catalogue"
[4]: ../../core/types/property.ts "Property classification and legal characteristics"
[5]: ../../core/types/metadata.ts "Metadata source and status contracts"
[6]: ../../core/types/confidence.ts "Confidence factor contract"
[7]: ../../core/types/valuation.ts "Valuation contracts"
[8]: ../../core/types/financial.ts "Financial contracts"
[9]: ../../core/types/market.ts "Market availability contracts"
[10]: ../../core/types/location.ts "Location and address contracts"
[11]: ../../core/types/primitives.ts "Core primitive types"
