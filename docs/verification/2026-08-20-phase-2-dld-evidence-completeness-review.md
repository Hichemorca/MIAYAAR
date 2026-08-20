# Phase 2 — DLD Evidence Completeness & Classification Boundaries Review

**Status:** COMPLETE — documentation and evidence review only
**Review date:** 2026-08-20
**Scope authority:** Owner-approved Phase 2 review following Core Types Freeze closure
**Data source reviewed:** Supabase project `MIAYAAR` (`lrfvfbjkojzlrriyjvrz`), read-only inventory

## Scope and non-interference boundary

This review inventories the current DLD evidence contract, cleaning path, classification boundary, stored evidence fields, and safeguards against unsupported inference. It does not add a source, collect records, alter stored data, change database schema, modify Core Types, alter valuation methodology v1.2, weights, coefficients, comparable selection, Market Intelligence, API output, or UI.

## Supabase inventory snapshot

The read-only aggregate query executed on 2026-08-20 returned the following counts from `public.marketTransactions`.
| Observation | Count |
| -------------------------------- | -----: |
| Total stored transaction records | 30,306 |
| `eligible` records | 26,745 |
| `rejected` records | 3,561 |
| Missing `district` | 0 |
| Missing `propertyType` | 0 |
| Missing `rawSubType` | 0 |
| Missing `areaSqm` | 0 |
| Missing `salePriceAed` | 0 |
| Missing `pricePerSqm` | 0 |
| Missing `transactionDate` | 0 |

> These values establish only the observed completeness of the fields queried. They do not establish the availability of project identifiers, finish, view, floor, rent, legal-rights, zoning, or any other secondary attribute that is not part of the current DLD evidence contract.

## Source provenance

The snapshot was produced through the configured Supabase read-only review path using a single aggregate `SELECT` over `public.marketTransactions`; no DML or DDL statement was executed. The structured response is retained in the task evidence at `/home/ubuntu/.mcp/tool-results/2026-08-20_16-56-40.535898910_supabase_execute_sql_1b1b6ecc.json`.

## Evidence-contract findings

The DLD contract has a deliberately narrow normalized-evidence boundary. The normalized record carries only an immutable source transaction identifier, transaction date, district, canonical property type, source-native raw type and subtype, area, sale price, price per square metre, and an explicit eligibility decision with a bounded rejection reason. The downstream comparable-evidence form is narrower still and contains only fields necessary for comparable selection and time adjustment.[1]
| Evidence category | Fields available through the current contract | Review finding |
| --------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Source identity and time | `sourceTransactionId`, `transactionDate` | Present and explicit. |
| Location and classification | `district`, `propertyType`, `rawType`, `rawSubType` | Present; canonical type and source-native labels are distinct. |
| Transaction economics | `areaSqm`, `salePriceAed`, `pricePerSqm` | Present; observed completeness is 100% for the reviewed stored records. |
| Eligibility audit | `evidenceStatus`, `rejectionReason` | Present; `eligible` is an explicit stored decision, not a value inferred during this review. |
| Secondary attributes | No project, finish, view, floor, rent, legal-rights, or zoning field | Not available through this contract and therefore not available to this review or to the normalized-evidence boundary. |
This review found no contract pathway that would carry an unapproved secondary attribute from a raw record into `NormalizedEvidence` or `ComparableEvidence`. It does not assert that a field absent from this contract is absent from every external source; it records only that the current DLD evidence pathway does not provide it.[1]

## Cleaning and normalization path

The import-cleaning path is deterministic and non-destructive with respect to the supplied raw input. It derives a DLD-prefixed source identifier, records a SHA-256 fingerprint for issue-ledger entries, deduplicates on the source transaction identifier, and retains invalid or duplicate observations as issue-ledger entries rather than silently treating them as eligible evidence.[2]
| Control | Current behavior | Boundary preserved |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Required identifier | A record without a source identifier is invalid. | No anonymous transaction is normalized as evidence. |
| Core validation | Date must parse; area must be greater than 10 sqm; sale price must be positive; district must be non-empty; and property type must be recognized. | Missing or invalid core evidence does not become a comparable. |
| District normalization | Trims, collapses whitespace, and converts district text to uppercase. | Normalizes a known field only; it does not enrich a location. |
| Duplicates | A repeated source transaction identifier is excluded from the cleaned import set and recorded in the issue ledger. | Prevents duplicate evidence from increasing the sample. |
| Explicit rejection | Commercial/general-use land and records beyond the current high-price or high-unit-price controls are retained with `rejected` status and a reason. | Eligibility remains auditable and is not silently reclassified. |
| Derived metric | `pricePerSqm` is calculated from stored sale price and area. | The derivation uses only contract fields. |
The server-side normalizer applies the same property-family and eligibility boundary: unsupported types produce no normalized evidence, while eligible and rejected records expose only contract-declared fields. It does not read, map, or derive any secondary characteristic.[3]

## Property-classification boundary

Property classification is a server-side mapping from DLD source labels to the existing `PropertyType` vocabulary. It has a finite, documented dictionary for apartment, villa, townhouse, office, retail, warehouse, and land. The raw source type has priority; the source subtype is used only as a fallback when the primary source type does not match. Both raw labels remain preserved, so classification does not overwrite source-native evidence.[4]
| Canonical property type | Approved source-label terms |
| ----------------------- | --------------------------- |
| `apartment` | `APARTMENT`, `UNIT`, `FLAT` |
| `villa` | `VILLA` |
| `townhouse` | `TOWNHOUSE` |
| `office` | `OFFICE` |
| `retail` | `RETAIL`, `SHOP` |
| `warehouse` | `WAREHOUSE` |
| `land` | `LAND`, `PLOT` |
No new property type, synonym, fallback label, or secondary-attribute mapping was introduced by this review. A source label outside the documented family mapping remains unsupported rather than being guessed or coerced.[3] [4]

## No-inference safeguard

A regression test was added at the normalized-evidence boundary. It supplies raw properties named `project`, `finish`, `view`, `floor`, and `rent`, then proves that the normalized object does not expose any of them. The test operationalizes the rule that unsupported secondary characteristics must not traverse the current DLD path merely because a caller includes similarly named raw properties.[5]
The test does not create a new source or establish the correctness, availability, or valuation effect of any secondary attribute. It guards only the current contract boundary and preserves the rule that no adjustment, coefficient, benchmark, or fallback may be inferred from unsupported evidence.[5]

## Governing gaps requiring an independent owner decision

The following gaps are not implementation defects that this review may close autonomously. They are unsupported attributes in the current DLD evidence path. Any future collection, normalization, mapping, adjustment, or use of them requires a separate owner decision with an evidentiary source, rights and provenance basis where applicable, an approved contract boundary, and a distinct methodology decision if they could affect a valuation.
| Secondary attribute | Current DLD evidence-path status | Permitted conclusion now | Prohibited action without a new owner decision |
| ------------------- | ----------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| Project identifier | Not present in the normalized or comparable contract. | Treat as unavailable in this pathway. | Project-level inference, mapping, fallback, or valuation use. |
| Finish / condition | Not present in the normalized or comparable contract. | Treat as unavailable in this pathway. | Quality adjustment, coefficient, or proxy construction. |
| View | Not present in the normalized or comparable contract. | Treat as unavailable in this pathway. | View premium/discount, label inference, or price adjustment. |
| Floor | Not present in the normalized or comparable contract. | Treat as unavailable in this pathway. | Floor adjustment, ordering assumption, or inferred unit feature. |
| Rent / income | Not present in the normalized or comparable contract. | Treat as unavailable in this pathway. | Income proxy, rent-based fallback, or valuation input. |
| Legal rights | Not present in the normalized or comparable contract. | Treat as source-native/unavailable, not standardized. | Controlled vocabulary, normalization, or legal-status inference. |
| Zoning | Not present in the normalized or comparable contract. | Treat as source-native/unavailable, not standardized. | Zoning taxonomy, use inference, or valuation adjustment. |

## Governing conclusion

**Phase 2 is complete for its authorized scope.** The read-only inventory establishes complete observed coverage for the current stored core DLD evidence fields, and the reviewed contract, cleaning, and classification paths preserve a narrow server-side evidence boundary. The added regression test confirms that unsupported secondary attributes do not pass through the normalized evidence object.[1] [2] [3] [4] [5]
This conclusion is deliberately limited. It does not certify dataset accuracy beyond the queried completeness checks, establish secondary-attribute coverage, approve a new source, change any acceptance rule, or authorize a valuation where eligible local DLD evidence is insufficient. The owner must make an independent governance decision before any future phase changes the documented secondary-attribute boundary. No next implementation phase is started by this report.

## Change record

| Item                                                                                                                                | Result                                           |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Product logic, valuation engine, methodology, weights, coefficients, comparable-selection rules, API, UI, database schema, and data | No change.                                       |
| Core Types, interfaces, and contracts                                                                                               | No change.                                       |
| Test coverage                                                                                                                       | One no-inference boundary regression test added. |
| Documentation                                                                                                                       | This Phase 2 completion record added.            |

## References

[1]: ../../server/valuation/evidence.contracts.ts "DLD evidence contracts"
[2]: ../../scripts/lib/dld-evidence-cleaning.mjs "DLD evidence cleaning"
[3]: ../../server/valuation/evidence-validation.ts "DLD evidence validation"
[4]: ../../server/valuation/property-classification.ts "Property classification"
[5]: ../../server/valuation/evidence-validation.test.ts "Evidence validation regression tests"
