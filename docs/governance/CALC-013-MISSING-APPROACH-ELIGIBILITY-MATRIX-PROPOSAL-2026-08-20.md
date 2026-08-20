# CALC-013 — Missing-Approach Eligibility Matrix Proposal

**Status:** Proposed — owner policy approval required before implementation  
**Date:** 2026-08-20  
**Scope:** Missing positive-weight valuation approaches only.  
**Policy relationship:** Implements the documentation gate required by ADR-012; it does not change `MIAYAAR-METH-001` v1.2, runtime behavior, or any historic valuation.[1]

## Purpose and boundary

This proposal records the present approach-availability states and identifies which states could later become eligible for a CALC-013 policy. It is **not** an eligibility approval. No row labelled `UNRESOLVED` may be interpreted as permission to produce, accept, or reweight a valuation result.

The only enforced architectural rule already supported by the current platform is that a valuation must not receive a value when local market evidence is unavailable. Therefore, every state without eligible sales-comparison evidence remains rejected; this proposal does not introduce an exception.[2]

> The current engine's normalization behavior is explicitly labelled provisional. Observing that behavior does not make it an approved methodology rule.[1] [3]

## Terms

- **Configured positive approach:** A valuation approach assigned a positive scenario weight by the frozen v1.2 configuration for the applicable property type.
- **Available approach:** An approach that returned a usable approach result through the server-side valuation flow.
- **Sales evidence available:** Eligible local DLD market evidence supports the sales-comparison approach.
- **Full configured set:** Every approach with a positive configured scenario weight is available.
- **Missing positive approach:** At least one approach with a positive configured weight is unavailable.
- **UNRESOLVED:** No owner-approved policy permits the combination; no implementation consequence may be inferred.

## Evidence and system facts

The frozen v1.2 configuration assigns the authoritative approach weights by property type and scenario. It does not provide a matrix authorizing the engine to redistribute a missing approach's weight.[4] The runtime currently computes from available results, labels its active-weight normalization as `CALC-013` provisional, and can expose a partial result; neither fact decides when a partial result is deliverable.[3] [5]

Eligible DLD data supports sales-comparison evidence. Income capitalization requires supplied annual rent; cost requires replacement cost and depreciation; and DCF requires independently available NOI. Those inputs are not all derivable from the DLD evidence record, so DLD alone cannot validate a missing-approach reweighting policy.[1] [6]

The following points are therefore established: the current active-weight formula is observed system behavior; current warnings and metadata disclose it as provisional; the full v1.2 weights remain frozen; and DLD alone does not prove that an incomplete approach set should be deliverable.[1] [3] [4] [6]

## Proposed matrix

The matrix uses `S` for sales comparison, `I` for income capitalization, `C` for cost, and `D` for DCF. A dash means the approach is unavailable; `✓` means it produced a usable result. “Applicable” refers only to approaches that carry a positive frozen v1.2 weight for the applicable property type and scenario.

### M-01 — no local sales evidence

**State:** `S —`; any other combination may be present or missing.  
**Disposition:** **REJECTED — architectural rule.**  
**Required action:** Return the existing evidence-unavailable path. Do not return a value or use substitute geography, a synthetic fallback, or an invented rule.

### M-02 — sales evidence is the full configured set

**State:** `S ✓`; no other applicable positive approach exists.  
**Disposition:** **OUTSIDE CALC-013.**  
**Required action:** Use the frozen full configured set. No missing-approach decision is involved.

### M-03 — sales-only availability with missing positive approaches

**State:** `S ✓`; one or more other applicable positive approaches are unavailable; `S` is the only available approach.  
**Disposition:** **UNRESOLVED.**  
**Required action:** Do not newly declare the sales-only result eligible or ineligible. A future policy must decide whether the state produces a deliverable partial result or a rejection.

### M-04 — mixed partial availability

**State:** `S ✓`; some, but not all, non-sales applicable positive approaches are available.  
**Disposition:** **UNRESOLVED.**  
**Required action:** Do not infer reweighting permission. A future policy must list each permitted and prohibited subset.

### M-05 — all applicable positive approaches are available

**State:** `S ✓`; every applicable positive approach is available.  
**Disposition:** **OUTSIDE CALC-013.**  
**Required action:** Apply the frozen v1.2 configured weights. No normalization decision is involved.

### M-06 — indeterminate applicability or invalid approach output

**State:** The configured positive-weight set cannot be identified, or an available approach output is invalid.  
**Disposition:** **REJECTED PENDING EVIDENCE.**  
**Required action:** Do not normalize. Record the evidence or contract failure and follow the existing server-side failure path.

This proposal intentionally does not enumerate a universal fixed list such as `S+I`, `S+C`, or `S+I+C+D` as approved combinations. The applicable set differs by property type and scenario in the frozen configuration, and the policy gate found no approved evidence for treating any missing-member combination as universally eligible.[1] [4]

## Property-type and scenario mapping requirement

Before an `UNRESOLVED` state may become eligible, a candidate methodology release must create a versioned mapping for every property type and scenario. The mapping must name the positive configured approaches, permitted available subsets, prohibited subsets, and the only allowed result disposition for each subset.

The mapping must contain the following fields:

- **Property type and scenario:** the exact frozen v1.2 configuration being evaluated. The source configuration exists, but no eligibility policy has been approved.
- **Full configured positive set:** the approaches that carry positive weight for that property type and scenario. This is derivable from v1.2; no new values are permitted here.
- **Permitted partial subsets:** explicit available-approach sets permitted to produce a deliverable partial result. This remains **UNRESOLVED**.
- **Prohibited partial subsets:** sets that must reject rather than reweight. This remains **UNRESOLVED** except for M-01 and M-06.
- **Required evidence provenance:** the source and validation for every input needed by each retained approach. DLD provenance exists for sales; non-sales evidence policy is incomplete.
- **Result disposition:** `partial`, `rejected`, or another contract-compatible disposition with a decision-record reason. This remains **UNRESOLVED** for M-03 and M-04.
- **Historic compatibility:** proof that historic v1.2 records are not recalculated or reclassified. This is required before any release and is unchanged here.

## Non-negotiable constraints for a future policy

A future candidate may not introduce an unapproved coefficient, threshold, confidence score, city-wide substitute, synthetic income, synthetic cost, or synthetic NOI merely to make a state eligible. It must preserve the server-only valuation boundary and the full decision record, and it must use the existing evidence-unavailable outcome whenever local sales evidence is absent.[2] [5]

The policy candidate must also distinguish the **observed runtime state** from the **approved result disposition**. The current engine's ability to emit `partial` is a contract-level state; it is not an approval for an incomplete approach set to be delivered as a valuation result.[1] [5]

## Owner decision requested

The owner must make one bounded policy decision before this matrix can advance beyond proposal status:

> **Should a future CALC-013 release be permitted to consider only M-03 and M-04 as candidate partial-result states after a property-type/scenario-specific evidence review, while M-01 and M-06 remain rejected and M-02/M-05 remain outside CALC-013?**

An approval would authorize **policy design and evidence review only**. It would not approve any availability subset, formula, reweighting method, threshold, or code change. Each candidate subset would still require explicit evidence, validation, ADR approval, independent review, and a versioned methodology release.[1]

## No implementation effect

This document makes no code, configuration, contract, migration, API, data, or valuation-output change. `CALC-013` remains provisional, v1.2 remains frozen, and all existing warnings, decision records, and historical outputs remain intact.[1] [4]

## References

[1]: ../ADR/ADR-012-proposed-missing-approach-policy-direction.md "ADR-012 — Proposed Direction for Missing-Approach Weight Normalization"
[2]: ../ARCHITECTURE.md "MIAYAAR architecture — no value without local evidence"
[3]: ../../engines/valuation/valuation.engine.ts "Current provisional CALC-013 runtime behavior"
[4]: ../../engines/valuation/methodology-v1_2.ts "Frozen v1.2 methodology configuration"
[5]: ../../core/results/result.contract.ts "Canonical result states and decision records"
[6]: ../../server/engines/orchestrator/core-valuation-adapter.ts "Server-side valuation input availability"
