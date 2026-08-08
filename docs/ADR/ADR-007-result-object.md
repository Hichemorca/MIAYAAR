# ADR-007: Standardized Result Object Contract

## Status

Accepted

## Date

2026-08-08

## Context

ARCHITECTURE.md §9 mandates that every engine MUST return the same standardized Result Object structure. This ensures consistent error handling, status reporting, and data encapsulation across all engines.

Currently, no concrete implementation or frozen contract exists for this structure. Core Types v1.0 is frozen, and the Result Object is not part of it. Engines cannot be implemented without a clear, immutable contract for their output.

The Result Object is a data contract, not a behavior contract. It defines what engines return, not how they operate.

## Decision

Create the Result Object as a standalone immutable contract in a new `core/results` module.

The Result Object structure is mandatory for all engines and follows the exact specification defined in ARCHITECTURE.md §9.

## Standard Result Object Structure

Every engine MUST return an object conforming to this structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | enum | Yes | Processing status of the engine |
| data | `TData` | Yes | Engine-specific output payload containing domain objects |
| warnings | `Warning[]` | Yes | Non-critical issues encountered during processing |
| errors | `ErrorInfo[]` | Yes | Critical failures preventing complete processing |
| metadata | `ResultMetadata` | Yes | Processing metadata (timing, version, requestId) |

### Status Semantics

| Status | Meaning |
|--------|---------|
| `success` | Engine completed normally with full output |
| `partial` | Engine completed with reduced output |
| `error` | Engine failed to complete processing |
| `pending` | Engine processing is in progress (async workflows) |

### Data Field

- Must contain the engine's domain-specific output.
- Must be typed using contracts from Core Types v1.0 where applicable.

### Warnings and Errors

- Must be arrays.
- May be empty.
- Errors indicate processing failure; warnings indicate non-critical issues.
- The exact internal structure of warnings and errors is an implementation detail to be defined in IMP-003.

### Metadata

- Must contain at minimum:
  - `requestId`: Correlation ID for the request.
  - `engine`: Engine identifier/name.
  - `version`: Engine version.
  - `timestamp`: Processing timestamp.

## Architectural Constraints

1. **Dependency Direction**: `core/results` may depend on `core/types` only. It must not depend on `core/contracts`, engines, platform, or any other module.

2. **Immutability**: The Result Object must be immutable by design. All properties must be `readonly`.

3. **No Business Logic**: The Result Object contract contains no business logic, validation, or transformation logic.

4. **Generic Data**: The `data` field must be generic (`TData`) to support diverse engine outputs.

## Relationship with Core Types v1.0

- Core Types v1.0 is frozen and must not be modified.
- The Result Object may import and use Core Types where appropriate (e.g., `ID`, `Timestamp`, `Metadata`).
- Status values are not part of Core Types; they belong to `core/results`.

## Relationship with Future Core Contracts

- `IEngine.execute()` will return `Result<TData>` when Core Contracts are implemented under ADR-008.
- Core Contracts will reference `core/results` as a dependency.
- The Result Object must be frozen before Core Contracts can be implemented.

## Consequences

### Positive

- Consistent output structure across all engines.
- Clear separation between domain data and engine metadata.
- Standardized error handling.
- Improved interoperability and orchestration.

### Negative

- All engines must adapt to the Result Object contract.
- Slight increase in implementation complexity for engine developers.

### Future Implications

- The `data` field may contain any Core Types contract.
- Future engines must return the Result Object to be integrated into the Orchestrator.

## Rejected Alternatives

### Result Object as part of Core Types

**Rejected because:**

Core Types v1.0 is frozen. Modifying it to include the Result Object would violate the freeze policy and introduce engine-specific concerns into the foundational type layer. The Result Object is a contract for engine outputs, not a fundamental domain concept.

### No standardized Result Object

**Rejected because:**

ARCHITECTURE.md §9 explicitly requires a standardized Result Object. Without it, engines would return inconsistent structures, making orchestration impossible.

### Result Object as part of Core Contracts

**Rejected because:**

Core Contracts define behavior interfaces. The Result Object is a data contract. Mixing them would violate separation of concerns and create circular dependencies.