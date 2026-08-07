# ADR-005: Business Vocabulary Rule

## Status

Accepted

## Date

2026-08-07

## Context

The platform defines a shared canonical business language. This language must be consistent across all engines to ensure interoperability and correctness.

We needed to decide how to represent business terms consistently across the platform.

## Decision

Every **Closed Business Vocabulary** must be represented by **Enums**.

Every **Open Human Input** must remain **String**.

### Examples of Closed Vocabulary (Enums)

- `PropertyType`
- `TransactionType`
- `FinishQuality`
- `ViewType`
- `StreetPosition`
- `ConfidenceLevel`

### Examples of Open Human Input (String)

- Names
- Notes
- Descriptions
- Street names
- Developer names

## Rationale

1. **Consistency**: Shared vocabulary guarantees that every engine interprets terms identically. A `PropertyType` of `"APARTMENT"` means the same thing everywhere.

2. **Compile-Time Safety**: Enums are checked at compile time. Typos and invalid values are caught before runtime.

3. **Interoperability**: Engines can communicate without ambiguity. There is no need to normalize or validate strings between engines.

4. **Refactoring**: Changing a vocabulary term requires updating a single enum definition, not every string comparison across the codebase.

5. **Documentation**: Enums are self-documenting. Developers can see the full set of valid values without searching the codebase.

6. **Open Human Input**: Strings are appropriate for human-generated text that cannot be enumerated. Names, descriptions, and notes are inherently open.

## Consequences

### Positive

- Consistent business language across all engines.
- Compile-time validation and safety.
- Simplified refactoring and maintenance.
- Clear distinction between closed and open terms.

### Negative

- Enum values must be maintained and versioned.
- Adding a new value requires updating all engines that use the enum.
- Some business terms may evolve from closed to open over time.

### Future Implications

- New closed vocabulary terms must be added to `core/types/enums.ts`.
- No engine may define its own closed vocabulary.
- Open human input may be validated but not enumerated.

## Alternatives Considered

### Using free strings everywhere

**Rejected because:**

Free strings introduce inconsistency. One engine may use `"APARTMENT"` while another uses `"Apartment"` or `"APT"`. This leads to bugs, runtime errors, and interoperability problems. Enums enforce a single source of truth.