# ADR-002: Platform Audit Metadata

## Status

Accepted

## Date

2026-08-07

## Context

The platform requires auditability, traceability, and provenance across all business entities. Every decision, valuation, and data point must be attributable to its source and timestamp.

We needed to decide how to implement metadata consistently across the platform without duplicating logic or creating fragmentation.

## Decision

- Metadata represents **platform-wide audit information**.
- Metadata is **mandatory** for every Entity Contract.
- Metadata is **not attached** to Value Objects.
- Metadata provides:
  - **Traceability**: Every entity knows its origin and history.
  - **Provenance**: Data lineage is preserved.
  - **Versioning**: Changes are tracked.
  - **Auditability**: Compliance requirements are satisfied.

The `core/types/metadata.ts` file defines the canonical Metadata contract.

## Rationale

1. **Audit Compliance**: The real estate industry requires audit trails for valuation decisions. Metadata ensures every valuation can be traced back to its source data.

2. **Debugging and Support**: When issues arise, metadata provides the context needed to understand why a decision was made.

3. **Provenance**: The platform ingests data from multiple sources. Metadata preserves the origin and quality of every data point.

4. **Separation of Concerns**: Metadata is technical, not business. It does not influence valuation logic but provides the context for interpreting results.

5. **Reusability**: A single Metadata contract used across all entities avoids duplication and ensures consistency.

## Consequences

### Positive

- Consistent auditability across the platform.
- Simplified debugging and support.
- Traceability for compliance and regulatory purposes.
- Clear separation between business data and technical metadata.

### Negative

- Additional complexity in entity definitions.
- Slight increase in storage and serialization size.
- Requires discipline to always include metadata.

### Future Implications

- Metadata may be extended with additional fields over time.
- No entity can be persisted without metadata.
- Auditing tools can consume the same metadata structure.

## Alternatives Considered

### Alternative 1: Metadata only in Persistence Layer

**Rejected because:**

This would have hidden metadata from the business logic. Engines would not have access to data provenance, making quality assessment and debugging impossible at the domain level.

### Alternative 2: No Standardized Metadata

**Rejected because:**

This leads to fragmentation. Every team would define their own metadata structure, making cross-engine correlation impossible.

### Alternative 3: Metadata attached to Value Objects

**Rejected because:**

Value Objects have no independent lifecycle. They are owned by Entity Contracts. Attaching metadata to them would imply they have an existence separate from their owners, which they do not.