# MIAYAAR — IMP-001 Platform Metadata Implementation Acceptance

**Date:** 2026-08-20  
**Status:** Accepted for IMP-001 scope  
**Authority:** ADR-002; owner-approved MET-01 to MET-03 implementation scope  
**Implementation branch:** `core/imp-001-platform-metadata`

## Decision implemented

ADR-002 requires canonical `Metadata` for every Entity Contract and defines it as the platform-wide source of auditability, provenance, versioning, and technical lifecycle information.[1] MET-01 classifies the local `Valuation.createdAt` and `Confidence.createdAt` fields as technical audit time, rather than domain facts.[2] The implementation therefore removes these duplicate local fields and retains `metadata.timestamps.createdAt` as the single entity audit-creation timestamp.

The implementation does not collapse domain time into audit time. `ValuationMetadata.valuationDate` remains the explicit valuation business-date fact, and `ConfidenceAssessment.assessedAt` remains the explicit assessment fact. The valuation engine creates separate values for the business valuation event and for the technical audit lifecycle; neither is used as a replacement for evidence, transaction, or market-observation time.[2] `MarketSnapshot` remains unchanged as the bounded read model required by MET-02.[3]

| Acceptance criterion                                         | Evidence                                                                                                                                        | Result |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `Property`, `Valuation`, and `Confidence` require `Metadata` | Canonical contracts retain mandatory `metadata: Metadata` fields.[4] [5] [6]                                                                    | Met    |
| No local entity audit field remains                          | `Valuation.createdAt` and `Confidence.createdAt` were removed; their only entity audit creation time is `metadata.timestamps.createdAt`.[5] [6] | Met    |
| Domain and audit time remain separate                        | `valuationDate` and `assessedAt` remain explicit domain facts; audit time is confined to `Metadata`.[2] [5] [6]                                 | Met    |
| Valuation behavior remains unchanged                         | Regression tests preserve valuation result, methodology identifier, bounds, warnings, and provenance expectations.[7]                           | Met    |
| Out-of-scope systems remain unchanged                        | No changes were made to weights, coefficients, comparable selection, API, UI, Market Intelligence, database schema, or methodology v1.2.        | Met    |

## Verification evidence

The implementation adds a contract regression test for `Confidence`, updates the canonical `Valuation` contract regression test, and extends the valuation-engine regression test. The targeted suite contains ten passing tests across the three affected suites. TypeScript compilation passes after the contract change.

## Core Types Freeze status

**IMP-001 is IMPLEMENTED.** The Core Types Freeze remains **PENDING** because IMP-003 is still Partial and the backlog requires every critical task plus Architecture Board acceptance before the freeze can close.[8]

## Explicit non-changes

This implementation does not change the evidence threshold, transaction selection, valuation engine calculations, methodology v1.2, weights, coefficients, confidence scoring behavior, public API behavior, user interface, database schema, Market Intelligence, Evidence Integrity, or SRC-001 governance.

## References

[1]: ../ADR/ADR-002-Platform-Metadata.md "ADR-002 — Platform Metadata"
[2]: IMP-001-PLATFORM-METADATA-POLICY-GATE-2026-08-20.md "MET-01 through MET-03 policy decisions"
[3]: ../../core/types/market.ts "Market snapshot contract"
[4]: ../../core/types/property.ts "Canonical Property entity"
[5]: ../../core/types/valuation.ts "Canonical Valuation entity"
[6]: ../../core/types/confidence.ts "Canonical Confidence entity"
[7]: ../../tests/engines/valuation/valuation.engine.test.ts "Valuation engine regression suite"
[8]: ../implementation/core-types-backlog.md "Core Types Implementation Backlog"
