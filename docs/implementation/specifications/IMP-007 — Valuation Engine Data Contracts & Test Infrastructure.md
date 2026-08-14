# IMP-007 — Valuation Engine Data Contracts & Test Infrastructure

## 1. Title and Scope

**IMP-007 — Valuation Engine Data Contracts & Test Infrastructure**

**Scope:** Define the structured INPUT DATA CONTRACTS required by the four valuation approaches (Sales Comparison, Income Capitalization, Cost Approach, DCF), and extend the Valuation Engine to distinguish between "no structurally usable data" and "structurally usable data whose calculation is deferred."

IMP-007 is structural readiness only. No valuation formulas, weighting, aggregation, scenarios, or configuration resolution are implemented.

---

## 2. Objective / Purpose

The current `ValuationRequest` contains `property` and `market` context but does not yet expose all approach-specific input data required for future calculation implementation.

IMP-007 establishes the **structural data layer** required before actual valuation formulas are implemented.

**Key distinction:** Data availability ? Valuation calculated.

IMP-007 is about data readiness, not valuation calculation.

---

## 3. Applicable Architecture / ADR References

| Document | Relevance |
|----------|-----------|
| ADR-007 | Standardized Result Object Contract |
| ADR-009 | Valuation Engine Boundary |
| IMP-005 | Valuation Engine Specification |
| IMP-006 | Foundation Hardening |
| VALUATION-METHODOLOGY.md | Approach applicability and data definitions |
| ARCHITECTURE.md | System architecture and layer responsibilities |

---

## 4. Core Contract Changes

**No core contracts are modified in IMP-007.**

The following remain frozen and untouched:
- `core/types/**`
- `core/results/**`
- `core/contracts/**`

The `ValuationRequest` contract is extended within the engine's local types, not in core.

---

## 5. ValuationData Contracts

### 5.1 ComparableAdjustments

Optional numeric adjustment multipliers, all fields optional.

Sources: VALUATION-METHODOLOGY.md §6.1-6.10

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `condition` | `number` | Optional | Physical condition adjustment (§6.1) |
| `buildingCondition` | `number` | Optional | Building condition adjustment (§6.2) |
| `viewType` | `number` | Optional | View type adjustment (§6.3) |
| `floorLevel` | `number` | Optional | Floor level adjustment (§6.4) |
| `streetPosition` | `number` | Optional | Street position adjustment (§6.5) |
| `finishQuality` | `number` | Optional | Finish quality adjustment (§6.6) |
| `furnishedStatus` | `number` | Optional | Furnished status adjustment (§6.7) |
| `ageDepreciation` | `number` | Optional | Age/depreciation adjustment (§6.9) |
| `gisPenalty` | `number` | Optional | GIS/location penalty adjustment (§6.10) |

### 5.2 ComparableTransaction

A historical transaction used as evidence for the Sales Comparison approach.

Source: VALUATION-METHODOLOGY.md §4.1, §9

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `salePrice` | `Money` | Yes | Sale price of the comparable |
| `area` | `number` | Yes | Total area of the comparable in square meters |
| `saleDate` | `string` | Yes | Date of the transaction (ISO 8601) |
| `distanceMeters` | `number` | Optional | Distance to subject property in meters |
| `adjustments` | `ComparableAdjustments` | Optional | Adjustment factors for this comparable |

### 5.3 IncomeData

Income-related data for the Income Capitalization approach.

All rates are expressed as decimals (e.g., 0.10 for 10%).

Source: VALUATION-METHODOLOGY.md §4.2, §7

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `grossRent` | `Money` | Yes | Annual gross rental income in AED |
| `vacancyRate` | `number` | Yes | Vacancy rate (0.0-1.0) |
| `operatingExpenses` | `number` | Yes | Operating expenses as percentage of gross rent (0.0-1.0) |
| `capRate` | `number` | Yes | Capitalization rate (0.0-1.0) |

### 5.4 CostData

Cost-related data for the Cost Approach.

Source: VALUATION-METHODOLOGY.md §4.3

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `replacementCostPerSqm` | `Money` | Yes | Replacement cost per square meter in AED/sqm |
| `depreciationFactor` | `number` | Yes | Depreciation factor (0.0-1.0) |
| `landValue` | `Money` | Optional | Land component value in AED |

### 5.5 DCFData

Forward-looking data for the Discounted Cash Flow approach.

All rates are expressed as decimals (e.g., 0.10 for 10%).

Source: VALUATION-METHODOLOGY.md §4.4, §7

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `initialNOI` | `Money` | Yes | Initial annual net operating income in AED |
| `projectionPeriod` | `number` | Yes | Projection period in years |
| `rentalGrowthRate` | `number` | Yes | Annual rental growth rate (0.0-1.0) |
| `discountRate` | `number` | Yes | Discount rate (0.0-1.0) |
| `exitCapRate` | `number` | Yes | Exit capitalization rate (0.0-1.0) |
| `exitCosts` | `number` | Yes | Exit costs as percentage of terminal value (0.0-1.0) |

### 5.6 ValuationData

Container for all approach-specific input data.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `comparables` | `ComparableTransaction[]` | Optional | Comparable transactions for Sales Comparison |
| `income` | `IncomeData` | Optional | Income data for Income Capitalization |
| `cost` | `CostData` | Optional | Cost data for Cost Approach |
| `dcf` | `DCFData` | Optional | DCF data for DCF approach |

All fields optional because not every property type supports every approach.

---

## 6. ValuationRequest Extension

**File:** `engines/valuation/types/index.ts`

```typescript
export interface ValuationRequest {
  readonly property: Property;
  readonly market: MarketSnapshot;
  readonly data?: ValuationData;  // Added by IMP-007
}
```

No other changes to `ValuationRequest` are made.

---

## 7. Structural Validation Rules

**Validation Philosophy:** Structural completeness only — no business plausibility, no economic reasonableness, no range validation.

### Sales Comparison

Valid when:
- `comparables` exists
- Array is non-empty
- At least one comparable contains:
  - `salePrice` (Money object)
  - `salePrice.amount`
  - `area`
  - `saleDate` (non-empty string)

### Income Capitalization

Valid when:
- `income` exists
- All four required fields are present:
  - `grossRent`
  - `vacancyRate`
  - `operatingExpenses`
  - `capRate`

### Cost Approach

Valid when:
- `cost` exists
- Required fields present:
  - `replacementCostPerSqm`
  - `depreciationFactor`
- `landValue` is optional

### DCF

Valid when:
- `dcf` exists
- All six required fields are present:
  - `initialNOI`
  - `projectionPeriod`
  - `rentalGrowthRate`
  - `discountRate`
  - `exitCapRate`
  - `exitCosts`

---

## 8. Result / Status Semantics

| Condition | Status | Reason Code | Data.available |
|-----------|--------|-------------|----------------|
| Missing property or market | ERROR | `VAL_ERR_INVALID_REQUEST` | `false` |
| Valid request, no usable data | ERROR | `VAL_ERR_NOT_IMPLEMENTED` | `false` |
| Valid request, usable data exists | PARTIAL | `VAL_PARTIAL_DATA_AVAILABLE` | `false` |
| Valuation calculated | SUCCESS | N/A | `true` |

**SUCCESS is NOT used in IMP-007.** The `available: true` branch is never exercised.

**PARTIAL** means: "structurally usable approach data exists, but calculation is still deferred."

**ERROR** means: "no usable approach data OR invalid request."

---

## 9. Error Codes

| Code | Description |
|------|-------------|
| `VAL_ERR_INVALID_REQUEST` | Missing property or market |
| `VAL_ERR_NOT_IMPLEMENTED` | Calculation not yet implemented, no usable data |
| `VAL_PARTIAL_DATA_AVAILABLE` | Data available but calculation deferred |

---

## 10. ValuationOutcome Invariants

The `available: false` branch must contain **no numeric valuation fields**.

No fabricated values permitted:
- No `value: 0`
- No `lowerValue: 0`
- No `baselineValue: 0`
- No `upperValue: 0`

The `available: true` branch remains unused in IMP-007.

---

## 11. Determinism Requirements

The Valuation Engine must be **deterministic** per IMP-005 §9 and ADR-009.

Given the same inputs and configuration, it must produce identical outputs.

No reliance on:
- `Math.random()`
- `Date.now()`
- `new Date()`
- System clock
- External state
- Mutable global state

**Metadata determinism:** `requestId` and `timestamp` use deterministic fallback values until the Orchestrator provides correlation IDs. The fallback request ID is `'local-fallback'` and the fallback timestamp is `'2026-01-01T00:00:00.000Z'`. These placeholders do not affect valuation calculations and preserve determinism.

---

## 12. Metadata Handling

`ResultMetadata` must contain:

| Field | Type | Source |
|-------|------|--------|
| `requestId` | `ID` | Deterministic fallback: `'local-fallback'` |
| `engine` | `string` | `'ValuationEngine'` |
| `version` | `Version` | `'1.0.0'` |
| `timestamp` | `Timestamp` | Deterministic fallback: `'2026-01-01T00:00:00.000Z'` |

The fallback values are **temporary** and documented as such in the code. They will be replaced when the Orchestrator provides correlation IDs.

---

## 13. Test Requirements / Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| All data contracts compile | `npm run build` passes |
| Structural availability logic works | `npm test` passes |
| Empty data ? ERROR | Test case |
| Complete data ? PARTIAL | Test case |
| Incomplete data ? ERROR | Test cases |
| Empty comparables ? ERROR | Test case |
| No numeric fields in `available: false` | Test case |
| No unsafe casts | Code review |
| IMP-006 regression tests pass | All existing tests pass |
| Deterministic metadata | Test case |
| Comparable without salePrice ? ERROR | Test case |

**Test count:** 15 tests (5 IMP-006 baseline + 10 IMP-007 new)

---

## 14. Explicitly Out of Scope

- Valuation formulas
- Weighting
- Aggregation
- Scenario mechanics
- Configuration resolution
- Valuation calculation logic
- Lower/Baseline/Upper scenario execution
- Data ingestion or cleaning
- External data source access
- Confidence scoring
- Orchestrator logic
- Calibration Studio
- Report generation

---

## 15. Relationship to IMP-005 and IMP-006

| Milestone | Relationship |
|-----------|--------------|
| IMP-005 | The four valuation approaches (Sales Comparison, Income Capitalization, Cost, DCF) are defined. IMP-007 provides their input data contracts. |
| IMP-006 | Foundation hardening complete: tooling, tests, fixtures, `ValuationOutcome` safety invariant. IMP-007 preserves all IMP-006 guarantees. |

---

## 16. Final Acceptance / Adoption Criteria

1. ? All data contracts compile
2. ? All structural validation logic works
3. ? All tests pass (15/15)
4. ? No core contracts modified
5. ? No fabricated valuation data
6. ? No unsafe casts
7. ? Deterministic metadata
8. ? IMP-006 invariants preserved
9. ? No valuation formulas implemented
10. ? No weighting/aggregation/scenarios

---

## 17. Files Affected

### Created

- `engines/valuation/types/valuation-data.contracts.ts`
- `tests/fixtures/valuation-data.fixture.ts`

### Modified

- `engines/valuation/types/index.ts`
- `engines/valuation/valuation.engine.ts`
- `tests/engines/valuation/valuation.engine.test.ts`

---

## 18. Assumptions / Resolved Decisions

| Item | Status |
|------|--------|
| DCF applies to Land | RESOLVED (VALUATION-METHODOLOGY.md v1.1) |
| Structural validation only | RESOLVED |
| Comparable minimum: at least one | RESOLVED |
| Metadata determinism | RESOLVED (temporary fallback) |
| No business plausibility validation | RESOLVED |

---

**Status: APPROVED**
