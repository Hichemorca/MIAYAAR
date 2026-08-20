# MIAYAAR — IMP-003 Implementation Inventory

**Date:** 2026-08-20

**Status:** IMPLEMENTED WITH NO ADDITIONAL APPROVED CONVERSIONS

**Scope:** Owner-approved IMP-003 implementation scope only

## Inventory conclusion

This inventory applies ADR-005 and owner decisions VOC-01 through VOC-06 to vocabulary-like fields in `core/types/`. The codebase already centralises each business vocabulary whose complete value set is approved. This closure creates no enum, literal, mapping, synonym, `UNKNOWN`, `OTHER`, `UNSPECIFIED`, fallback, valuation rule, or behavioural change.

## Existing central closed vocabulary

The following fields already use the central catalogue in `core/types/enums.ts`: `PropertyClassification.type`, `PropertyClassification.usage`, `PhysicalCharacteristics.floorLevel`, `StructuralCharacteristics.propertyCondition`, `StructuralCharacteristics.buildingCondition`, `StructuralCharacteristics.finishQuality`, `StructuralCharacteristics.furnished`, `StructuralCharacteristics.viewType`, `StructuralCharacteristics.streetPosition`, `TransactionVolume.transactionType`, market evidence sources typed as `DataSource`, and `OverallConfidence.level`.

No conversion was necessary for these fields. Their existing enum representations remain the sole approved contract representation.

## Retained representations

`PropertyClassification.subType`, legal rights, tenure, zoning, restrictions, and encumbrances remain source-native under VOC-02. `SourceReference.type`, `StatusInfo.status`, `StatusInfo.category`, and `ConfidenceFactor.dataQuality` remain technical vocabulary under VOC-03. The availability statuses and reasons in the Market contracts remain literal unions under VOC-04. Currency, external standards, financial periods, and source identifiers remain reference data under VOC-06. Names, descriptions, notes, addresses, identifiers, timestamps, URLs, external references, extension maps, and free-form market descriptions remain open human or source input.

## UNRESOLVED / NOT CLOSED VOCABULARY

`PropertyClassification.status` remains the generic `Status` representation. VOC-01 establishes a controlled decision-layer concept but does not define finite values, a canonical government mapping, or a central `PropertyStatus` enum. The owner approved retaining the current representation without conversion.

`ValuationApproachResult.approach`, `ValuationResult.methodology`, `ValuationMetadata.type`, and `ValuationMetadata.purpose` remain unchanged. VOC-05 requires their governing contracts to remain authoritative but does not provide finite enum values or a central enum contract. The owner approved retention until separate governance defines values and authority.

## Result

All approved closed business vocabularies were already centralised, and no additional conversion is approved. IMP-003 is therefore **IMPLEMENTED WITH NO ADDITIONAL APPROVED CONVERSIONS**. The `UNRESOLVED / NOT CLOSED VOCABULARY` representations are policy-approved retention decisions, not implementation failures or technical gaps.

No change is authorised to the Valuation Engine, methodology v1.2, weights, coefficients, comparable selection, API, UI, or Market Intelligence. Core Types Freeze remains pending the required architecture acceptance review.

## References

[1]: ../ADR/ADR-005-Business-Vocabulary.md "ADR-005 — Business Vocabulary Rule"
[2]: IMP-003-BUSINESS-VOCABULARY-POLICY-GATE-2026-08-20.md "IMP-003 Policy Gate and VOC-01 through VOC-06"
[3]: ../../core/types/enums.ts "Current central enum catalogue"
[4]: ../../core/types/property.ts "Property classification and legal characteristics"
[5]: ../../core/types/metadata.ts "Technical metadata contracts"
[6]: ../../core/types/market.ts "Market availability contracts"
[7]: ../../core/types/valuation.ts "Valuation contracts"
[8]: ../../core/types/confidence.ts "Confidence contracts"
