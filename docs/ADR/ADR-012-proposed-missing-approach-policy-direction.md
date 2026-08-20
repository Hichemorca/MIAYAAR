# ADR-012 — Proposed Direction for Missing-Approach Weight Normalization

**Status:** Proposed  
**Date:** 2026-08-20  
**Decision category:** Methodology release proposal  
**Methodology identifier:** `MIAYAAR-METH-001`  
**Proposed version:** Not allocated; no new methodology release is created by this ADR.  
**Canonical implementation source:** `engines/valuation/methodology-v1_2.ts` remains unchanged.  
**Compatibility declaration:** N/A — no contract or runtime version changes are proposed.  
**Related issues / pull requests:** [PR #25](https://github.com/Hichemorca/MIAYAAR/pull/25)

## Release Gate

This ADR records the owner-selected **policy direction** for a possible future methodology release. It is not an acceptance of `CALC-013`, an approval of the current normalization formula, or authorization to modify `core/types/`, `core/results/`, `core/contracts/`, `engines/valuation/`, contracts, weights, or public outputs.

The owner selected direction **A** after the CALC-013 policy gate: prepare a proposed release path that may define active-approach weight normalization when a positive-weight approach is unavailable. The remaining evidence, applicability, data-insufficiency, and verification gates in this ADR must be satisfied and explicitly approved before any implementation.[1]

## Context

`MIAYAAR-METH-001` v1.2 is the frozen canonical methodology. Its configuration defines complete scenario weights, while the live engine currently normalizes the weights of only those approaches that returned usable outputs. The engine labels that behavior `PROVISIONAL` under `CALC-013`; it does not establish that the behavior is methodologically approved.[1] [2]

Missing approaches are an expected data condition in the current server-side flow. Eligible DLD transactions supply sales-comparison evidence, whereas income capitalization requires supplied annual rent, cost requires replacement-cost and depreciation inputs, and DCF requires independently available NOI. The available DLD record cannot by itself validate whether reweighting missing approaches produces a more appropriate result than rejection.[1] [3]

ADR-011 prohibits reinterpreting historical valuations by altering the frozen v1.2 numeric configuration. Consequently, a material missing-approach policy, if ever accepted, must be released as a new methodology version with an independent ADR rather than retrofitted into v1.2.[2]

## Decision

The project will pursue **direction A** only: it may prepare a future methodology-release candidate that defines an evidence-led policy for normalizing active approach weights when one or more positive-weight approaches are unavailable.

No policy formula, applicability matrix, acceptance threshold, coefficient, fallback rule, or new methodology version is adopted here. The existing `CALC-013` runtime behavior remains provisional and unchanged. Until a later ADR is accepted and implemented, the engine must continue its current disclosed behavior, and historical valuation records must retain their recorded v1.2 metadata and decision trail.

## Canonical Source and Version Alignment

The canonical source remains `engines/valuation/methodology-v1_2.ts`, `MIAYAAR-METH-001` v1.2, with no change. The existing compatibility declaration remains applicable and unchanged. The frozen v1.2 configuration reference remains the governing immutable reference, and this ADR introduces no replacement checksum.

The existing methodology-version alignment coverage remains applicable. Any future release candidate must add an explicit alignment test for its own identifier, version, and configuration reference.

## Calculation and Evidence Impact

The sole prospective subject is policy handling of a **missing positive-weight approach**. This ADR deliberately leaves the following decisions unfilled because the policy gate did not find approved evidence for them: which approach combinations are eligible, when a result is rejected instead of partial, and whether normalization is permitted for every property type and scenario.[1]

**Scenario weights.** Frozen v1.2 weights remain unchanged. ADR-011 freezes the current numeric configuration, so this ADR introduces no allocation.[2]

**`CALC-013` active-weight normalization.** The runtime behavior remains explicitly provisional. This is a future-release direction only, not an accepted calculation. The policy gate documents the observed behavior and absence of approval evidence; no new fallback is inferred.[1]

**Method applicability matrix.** No missing-approach combination becomes approved. A later release candidate must specify the matrix because DLD does not independently provide all missing-method inputs.[1] [3]

**Result disposition.** The current engine may emit `partial`; this ADR introduces no new acceptance rule. The result contract defines `partial` as reduced output rather than methodology approval, and the current disclosure remains unchanged.[4]

**Comparable selection and evidence thresholds.** They remain frozen/current behavior and are outside the scope of CALC-013.

## Contract, API, and Audit Impact

There is no impact on domain contracts, result contracts, API DTOs, decision-record shape, stored valuation requests, database schema, or public endpoints. This proposal neither changes the server-side valuation boundary nor introduces a client-side valuation source.

Historic requests retain their recorded methodology version, configuration reference, inputs, approach availability, warnings, and decision trail. No historical valuation is recalculated or reclassified by this document.[2]

## Validation Plan

No methodology implementation is validated or released by this ADR. Before a later ADR can accept a new missing-approach policy, its release candidate must produce the following immutable review artefacts.

The release candidate must provide an explicit, owner-approved matrix of property types, scenarios, and permitted or missing approach combinations in its methodology document and ADR.

It must also provide an evidence-sufficiency policy for absent rent, cost, depreciation, NOI, or any other method input; no fabricated allocation or synthetic value may be used. The required artefacts are an evidence contract and decision records.

Comparative validation must follow a documented, evidence-supported protocol capable of evaluating the selected policy against an appropriate observed outcome. A versioned protocol and results record are required.

Regression coverage must exercise every permitted, unavailable, rejected, and partial combination, with invariant tests proving that historic v1.2 results remain unchanged. The release record must include the test paths and CI evidence.

The release checks must include type safety, full test suite, production build, whitespace verification, canonical-version alignment, and a representative server-side valuation path. The release record must retain the CI run, verification note, and merge commit.

Independent review and owner approval must cover evidence, formula, applicability, and consequences before implementation is merged. The release package must include a completed ADR approval table and review record.

## Consequences

The proposal preserves the evidence-led principle while allowing the project to investigate a disciplined policy for incomplete approach availability. It prevents the existing runtime behavior from being silently treated as approved methodology.

It also defers any delivery of a new release until the project can define all eligible combinations and validate them with suitable evidence. The temporary consequence is that `CALC-013` remains disclosed as provisional, and no new value, weight, or acceptance rule may be inferred from this ADR.

## Alternatives Considered

1. **Reject every valuation with a missing positive-weight approach.** This remains a legitimate future policy direction, but the owner selected direction A for further proposal work; it is not adopted or rejected permanently here.[1]
2. **Accept the current implementation as methodology without further evidence.** Rejected because observed runtime behavior is not an approved evidence-led policy.[1]
3. **Create thresholds, coefficients, or a universal fallback now.** Rejected because no approved evidence or policy basis exists for inventing them.[1]
4. **Modify frozen v1.2 in place.** Rejected by ADR-011 and the methodology-release governance rule.[2] [5]

## Owner Approval

The project owner selected direction A on 2026-08-20: this ADR remains proposed and does not approve implementation. The evidence is the recorded owner decision following the CALC-013 policy gate.[1]

## Implementation and Release Record

The documentation pull request is [PR #25](https://github.com/Hichemorca/MIAYAAR/pull/25). There is no implementation pull request because this ADR does not authorize implementation. The merge commit and CI run remain pending the documentation review. The verification record is `docs/governance/CALC-013-POLICY-GATE-2026-08-20.md`. No ADR is superseded; a future accepted methodology ADR must be allocated only if its policy gates are satisfied.

## References

[1]: ../governance/CALC-013-POLICY-GATE-2026-08-20.md "CALC-013 policy gate"
[2]: ADR-011-canonical-frozen-valuation-methodology-v1-2.md "ADR-011 — Canonical Frozen Valuation Methodology v1.2"
[3]: ../../server/engines/orchestrator/core-valuation-adapter.ts "Server-side valuation evidence adapter"
[4]: ADR-007-result-object.md "ADR-007 — Standardized Result Object Contract"
[5]: ADR-TEMPLATE-METHODOLOGY-RELEASE.md "Methodology release ADR template"
