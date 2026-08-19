# ADR-011 — Canonical Frozen Valuation Methodology v1.2

**Status:** Accepted on 2026-08-19
**Date:** 2026-08-19

## Context

Commit `3ca7b8920c983bceaebcd02f87fbdcb8e780e535` introduced `engines/valuation/methodology-v1_2.ts` and changed the shared declared methodology version from `1.1` to `1.2`. The new canonical configuration formalizes the `LAND` property taxonomy and leaves `WAREHOUSE` without a methodology allocation. It also centralizes the scenario weights, assumptions, and deterministic adjustment factors resolved by the server-side valuation engine.

The repository ADR policy requires an ADR before a significant architectural decision, including a contract change, a new module, or a decision between architectural alternatives. The implementation was introduced without a numbered decision record in the permanent ADR index. This record is therefore proposed to provide the missing decision history; it does not change any numeric weight, factor, calculation, evidence threshold, or public API behavior.

## Decision

Adopt `engines/valuation/methodology-v1_2.ts` as the single canonical, frozen configuration source for methodology release `MIAYAAR-METH-001` version `1.2`. The valuation engine must continue resolving valuation configuration only on the server from this module. `LAND` remains a supported taxonomy with its explicit scenario weights, and `WAREHOUSE` remains intentionally unsupported until local evidence and a separately approved methodology allocation exist.

The duplicated shared declaration of the methodology identifier and version is retained only as an interface compatibility declaration and is protected by an automated consistency test. It is not an alternative source of weights, assumptions, adjustments, or valuation outcomes.

## Rationale

The change affects both the domain vocabulary available to the engine and the canonical configuration it resolves at runtime. These effects satisfy the repository's ADR threshold for a contract-affecting architectural decision. Explicitly excluding an unsupported `WAREHOUSE` allocation aligns with the evidence-led rule: absence of local evidence must produce an unavailable method rather than a fabricated value.

## Consequences

The decision gives the `v1.2` release a reviewable historical record and preserves a stable reference for decision logs. It also makes the `LAND` taxonomy and the `WAREHOUSE` exclusion explicit to maintainers and downstream consumers.

The repository must keep the shared version declaration synchronized with the canonical module until that declaration can be removed through a separately reviewed contract migration. No historical valuation must be reinterpreted by changing the frozen `v1.2` numeric configuration.

## Alternatives Considered

1. **Leave the release undocumented.** Rejected because it preserves a material gap in the permanent decision record.
2. **Change the existing ADR-009 retroactively.** Rejected because ADR-009 records the original valuation-engine decision; a later methodology release needs its own traceable decision.
3. **Move methodology configuration into `shared/`.** Rejected because it would expand a transport/shared contract into an alternative runtime source and weaken the canonical engine boundary.
4. **Create a `WAREHOUSE` allocation now.** Rejected because the platform must not fabricate a methodology allocation when validated local evidence is absent.
