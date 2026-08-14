IMP-006 — Foundation Hardening: Tooling, Tests, ADR-009 Index
Title
IMP-006: Foundation Hardening — Tooling, Tests, ADR-009 Index

Objective
Establish the foundational tooling and test infrastructure required for the MIAYAAR project, ensuring all future development has a solid, validated baseline.

Scope
Add package.json and package-lock.json

Add tsconfig.json

Add test fixtures for Property and MarketSnapshot

Add core type tests

Add result contract tests

Add contract tests

Add Valuation Engine skeleton tests

Register ADR-009 in the ADR index

Requirements
Node.js test infrastructure using node:test and node:assert/strict

TypeScript configuration with strict mode

Build process: npm run build → tsc

Test process: npm test → node --test

Test fixtures must be deterministic and complete

All core contracts must be validated

ValuationEngine must compile with the skeleton implementation

ADR-009 must be registered in docs/ADR/README.md

Baseline Before IMP-007
ValuationOutcome introduced with explicit available: false branch containing no numeric fields

ValuationEngine returns ERROR with VAL_ERR_NOT_IMPLEMENTED for all valid requests

No fabricated valuation data

No unsafe casts (as any, null as any)

No placeholder zero values

No value: 0, lowerValue: 0, baselineValue: 0, upperValue: 0

Regression Tests That Must Be Preserved
ValuationEngine reports ERROR for request missing property

ValuationEngine reports ERROR for request missing market

ValuationEngine reports "not implemented" for structurally valid request

ValuationEngine never falls back to placeholder metadata values

ValuationOutcome.available === false never contains numeric valuation fields

Safety Invariants / Guarantees
Invariant	Status
ValuationOutcome.available === false contains no numeric fields	✅
No value: 0	✅
No lowerValue: 0	✅
No baselineValue: 0	✅
No upperValue: 0	✅
No fabricated valuation data	✅
No unsafe casts (as any, null as any)	✅
No fabricated request IDs/timestamps	✅
No placeholder metadata values	✅
Forbidden Changes
Modify core/types/** (Frozen)

Modify core/results/** (Frozen)

Modify core/contracts/** (Frozen)

Fabricate valuation numbers

Introduce unsafe casts

Introduce Jest/Vitest (use node:test)

Files Created by IMP-006
package.json

package-lock.json

tsconfig.json

tests/fixtures/property.fixture.ts

tests/fixtures/market.fixture.ts

tests/core/types/valuation.test.ts

tests/core/results/result.test.ts

tests/core/contracts/contracts.test.ts

tests/engines/valuation/valuation.engine.test.ts (initial version with 5 tests)

Files Modified by IMP-006
docs/ADR/README.md — Added ADR-009 registration

Expected Behavior After IMP-006
npm install → successful

npm run build → successful

npm test → 10/10 tests pass

git diff --check → successful

ValuationEngine compiles but returns ERROR for all valid requests

No valuation calculations implemented

No fabricated values

Dependencies
ADR-009 (Valuation Engine)

Core Contracts (Frozen)

IMP-005 (Valuation Engine Specification)

Relation to IMP-007
IMP-007 extends IMP-006 by:

Adding approach data contracts

Extending ValuationRequest with data

Adding structural validation

Preserving all IMP-006 safety invariants

Adding tests that build on IMP-006's test infrastructure

Sequence Reconstruction
text
IMP-002 (Building Condition Separation)
    ↓
IMP-003 (Result Object Implementation)
    ↓
IMP-005 (Valuation Engine Specification)
    ↓
IMP-006 (Foundation Hardening)
    ↓
IMP-007 (Valuation Engine Data Contracts)
Note on Missing IMP-001 and IMP-004: These are architectural/specification documents:

IMP-001: Core Types Specification (architectural document, not implementation)

IMP-004: Core Contracts Implementation (architectural document, not implementation)