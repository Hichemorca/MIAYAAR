# MIAYAAR — Core Types Freeze Architecture Acceptance

**Date:** 2026-08-20

**Decision authority:** Project owner

**Decision:** APPROVED — Core Types Freeze is closed

**Baseline:** `main` after the merge of PR #44 at `3d18f01`

**Scope:** Architecture acceptance only; no Core Types, valuation, API, UI, or Market Intelligence change.

## Decision

The project owner approved this architecture acceptance review. The review finds that every Critical implementation item in the Core Types backlog is satisfied by the current `main` baseline and the associated acceptance records. **Core Types Freeze is therefore closed and the canonical `core/types` module is frozen.** [1] [2]

This acceptance does not claim that every future business concept already has a closed vocabulary. The owner-approved IMP-003 closure retains `PropertyClassification.status` and the designated valuation representations without enums because policy does not define finite approved value sets for them. This is a governed representation decision, not a failed Core Types implementation. [3]

## Acceptance evidence

- **IMP-001 — Platform Metadata:** ADR-002 and the IMP-001 acceptance record show that `Property`, `Valuation`, and `Confidence` use the canonical metadata model. Technical creation time is represented only by `metadata.timestamps.createdAt`, while `valuationDate` and `assessedAt` remain domain facts. **Accepted.** [4]

- **IMP-002 — Building Condition:** `BuildingCondition` is centrally represented and `Property` separates `propertyCondition` from `buildingCondition`, as required by ADR-006. **Accepted.** [5] [6]

- **IMP-003 — Business Vocabulary:** The implementation inventory and owner closure show that existing approved closed sets are central in `core/types/enums.ts`. Source-native, open, technical, market-availability, and non-closed representations remain unchanged. No invented enum value or fallback was introduced. **Accepted.** [3] [7]

- **IMP-004 — Immutable Contracts:** The canonical contracts apply `readonly` design constraints, and the evidence review found no acceptance blocker in the frozen Core Types surface. **Accepted.** [8] [9]

## Acceptance constraints

The freeze protects canonical boundaries only. It does not alter valuation outputs, methodology v1.2, weights, coefficients, comparable-selection rules, confidence semantics, API behaviour, UI behaviour, Market Intelligence, or evidence-source policy. No such change was included in this review. [2]

Future changes to `core/types`, `core/results`, `core/contracts`, or their governing interfaces require an owner-approved independent scope, any required ADR or policy decision, tests, and a new architecture acceptance review. The freeze does not prohibit governed change; it prevents unreviewed drift.

## Verification record

The change set that closed IMP-003 was verified before merge with `pnpm check`, `pnpm test` (28 files and 92 tests), `pnpm build`, `pnpm format:check`, and `git diff --check`. GitHub CI and the Netlify Deploy Preview were successful for PR #44. This acceptance record is documentation-only and adds no runtime behaviour. [3] [10]

## Final status

- **IMP-001:** Implemented.
- **IMP-002:** Implemented.
- **IMP-003:** Implemented with no additional approved conversions.
- **IMP-004:** Implemented.
- **Core Types Freeze:** **CLOSED — architecture accepted.**

## References

[1]: ../implementation/core-types-backlog.md "Core Types Implementation Backlog"
[2]: CORE-TYPES-STATUS-RECONCILIATION-2026-08-20.md "Core Types Status Reconciliation"
[3]: IMP-003-IMPLEMENTATION-ACCEPTANCE-2026-08-20.md "IMP-003 Implementation Acceptance"
[4]: IMP-001-IMPLEMENTATION-ACCEPTANCE-2026-08-20.md "IMP-001 Implementation Acceptance"
[5]: ../ADR/ADR-006-building-condition-separation.md "ADR-006 — Building Condition Separation"
[6]: ../../core/types/property.ts "Canonical Property Contract"
[7]: IMP-003-IMPLEMENTATION-INVENTORY-2026-08-20.md "IMP-003 Implementation Inventory"
[8]: ../ADR/ADR-004-Immutable-Contracts.md "ADR-004 — Immutable Contracts"
[9]: ../../core/types/enums.ts "Central Enum Catalogue"
[10]: https://github.com/Hichemorca/MIAYAAR/pull/44 "PR #44 — IMP-003 closure"
