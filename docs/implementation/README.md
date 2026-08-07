# Implementation Layer

## Purpose

This document explains the relationship between architecture, decisions, and implementation in the MIAYAAR platform.

## The Three Layers

### Architecture

- Defines the system vision.
- Establishes the foundational principles.
- Documents the high-level structure.
- Source: `ARCHITECTURE.md`

### ADR (Architecture Decision Record)

- Answers **WHY** a decision was made.
- Documents the context and rationale.
- Records alternatives considered.
- Source: `docs/ADR/`

### Implementation Backlog

- Answers **WHAT** must be built.
- Converts ADRs into actionable tasks.
- Defines scope and priorities.
- Source: `docs/implementation/*-backlog.md`

### Implementation

- Answers **HOW** the task is executed.
- Source code and documentation.
- Source: Respective directories (`core/`, `engines/`, etc.)

---

## Relationship
Architecture
↓
ADR (WHY)
↓
Implementation Backlog (WHAT)
↓
Implementation (HOW)

---

## Key Rules

1. **ADR answers WHY**. It documents the decision and its rationale.

2. **Implementation Backlog answers WHAT**. It defines the tasks to be executed.

3. **Implementation answers HOW**. It executes the defined tasks.

4. **Implementation must never infer architectural changes.**

5. **Only Architecture Board decisions may modify architecture.**

6. **ADRs are immutable once accepted.** They may only be superseded by new ADRs.

---

## Implementation Backlog

The implementation backlog is the **ONLY** implementation authority.

DeepSeek must implement only the tasks listed in the backlog.

It must not infer additional architectural changes.

---

## Freeze Criteria

A module is considered complete when:

1. All backlog tasks are implemented.
2. Documentation is updated.
3. ADRs are respected.
4. Architecture Board approves the freeze.

---

## Documentation

Implementation-related documents reside in `docs/implementation/`.

Backlogs for each module or freeze are stored here.