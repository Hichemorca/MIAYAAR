# ADR-004: Canonical Contracts are Immutable by Design

## Status

Accepted

## Date

2026-08-07

## Context

MIAYAAR is a Decision Intelligence Platform. Canonical Contracts represent official immutable business facts. Business processing occurs inside the Engines. Once a Canonical Contract is emitted from an Engine into `core/types`, it becomes immutable.

We needed to decide how immutability would be enforced and whether mutable patterns would be permitted anywhere in the system.

## Decision

All Canonical Contracts inside `core/types` must be **immutable by design**.

Immutability must be enforced by the **type system** rather than by developer convention.

Business Engines **may** use mutable internal objects during processing.

Only the final emitted Canonical Contract is immutable.

## Rationale

1. **Auditability**: Immutable contracts preserve the exact state at the time of creation. Every audit trail begins with an immutable record.

2. **Traceability**: When contracts cannot change, the lineage of data is clear. Any transformation requires creating a new contract, making the history explicit.

3. **Financial Correctness**: Financial decisions must be based on fixed data. A changing valuation would undermine trust in the platform.

4. **Banking-Grade Consistency**: Financial systems require immutability for compliance and correctness. Mutable contracts would introduce risks unacceptable in a financial context.

5. **Versioning**: Immutable contracts simplify versioning. Each version is a distinct, immutable snapshot. There is no ambiguity about which version is being referenced.

6. **Snapshot Integrity**: Valuations, market snapshots, and confidence assessments must be frozen at the moment of creation. Any mutation would invalidate the snapshot's integrity.

## Consequences

### Positive

- Guaranteed data integrity.
- Simplified debugging and support.
- Clear audit trails.
- Compliance with financial industry standards.
- Predictable behavior across all engines.

### Negative

- Additional developer discipline required.
- Slightly higher memory usage due to immutability.
- More complex updates (must create new instances).

### Future Implications

- Engines must emit new contracts for every update.
- No contract may be modified after creation.
- The type system will enforce immutability through `readonly` and `Readonly<T>` patterns where appropriate.

## Alternatives Considered

### Immutable by convention only

**Rejected because:**

Conventions are not enforced. Developers may accidentally mutate contracts, leading to subtle bugs. The type system must enforce immutability to guarantee correctness. Relying on documentation or developer discipline is insufficient for a financial platform.