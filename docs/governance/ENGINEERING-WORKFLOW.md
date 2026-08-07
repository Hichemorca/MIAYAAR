# MIAYAAR Engineering Workflow

## Purpose

This document defines the official development lifecycle for the MIAYAAR Decision Intelligence Platform.

The workflow ensures that every architectural decision is documented, reviewed, and approved before implementation begins. Quality, maintainability, and architectural integrity are prioritized over speed.

## Workflow Overview
Research
↓
Architecture Discussion
↓
Architecture Decision (ADR)
↓
Implementation Backlog
↓
Implementation (DeepSeek)
↓
Independent Review (Claude)
↓
Architecture Validation (Architecture Board)
↓
Corrections
↓
Freeze
↓
Next Module

---

## Phase Details

### 1. Research

**Purpose**: Investigate the problem domain, identify requirements, and explore potential solutions.

**Responsible Party**: Architecture Board / Engineering Team

**Expected Outputs**:
- Problem statement
- Domain analysis
- Technical feasibility assessment
- Initial solution options

---

### 2. Architecture Discussion

**Purpose**: Evaluate alternatives and refine the architectural approach.

**Responsible Party**: Architecture Board

**Expected Outputs**:
- Documented discussion
- Considered alternatives
- Preliminary decision direction

---

### 3. Architecture Decision (ADR)

**Purpose**: Formally document the approved architectural decision.

**Responsible Party**: Architecture Board

**Expected Outputs**:
- ADR document following the standard template
- Clear rationale and consequences
- Alternatives considered and rejected

**Rule**: Every architectural decision must be documented as an ADR **before** implementation begins.

---

### 4. Implementation Backlog

**Purpose**: Convert ADRs into actionable implementation tasks.

**Responsible Party**: Architecture Board

**Expected Outputs**:
- Prioritized task list
- Clear scope for each task
- Completion criteria

---

### 5. Implementation (DeepSeek)

**Purpose**: Execute the implementation tasks as defined in the backlog.

**Responsible Party**: DeepSeek

**Rules**:
- Implement only what is in the backlog.
- Never redesign architecture.
- Never change ADRs.
- Never infer architectural changes.

**Expected Outputs**:
- Source code
- Updated documentation
- Test coverage (where applicable)

---

### 6. Independent Review (Claude)

**Purpose**: Perform an independent review of the implementation.

**Responsible Party**: Claude

**Rules**:
- May detect issues.
- Never makes architectural decisions.
- Provides objective feedback.

**Expected Outputs**:
- Review findings
- Issues identified
- Recommendations

---

### 7. Architecture Validation

**Purpose**: Validate that the implementation respects the architecture.

**Responsible Party**: Architecture Board

**Expected Outputs**:
- Validation decision (approved / requires changes)
- Change requests if required

---

### 8. Corrections

**Purpose**: Apply any required changes identified during review or validation.

**Responsible Party**: DeepSeek (implementation) / Architecture Board (direction)

**Expected Outputs**:
- Corrected implementation
- Updated documentation

---

### 9. Freeze

**Purpose**: Declare the module complete and stable.

**Responsible Party**: Architecture Board

**Expected Outputs**:
- Freeze approval
- Module considered immutable
- Ready for next module

**Rule**: A module is frozen only when approved by the Architecture Board.

---

### 10. Next Module

**Purpose**: Begin the workflow for the next module.

**Responsible Party**: All participants

---

## Participant Responsibilities

### Architecture Board

- Owns the architecture.
- Makes all architectural decisions.
- Approves ADRs.
- Approves freezes.
- Final authority on all architectural matters.

### DeepSeek

- Implements approved backlog tasks.
- Never redesigns architecture.
- Never changes ADRs.
- Never infers architectural changes.
- Focuses on implementation quality.

### Claude

- Performs independent reviews.
- May detect issues and inconsistencies.
- Never makes architectural decisions.
- Provides objective, technical feedback.

---

## Core Principle

**Architecture decisions belong only to the Architecture Board.**

No implementation, review, or tool may override this authority.