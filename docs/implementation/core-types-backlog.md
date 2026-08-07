# Core Types Implementation Backlog

**Version:** 1.0

**Status:** Pending

**Target Freeze:** Core Types Module

---

## Purpose

This document converts approved ADRs into implementation tasks for the Core Types module.

This document is the **ONLY** implementation authority for Core Types Freeze.

DeepSeek must implement only the tasks listed here.

It must not infer additional architectural changes.

---

## Task Table

| ID | Title | ADR | Priority | Status |
|----|-------|-----|----------|--------|
| IMP-001 | Platform Metadata | ADR-002 | Critical | Pending |
| IMP-002 | Building Condition | ADR-003 | Critical | Pending |
| IMP-003 | Business Vocabulary | ADR-005 | Critical | Pending |
| IMP-004 | Immutable Contracts | ADR-004 | Critical | Pending |
| IMP-005 | Documentation Cleanup | - | Low | Pending |
| IMP-006 | Primitive Cleanup | - | Low | Pending |

---

## Task Details

### IMP-001: Platform Metadata

**ADR:** ADR-002

**Priority:** Critical

**Status:** Pending

**Description:**

Replace local audit fields in `Valuation` and `Confidence` with the shared `Metadata` model from `core/types/metadata.ts`.

**Scope:**

- Verify `Valuation` uses `Metadata`.
- Verify `Confidence` uses `Metadata`.
- Ensure `Property` uses `Metadata`.
- Remove any local audit fields.

**Acceptance Criteria:**

- All entities reference `core/types/metadata.ts`.
- No local audit fields remain.
- Metadata is mandatory for every Entity Contract.

---

### IMP-002: Building Condition

**ADR:** ADR-003

**Priority:** Critical

**Status:** Pending

**Description:**

Separate `Building Condition` from `Property Condition`.

Introduce `BuildingCondition` enum in `core/types/enums.ts`.

**Scope:**

- Create `BuildingCondition` enum.
- Remove building condition from `PropertyCondition` if combined.
- Update `Property` entity to include both.

**Acceptance Criteria:**

- `BuildingCondition` enum exists.
- Property has separate condition fields.
- Both enums are documented.

---

### IMP-003: Business Vocabulary

**ADR:** ADR-005

**Priority:** Critical

**Status:** Pending

**Description:**

Convert all Closed Business Vocabulary into enums.

Human input remains string.

**Scope:**

- Identify all closed vocabulary in `core/types/`.
- Ensure every closed term is an enum.
- Remove string-based closed vocabulary.

**Acceptance Criteria:**

- All closed vocabulary terms are enums.
- Human input fields remain string.
- No mixed types.

---

### IMP-004: Immutable Contracts

**ADR:** ADR-004

**Priority:** Critical

**Status:** Pending

**Description:**

Canonical Contracts inside `core/types` become immutable by design.

Apply `readonly` where appropriate.

**Scope:**

- Review all interfaces in `core/types/`.
- Apply `readonly` to properties.
- Apply `Readonly<T>` where appropriate.

**Acceptance Criteria:**

- All contracts are immutable.
- Type system enforces immutability.
- No mutable patterns remain.

---

### IMP-005: Documentation Cleanup

**Priority:** Low

**Status:** Pending

**Description:**

Remove duplicated headers.

Remove obsolete scaffold comments.

**Scope:**

- Review all `core/types/*.ts` files.
- Remove redundant comments.
- Standardize header format.

**Acceptance Criteria:**

- Consistent documentation.
- No outdated comments.
- Clear module descriptions.

---

### IMP-006: Primitive Cleanup

**Priority:** Low

**Status:** Pending

**Description:**

Remove `Optional<T>`.

Keep `Nullable<T>`.

Remove unused imports.

**Scope:**

- Review `core/types/primitives.ts`.
- Remove `Optional<T>` if redundant.
- Clean up imports across `core/types/`.

**Acceptance Criteria:**

- Clean primitive types.
- No unused imports.
- Consistent type utilities.

---

## Completion Criteria

Core Types Freeze Review may begin only when:

- ✓ All Critical tasks completed
- ✓ Documentation updated
- ✓ ADRs respected
- ✓ Architecture Board approves

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-07 | Architecture Board | Initial release |