# Architecture Decision Records (ADR)

## Purpose

Architecture Decision Records document the architectural decisions that shape the MIAYAAR Decision Intelligence Platform.

Every significant architectural decision is recorded as an ADR. These records serve as the permanent historical memory of the project.

## ADR Numbering Convention

ADRs are numbered sequentially: `ADR-001`, `ADR-002`, `ADR-003`, etc.

Each ADR title describes the decision, not the problem.

## When to Write an ADR

Every architectural decision must be documented **before** implementation.

Examples of decisions that require an ADR:

- Choosing between architectural alternatives.
- Defining a new contract or type category.
- Changing existing contracts.
- Introducing new directories or modules.
- Establishing patterns and conventions.
- Rejecting significant alternatives.

## ADR Lifecycle

1. **Proposed**: The decision is identified and documented.
2. **Accepted**: The decision is approved and becomes part of the architecture.
3. **Superseded**: The decision is replaced by a later ADR.

## ADR Format

Every ADR follows this exact structure:
Title
Status
(Proposed | Accepted | Superseded)

Date
(YYYY-MM-DD)

Context
Explain the architectural problem.

Decision
Describe the adopted architectural decision.

Rationale
Explain WHY this decision was taken.

Consequences
Positive consequences.
Negative consequences.
Future implications.

Alternatives Considered
Document the rejected alternatives.


## Why ADRs Are Mandatory

- **Historical Record**: Future developers understand why decisions were made.
- **Traceability**: Every architectural choice is documented and justified.
- **Consistency**: New decisions align with established principles.
- **Onboarding**: New team members understand the architecture quickly.
- **Accountability**: Decisions are transparent and reviewable.

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| ADR-001 | Core Types as Canonical Immutable Domain Contracts | Accepted | 2026-08-07 |
| ADR-002 | Platform Audit Metadata | Accepted | 2026-08-07 |
| ADR-003 | Entity Contracts vs Value Object Contracts | Accepted | 2026-08-07 |
| ADR-004 | Canonical Contracts are Immutable by Design | Accepted | 2026-08-07 |
| ADR-005 | Business Vocabulary Rule | Accepted | 2026-08-07 |

---

**This directory is the permanent historical memory of the MIAYAAR platform.**