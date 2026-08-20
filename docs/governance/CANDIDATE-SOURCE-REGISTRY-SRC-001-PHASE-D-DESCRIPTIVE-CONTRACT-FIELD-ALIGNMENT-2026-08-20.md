# SRC-001 — Phase D Descriptive Contract-Field Alignment

**Candidate:** `CAND-2026-001` / `SRC-001` — Bayut – UAE Property Search
**Phase:** D — descriptive evidence-contract alignment only
**Prior decision:** `G-3 = HOLD`
**Governing policy:** `NSE-RG-v1.0`
**Scope:** `M-03/M-04` research governance only
**Recorded at:** `2026-08-20T06:47:52Z`
**Recorded by:** Manus AI

> This document maps only category-level facts previously recorded in the Phase B and Phase C records to **names of existing MIAYAAR contract fields**. A `MENTIONED`, `NOT_MENTIONED`, or `UNKNOWN` state is descriptive only: it does not establish that a field exists in the source, contains a value, is complete, is accurate, can be accessed, may be collected, can be transformed, or is permitted for valuation use. [1] [2] [3]

## 1. Boundary and decision continuity

No website, terms page, privacy page, API, account feature, search result, listing, price, rental record, valuation result, or other source content was accessed for this phase. The only source-side statements used are the owner-provided Phase B description of `SRC-001` as `market`, the owner's statement that the candidate concerns sales, rents, and property valuations, and the Phase C record that the public home page displayed sale, rent, and new-project navigation. No data value from any such category is copied into this document. [1] [2]

The Phase C fact record and the `G-3` decision remain controlling. The candidate remains `HOLD` with `UNVERIFIED_RIGHTS`; neither the map nor any status in it creates a provider, invokes the generic provider contract, constructs a canonical value, or changes a MIAYAAR valuation contract. [2] [3] [4]

| Alignment status | Meaning in this record                                                                       | Explicitly not meant                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MENTIONED`      | A previously recorded category-level statement names the general subject of a current field. | The field is present, accessible, valid, complete, usable, or authorised. |
| `NOT_MENTIONED`  | No previously recorded source or owner statement names the field or its subject.             | The field is absent from the source.                                      |
| `UNKNOWN`        | A high-level category was recorded, but its field-level attributes were not.                 | A missing attribute may be inferred or filled by a default.               |

## 2. Existing contract-field map

The table deliberately uses only named fields that already exist in the canonical types, active valuation input, or independent Market Intelligence contract. Market Intelligence evidence is explicitly DLD-only; therefore, an SRC-001 category statement cannot populate or replace any `source: "DLD"` field. [4]

| Existing MIAYAAR contract field                        | Previously recorded descriptive statement                                                                       | Alignment state | Missing field-level facts and explicit non-implication                                                                                                                 |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MarketIntelligenceRequest.district`                   | `market` category; public property-search navigation recorded.                                                  | `UNKNOWN`       | No declared district value or coverage. It cannot form a benchmark filter.                                                                                             |
| `MarketIntelligenceRequest.propertyType`               | `market` category; public property-search navigation recorded.                                                  | `UNKNOWN`       | No declared MIAYAAR property-type enumeration or field value. It cannot form a benchmark filter.                                                                       |
| `MarketIntelligenceRequest.asOf`                       | No source-data observation or reporting time was recorded.                                                      | `NOT_MENTIONED` | The terms' effective date is not a data `asOf` value and cannot be substituted.                                                                                        |
| `MarketIntelligenceEvidenceRecord.pricePerSqm`         | The owner described the candidate as concerning sales.                                                          | `UNKNOWN`       | No price, unit, area, currency, period, transaction link, or calculation basis was recorded. No price-per-square-metre value exists.                                   |
| `MarketIntelligenceEvidenceRecord.sourceTransactionId` | No transaction identifier statement was recorded.                                                               | `NOT_MENTIONED` | No transaction-level provenance or DLD substitution is created.                                                                                                        |
| `MarketIntelligenceEvidenceRecord.transactionDate`     | No transaction-time statement was recorded.                                                                     | `NOT_MENTIONED` | No temporal eligibility, window, or `asOf` rule can be assessed.                                                                                                       |
| `MarketIntelligenceEvidenceRecord.sourceChecksum`      | No checksum or source-artifact identifier statement was recorded.                                               | `NOT_MENTIONED` | No record integrity or source checksum exists.                                                                                                                         |
| `MarketIntelligenceEvidenceRecord.evidenceStatus`      | No candidate statement expresses MI v1.0 DLD eligibility.                                                       | `NOT_MENTIONED` | The candidate is not eligible evidence and cannot enter Market Intelligence.                                                                                           |
| `propertySubmission.annualRentAed`                     | The owner described the candidate as concerning rents; the Phase C home-page fact record notes rent navigation. | `UNKNOWN`       | No annual rent, AED currency, property linkage, period, or amount was recorded. No income input is created.                                                            |
| `propertySubmission.replacementCostPerSqm`             | No construction or replacement-cost statement was recorded.                                                     | `NOT_MENTIONED` | No cost input, unit, currency, or normalisation basis is created.                                                                                                      |
| `propertySubmission.landValueAed`                      | No land-value statement was recorded.                                                                           | `NOT_MENTIONED` | No land-value input, currency, date, or subject-property link is created.                                                                                              |
| `propertySubmission.depreciationFactor`                | No depreciation statement was recorded.                                                                         | `NOT_MENTIONED` | No factor, coefficient, threshold, fallback, or adjustment is created.                                                                                                 |
| `Property.physical.totalArea`                          | No physical-area field statement was recorded.                                                                  | `NOT_MENTIONED` | No area or area-unit value is available for any calculation.                                                                                                           |
| `Property.classification.type`                         | The candidate is described at the `market` category level only.                                                 | `UNKNOWN`       | No property-type field value or canonical enumeration mapping is established.                                                                                          |
| `ValuationResult.value`                                | The owner described the candidate as concerning property valuations.                                            | `UNKNOWN`       | No valuation amount, currency, date, methodology, version, purpose, range, weight, or confidence information was recorded. No valuation result is created or compared. |

## 3. Income, cost, and DCF boundary

The active valuation input exposes a named annual-rent field and named cost-related fields, which are mapped above only at the descriptive level. No separate current `propertySubmission` field for a discount rate, cash-flow series, net operating income, terminal value, or DCF period was identified in the active public valuation input. This is a statement about the current contract surface, not a request to add a field or a finding about source capability. [5]

Accordingly, the map does not create a DCF placeholder, an income estimate, a cost estimate, a price benchmark, a currency conversion, a unit conversion, a time normalisation, an adjustment, a coefficient, a fallback rule, or any other transformed value. The canonical `Property` type itself excludes market data and financial values from the intrinsic-property entity. [6]

## 4. Preserved gaps and non-interference

| Governance area    | Current record                                                                               | Status              |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------- |
| Provenance         | Prior source-operator conflict remains unreconciled.                                         | `CONFLICT_RECORDED` |
| Rights             | No licence or source-specific use clearance exists for MIAYAAR.                              | `UNVERIFIED_RIGHTS` |
| Linkage            | No property, project, legal-identity, or transaction linkage was examined.                   | `NOT_ASSESSED`      |
| Time               | No source-data observation, reporting period, or transaction time was recorded.              | `INCOMPLETE`        |
| Transformation     | No unit, currency, period, normalisation, FX, adjustment, or calculation basis was recorded. | `NOT_ASSESSED`      |
| Independent review | No independent reviewer has reviewed the alignment.                                          | `NOT_ASSESSED`      |
| Usage governance   | Retention, deletion, access, sharing, and cross-border processing remain undecided.          | `UNRESOLVED_POLICY` |
| Research decision  | The existing G-3 rights-and-usage decision is unchanged.                                     | `HOLD`              |

No code, API, database schema, database row, DLD evidence, raw source artifact, Valuation Engine, methodology v1.2, method weight, coefficient, comparable-selection rule, confidence logic, user interface, or valuation output changed. No candidate statement is a substitute for locally eligible DLD sales evidence. [3] [4]

## 5. References

[1]: CANDIDATE-SOURCE-REGISTRY-SRC-001-BAYUT-2026-08-20.md "SRC-001 Phase B candidate source registry record"
[2]: CANDIDATE-SOURCE-REGISTRY-SRC-001-PHASE-C-PROVENANCE-RIGHTS-2026-08-20.md "SRC-001 Phase C passive provenance and rights fact record"
[3]: CANDIDATE-SOURCE-REGISTRY-SRC-001-G3-RIGHTS-USAGE-DECISION-2026-08-20.md "SRC-001 G-3 rights and usage decision"
[4]: ../../contracts/market-intelligence.contracts.ts "Market Intelligence v1.0 DLD-only contract"
[5]: ../../server/routers.ts "Active valuation input contract"
[6]: ../../core/types/property.ts "Canonical property domain type"
