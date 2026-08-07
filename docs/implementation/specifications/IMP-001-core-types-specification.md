# IMP-001 – Core Types Specification

## 1. Purpose

This specification defines the implementation requirements for Core Types, the foundational layer of the MIAYAAR Decision Intelligence Platform.

Core Types provides the canonical immutable contracts that establish the platform's shared business language. Every engine, service, and product depends on these contracts.

The objective of IMP-001 is to implement Core Types exactly as defined by the approved architecture, without deviation or reinterpretation.

---

## 2. Scope

### Included

- All TypeScript files listed in Section 4.
- Canonical immutable contracts for domain entities.
- Shared value objects.
- Enumerations for closed business vocabulary.
- Primitive shared types.
- Technical metadata contracts.
- Type-safe financial representations.
- Barrel file for unified imports.

### Not Included

- Business logic of any kind.
- Validation logic.
- Helper functions.
- Utility methods.
- Database models.
- API DTOs.
- Engine-specific types.
- Product-specific types.
- Platform service types.
- Runtime behavior.

---

## 3. Reference Documents

| Document | Purpose |
|----------|---------|
| `docs/ARCHITECTURE.md` | Defines the system architecture and layer responsibilities |
| `docs/PROJECT-STRUCTURE.md` | Defines repository organization and directory responsibilities |
| `docs/VALUATION-METHODOLOGY.md` | Defines valuation business concepts that types must represent |
| `docs/governance/ENGINEERING-WORKFLOW.md` | Defines the implementation and review process |
| `docs/ADR/ADR-001-Core-Contracts.md` | Core Types as canonical immutable domain contracts |
| `docs/ADR/ADR-002-Platform-Metadata.md` | Platform audit metadata requirements |
| `docs/ADR/ADR-003-Entity-vs-ValueObject.md` | Distinction between Entities and Value Objects |
| `docs/ADR/ADR-004-Immutable-Contracts.md` | Immutability enforced by the type system |
| `docs/ADR/ADR-005-Business-Vocabulary.md` | Closed vocabulary as enums, open input as strings |
| `docs/ADR/ADR-006-building-condition-separation.md` | Separation of Property and Building Condition |
| `docs/implementation/core-types-backlog.md` | Implementation tasks and priorities |

---

## 4. Files in Scope

| File Path | Purpose |
|-----------|---------|
| `core/types/index.ts` | Barrel file for all Core Types exports |
| `core/types/primitives.ts` | Primitive shared types (ID, Timestamp, etc.) |
| `core/types/enums.ts` | Closed business vocabulary enumerations |
| `core/types/location.ts` | Location, Coordinates, Address, and related types |
| `core/types/metadata.ts` | Metadata, AuditInfo, VersionInfo, and related types |
| `core/types/financial.ts` | Money, Currency, ExchangeRate, and related types |
| `core/types/property.ts` | Property domain entity |
| `core/types/market.ts` | MarketSnapshot and related market types |
| `core/types/valuation.ts` | Valuation domain entity |
| `core/types/confidence.ts` | Confidence domain entity |

---

## 5. Files that MUST NOT be Modified

The following files are outside the scope of IMP-001 and must not be modified:

- `core/README.md`
- Any file outside `core/types/`
- Any file in `engines/`
- Any file in `platform/`
- Any file in `products/`
- Any file in `api/`
- Any file in `shared/`
- Any file in `config/`

---

## 6. Dependency Rules

### Allowed Dependencies

| Source | May Depend On |
|--------|---------------|
| `core/types/*.ts` | Nothing outside the TypeScript standard library |
| `core/types/index.ts` | All other files in `core/types/` |

### Forbidden Dependencies

- No dependency on `core/` or any other module.
- No import from `engines/`, `platform/`, `products/`, `api/`, `shared/`, or `config/`.
- No external libraries except TypeScript standard library types.
- No runtime dependencies.

**Core Types must remain completely isolated.**

---

## 7. Coding Rules

### Structural Rules

- Every TypeScript file must contain a professional header comment describing its responsibility.
- Interfaces must be used for all contracts.
- No classes unless explicitly required for immutability.
- No functions.
- No constants except enumerations.

### Immutability

- All properties must be `readonly`.
- Use `Readonly<T>` for nested immutability where appropriate.
- No mutable patterns permitted.

### Enums

- All closed business vocabulary must be enums.
- Use string enums with `UPPER_SNAKE_CASE` values.
- No numeric enums.

### No Business Logic

- No calculations.
- No validation.
- No transformations.
- No behavior.
- No business logic of any kind.

---

## 8. Acceptance Criteria

### Structural

- All files listed in Section 4 exist.
- All files follow the prescribed structure.
- `core/types/index.ts` re-exports every module.
- No file outside `core/types/` is modified.

### Semantic

- All contracts are immutable.
- Closed vocabulary is represented by enums.
- Metadata is present on all Entity Contracts.
- Location supports optional coordinates.
- Financial types include both amount and currency.
- Property has distinct `propertyCondition` and `buildingCondition` fields.

### Dependency

- No imports outside TypeScript standard library.
- No external dependencies.
- No circular imports exist anywhere inside `core/types`.

### Documentation

- Every file has a professional header.
- Every interface has a concise description.
- Documentation aligns with ADRs.

---

## 9. Review Checklist

### Architecture Compliance

- [ ] All contracts are immutable.
- [ ] No business logic exists.
- [ ] Metadata is applied to all Entities.
- [ ] Property Condition and Building Condition are separated.
- [ ] Closed vocabulary uses enums.
- [ ] Open input remains string.

### Structural Integrity

- [ ] All required files exist.
- [ ] Barrel file exports all modules.
- [ ] No file outside `core/types/` is modified.
- [ ] No external dependencies.

### Type Safety

- [ ] All properties are correctly typed.
- [ ] No use of `any`.
- [ ] Strict TypeScript rules are followed.

### Documentation Quality

- [ ] Headers are professional and complete.
- [ ] Interfaces are documented.
- [ ] ADRs are reflected in the code.

### ADR Alignment

- [ ] ADR-001: Canonical immutable contracts
- [ ] ADR-002: Metadata applied
- [ ] ADR-003: Entity vs Value Object distinction
- [ ] ADR-004: Type-system enforced immutability
- [ ] ADR-005: Enums for closed vocabulary
- [ ] ADR-006: Separated property and building condition

---

## 10. Definition of Done

IMP-001 is considered complete when:

1. All files listed in Section 4 are created.
2. All Acceptance Criteria are met.
3. Claude's Review Checklist passes.
4. Architecture Board approves the freeze.
5. No modifications to files outside the specified scope.

**Once frozen, Core Types cannot be modified without a new ADR and Architecture Board approval.**