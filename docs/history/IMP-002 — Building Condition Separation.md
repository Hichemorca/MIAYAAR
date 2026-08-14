IMP-002 — Building Condition Separation
Title
IMP-002: Building Condition Separation

Objective
Separate Building Condition from Property Condition in the core domain model, as required by ADR-006 and VALUATION-METHODOLOGY.md §6.2.

Scope
Create BuildingCondition enum in core/types/enums.ts

Remove building condition from PropertyCondition if combined

Update Property entity to include both propertyCondition and buildingCondition fields

Requirements
BuildingCondition enum must exist with values: EXCELLENT, WELL_MAINTAINED, FAIR, OLD_NEEDS_RENOVATION

Property must have separate propertyCondition and buildingCondition fields

Both enums must be documented

No business logic

No validation logic

Pure type definitions only

Constraints
Do NOT modify existing ADRs

Do NOT modify VALUATION-METHODOLOGY.md

Do NOT implement business logic

Do NOT add helper functions

Keep changes minimal and focused

Acceptance Criteria
BuildingCondition enum exists in core/types/enums.ts

Property interface has propertyCondition: PropertyCondition and buildingCondition: BuildingCondition

All fields are readonly

Documentation exists for all exports

TypeScript compilation passes

No breaking changes to existing contracts

Files Affected
core/types/enums.ts — MODIFY (add BuildingCondition)

core/types/property.ts — MODIFY (add buildingCondition field)

Tests Required
TypeScript compilation check

Structural validation of enums

Property interface includes both fields

Execution/Validation Commands
powershell
npx tsc --noEmit
Dependencies
ADR-006 (Separation of Property Condition and Building Condition)