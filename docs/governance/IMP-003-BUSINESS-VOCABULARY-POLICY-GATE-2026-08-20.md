# MIAYAAR — IMP-003 Business Vocabulary Policy Gate

**Date:** 2026-08-20  
**Status:** Owner-approved inventory complete; owner decisions pending  
**Scope:** Read-only inventory of open fields in `core/types/` and their governance classification.

> This Policy Gate creates no enum, no literal value, no fallback, no threshold, and no code change. It does not amend Core Types, interfaces, contracts, methodology v1.2, weights, coefficients, the Valuation Engine, API, UI, data, or Market Intelligence.

## Governing rule and result

IMP-003 requires all **Closed Business Vocabulary** to be enums, while open human input remains string.[1] ADR-005 supplies the same distinction, but it does not define a complete canonical value set for the unresolved fields listed below.[2] The inventory therefore records classification evidence and decision dependencies only.

**Outcome:** IMP-003 remains **PARTIAL** and Core Types Freeze remains **PENDING**. No acceptance criterion is met merely by locating a `string`; the owner must first determine whether that field is a closed vocabulary, an open input, an external standard, or a technical identifier.

## Inventory

| Contract field or representation                                                                                                                                                                    | Evidence classification                                                                                              | Current representation            | Gate result                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing property characteristics such as `PropertyType`, `UsageType`, `PropertyCondition`, `BuildingCondition`, `ViewType`, `FloorLevel`, `FurnishedStatus`, `FinishQuality`, and `StreetPosition` | Closed vocabulary already catalogued                                                                                 | Enum                              | **Conforming evidence**; no action.[3]                                                                                                                             |
| `PropertyClassification.status` and generic primitive `Status`                                                                                                                                      | Lifecycle/business state is described as a state or phase, but has no canonical value set                            | `Status = string`                 | **Owner decision required**: decide whether Property status is closed and, if so, supply its authoritative vocabulary and ownership.[4]                            |
| `PropertyClassification.subType`                                                                                                                                                                    | Specific category may be a closed taxonomy, but no taxonomy or source authority is specified                         | `string`                          | **Owner decision required**: determine whether an authoritative subtype catalog exists; do not infer values.[4]                                                    |
| `LegalCharacteristics.ownershipType`, `tenureType`, and `zoning`                                                                                                                                    | Legal/regulatory terms may be controlled by jurisdiction or source rather than platform vocabulary                   | `string`                          | **Source-policy decision required**: identify a governing authority and whether values are canonical; no enum may be invented.[4]                                  |
| `LegalCharacteristics.restrictions` and `encumbrances`                                                                                                                                              | Legal statements can be record-specific narrative or structured external classifications                             | `readonly string[]`               | **Ambiguous**: owner must decide whether these remain evidence text or reference an approved taxonomy.[4]                                                          |
| `SourceReference.type`; `StatusInfo.status` and `category`                                                                                                                                          | Source and technical lifecycle classifications are named as classifications/statuses, but no value sets are declared | `string`                          | **Architecture decision required**: distinguish closed technical vocabulary from source-supplied or open labels before any representation change.[5]               |
| `ConfidenceFactor.dataQuality`                                                                                                                                                                      | Documented as a quality status, but no enumerated states or policy owner is present                                  | `string`                          | **Owner decision required**: determine whether it is a closed quality taxonomy and identify the governing policy; no confidence semantics change is authorized.[6] |
| `ValuationApproachResult.approach`, `ValuationResult.methodology`, and `ValuationMetadata.type` / `purpose`                                                                                         | Potentially controlled valuation vocabulary; their meaning intersects frozen valuation governance                    | `string`                          | **Separate ADR-011-bound decision required**: no change or proposed value is permitted through IMP-003 alone.[7]                                                   |
| `ValuationMetadata.currency`; `Currency.code`; exchange-rate currency fields                                                                                                                        | External ISO/reference codes rather than a platform-defined business list                                            | `string`                          | **External-standard classification**: retain pending an explicit decision on validation/reference modeling; do not enumerate a currency list.[8]                   |
| `UnavailableMarketIndicator.reason` and availability `status`                                                                                                                                       | Closed availability values exist, but `reason` is a literal union rather than an enum                                | Literal string values             | **ADR-005 interpretation decision required**: decide whether technical availability terms are subject to its enum rule. No automatic conversion is authorized.[9]  |
| Names, descriptions, notes, justifications, address fields, source labels, period descriptions, and similar narrative fields                                                                        | Open human input or source text                                                                                      | `string` / `Name` / `Description` | **Retain as open input**; ADR-005 expressly excludes this class from enumeration.[2] [10]                                                                          |
| IDs, timestamps, versions, URLs, external references, session/client identifiers, and extension maps                                                                                                | Technical identifier, format, provenance, or extensibility data                                                      | Primitive strings / records       | **Out of vocabulary scope**; no enum inference.[5] [11]                                                                                                            |

## Decisions reserved for the owner

The following are the only decisions requested by this gate. None implies authorization to implement.

| Decision ID | Required owner decision                                                                                                                                            | Dependency                                 | Prohibited inference                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| VOC-01      | State whether Property lifecycle status is a closed platform vocabulary and name its authoritative source.                                                         | `Status` / `PropertyClassification.status` | No status values or default state.                            |
| VOC-02      | State whether property subtype, ownership, tenure, zoning, restrictions, and encumbrances are platform vocabularies, external registries, or open/source evidence. | Legal and classification fields            | No legal taxonomy or jurisdictional mapping.                  |
| VOC-03      | State whether source/lifecycle/quality statuses in Metadata and Confidence are closed technical vocabularies, and identify their policy owners.                    | Metadata and Confidence                    | No quality labels, categories, or confidence behavior.        |
| VOC-04      | Clarify whether ADR-005 requires TypeScript enums for the Market availability literal union, or whether this technical availability contract is exempt.            | `MarketIndicator`                          | No contract conversion or availability rule change.           |
| VOC-05      | Determine the governing release path for valuation approach, methodology, type, and purpose terminology.                                                           | ADR-011                                    | No methodology term, approach, weight, or coefficient change. |
| VOC-06      | Decide whether external standards require validation/reference modeling rather than enums for currencies and other externally assigned codes.                      | Financial contracts                        | No currency catalog or validation rule.                       |

## Stop condition

No successor implementation is authorized until the owner resolves the relevant decision(s) and explicitly approves a new three-line scope. The gate does not reopen the Core Types Freeze, does not alter Market Intelligence, and does not authorize work outside IMP-003.

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
