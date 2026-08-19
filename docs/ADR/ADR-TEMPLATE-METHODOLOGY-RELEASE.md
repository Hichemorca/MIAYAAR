# ADR-XXX — [Methodology Release Title]

> **Use this template for every new or amended MIAYAAR methodology release.** Copy it to `docs/ADR/ADR-XXX-<slug>.md`, allocate the next sequential ADR number, and update the ADR index. Do not overwrite a frozen methodology record or retroactively alter the meaning of a historical valuation.

**Status:** Proposed | Accepted | Superseded
**Date:** YYYY-MM-DD
**Decision category:** Methodology release
**Methodology identifier:** `MIAYAAR-METH-XXX`
**Proposed version:** `X.Y`
**Canonical implementation source:** `engines/valuation/<methodology-file>.ts`
**Compatibility declaration:** `<shared declaration or N/A>`
**Related issues / pull requests:** `<links>`

## Release Gate

This ADR must be proposed and reviewed **before** an implementation changes a methodology identifier, version, property taxonomy, method applicability, weight, factor, adjustment rule, evidence threshold, scenario, output contract, or the engine's canonical source. Changes to `core/types/`, `core/results/`, `core/contracts/`, or `engines/valuation/` require explicit owner approval before merge.

## Context

Describe the evidence-led problem, the affected property types and geographies, and why the existing frozen release cannot be reused. State whether the change is a new release, an amendment to a proposed release, or a supersession. Reference the governing contracts and any prior ADRs.

## Decision

State the adopted release and its version unambiguously. Identify the sole canonical runtime source, confirm that valuation resolution remains server-side, and state how unsupported or insufficient-evidence cases behave.

## Canonical Source and Version Alignment

| Item | Required declaration |
|---|---|
| Canonical source | Exact path and exported methodology identifier/version |
| Shared declaration | Location of any compatibility identifier/version declaration, or `N/A` |
| Integrity reference | Frozen configuration checksum or immutable configuration reference |
| Alignment test | Test path that proves the canonical source, registry, and public contract share the declared version |

## Calculation and Evidence Impact

Describe every changed or deliberately unchanged weight, factor, scenario, method, property taxonomy, evidence threshold, confidence rule, and comparable-selection rule. For each affected decision, cite the supporting local evidence. If evidence is unavailable, state the unavailable outcome; do not introduce a synthetic value or allocation.

| Affected element | Previous release | Proposed release | Evidence / rationale | Result when evidence is insufficient |
|---|---|---|---|---|
| `<element>` | `<value or N/A>` | `<value or N/A>` | `<source>` | `<unavailable / partial / rejected>` |

## Contract, API, and Audit Impact

Explain impacts on `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, public API DTOs, decision records, and stored valuation requests. Confirm that historic requests retain their recorded methodology version, checksum, inputs, and decision trail without reinterpretation.

## Validation Plan

List the required verification before acceptance: type check, full test suite, production build, whitespace check, focused version-alignment test, representative evidence-backed valuation path, and any migration verification. Include the expected result and the immutable artefact that records it.

## Consequences

State positive consequences, risks, operational follow-up, rollout constraints, and any temporary compatibility declarations that must later be removed through a separate approved ADR.

## Alternatives Considered

Record rejected alternatives and why each was incompatible with the evidence-led rule, canonical-source rule, or frozen-release policy.

## Owner Approval

| Approver | Decision | Date | Evidence |
|---|---|---|---|
| `<owner>` | Approve / Reject | `YYYY-MM-DD` | `<approval record>` |

## Implementation and Release Record

| Artefact | Reference |
|---|---|
| Implementation pull request | `<PR URL>` |
| Merge commit | `<commit SHA>` |
| CI run | `<workflow URL>` |
| Verification record | `<path>` |
| Supersedes / superseded by | `<ADR reference or N/A>` |
