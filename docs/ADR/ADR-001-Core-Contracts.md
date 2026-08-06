# ADR-001: Core Types as Canonical Immutable Domain Contracts

## Status

Accepted

## Date

2026-08-07

## Context

The platform requires a shared language for all engines to communicate. This language must be stable, immutable, and independent of any implementation details.

We needed to decide where to place the domain contracts and how they should be structured.

Two alternatives were considered:

1. Treat core/types as a collection of Data Transfer Objects (DTOs) used for serialization and API communication.
2. Treat core/types as runtime Domain Entities with behavior and business logic.

Neither approach aligned with the architectural principle that Core depends on nothing and everything else depends on Core.

## Decision

- `core/types` is **NOT** a collection of DTOs.
- `core/types` is **NOT** a collection of runtime Domain Entities.
- `core/types` defines the **canonical immutable contracts** used by every engine.
- Business logic does **NOT** belong inside `core/types`.
- All engines communicate through these contracts.

The decision to move Property, MarketSnapshot, Valuation, and Confidence to `core/domain` was **rejected**.

## Rationale

1. **Stability**: Contracts in Core must be stable. Moving them to a separate `domain` folder implied they were independent of the contract layer, which would have introduced ambiguity about their role.

2. **Simplicity**: Keeping all contracts in one location (`core/types`) reduces cognitive overhead. Developers know exactly where to find the canonical definitions.

3. **Explicit Contracts**: Placing all contracts in `core/types` reinforces that they are immutable, stable, and versioned agreements between modules.

4. **Architectural Clarity**: A separate `core/domain` would have suggested that domain models are separate from contracts, which they are not. In this architecture, the domain model **is** the contract.

5. **Reusability**: All modules reference `core/types`. There is no benefit to separating contracts from the types they define.

## Consequences

### Positive

- Clear, single location for all immutable contracts.
- Simplified dependency management.
- Reduced cognitive overhead for developers.
- Strong architectural enforcement of contract stability.

### Negative

- Some developers may initially expect Domain Entities to have behavior.
- Requires discipline to keep contracts free of business logic.

### Future Implications

- Any engine that needs to add a new contract must first document it and extend `core/types`.
- Contracts can evolve but must maintain backward compatibility.
- No engine can bypass these contracts.

## Alternatives Considered

### Alternative 1: core/types as DTOs

**Rejected because:**

DTOs are serialization artifacts. They change with API versions and do not represent stable domain concepts. The platform's engines need stable contracts, not versioned serialization formats.

### Alternative 2: core/domain for Domain Entities

**Rejected because:**

This would have split the contract layer into two locations: interfaces in `core/contracts` and entities in `core/domain`. This introduces unnecessary complexity. The canonical domain models **are** the contracts. They belong together.

### Alternative 3: No central contracts

**Rejected because:**

This would lead to duplication, inconsistency, and tight coupling between engines. Every engine would define its own types, making interoperability impossible.