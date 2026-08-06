# ADR-003: Entity Contracts vs Value Object Contracts

## Status

Accepted

## Date

2026-08-07

## Context

The domain model distinguishes between objects with identity and lifecycle (Entities) and objects that are defined solely by their attributes (Value Objects).

We needed to define this distinction explicitly and decide how to organize both categories within `core/types`.

## Decision

### Entity Contracts

**Examples:**
- `Property`
- `MarketSnapshot`
- `Valuation`
- `Confidence`

**Characteristics:**
- **Identity**: Each entity has a unique identifier (`id: ID`).
- **Lifecycle**: Entities are created, updated, and retired over time.
- **Metadata**: Entities include `Metadata`.
- **Persisted independently**: Entities are stored and retrieved by their identity.

### Value Object Contracts

**Examples:**
- `Location`
- `Coordinates`
- `Money`
- `Area`

**Characteristics:**
- **No independent lifecycle**: Value Objects exist only within the context of an Entity.
- **No Metadata**: Value Objects are not auditable independently.
- **No identity**: Value Objects are defined by their values, not by an identifier.
- **Always owned by an Entity Contract**: Value Objects are never persisted independently.

### Physical Organization

Both Entity Contracts and Value Object Contracts remain inside `core/types`.

No physical folder separation is introduced at this stage.

## Rationale

1. **Simplicity**: Keeping all contracts in `core/types` avoids the complexity of a separate `core/valueobjects` or `core/entities` folder.

2. **Explicit Contracts**: The distinction between Entity and Value Object is semantic, not physical. Separate folders would suggest a stronger separation than is warranted.

3. **Stability**: Both types of contracts are equally stable and immutable. Separating them physically provides no architectural benefit.

4. **Minimalism**: Introducing unnecessary folders violates the principle of simplicity. Directories should exist only when they serve an architectural role.

5. **Discoverability**: Developers know to look in `core/types` for any contract. Additional folders would fragment this discoverability.

## Consequences

### Positive

- Simplified directory structure.
- Clear semantic distinction documented, not imposed by folder structure.
- Easier discovery for developers.
- Reduced overhead for maintaining the directory structure.

### Negative

- Developers must read documentation to understand the distinction.
- No visual clue in the folder structure to indicate what is an Entity vs. Value Object.

### Future Implications

- If the distinction becomes problematic in the future, physical separation can be introduced as a new ADR.
- For now, the documentation serves as the source of truth.

## Alternatives Considered

### Alternative 1: Separate core/entities and core/valueobjects

**Rejected because:**

This would have created an unnecessary physical split. The semantic distinction is important but does not warrant separate directories. It would complicate imports and require additional mental overhead.

### Alternative 2: All contracts as Entities

**Rejected because:**

This would have ignored the fundamental distinction between objects with identity and objects without identity. Location and Money are clearly Value Objects, not Entities.

### Alternative 3: No distinction documented

**Rejected because:**

Without a documented distinction, developers would inconsistently apply metadata and identity to objects. This would lead to architectural drift and inconsistency.