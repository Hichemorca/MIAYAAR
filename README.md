# MIAYAAR

**MIAYAAR** is an evidence-led property valuation platform for Dubai. It prepares an auditable valuation report from eligible Dubai Land Department (DLD) transaction evidence, a frozen methodology standard, and deterministic calculations that run only on the server.

The application does not invent a city-wide proxy when a local-evidence gate fails. It returns an explicit evidence-unavailable or insufficient-data outcome instead, preserving the decision basis and its audit trail.

| Component           | Responsibility                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `client/`           | English React property-file experience and traceable valuation report                       |
| `server/valuation/` | DLD evidence validation, methodology registry, and local comparable search                  |
| `server/engines/`   | Orchestration, rules, deterministic valuation, confidence, and reporting                    |
| `shared/valuation/` | Frozen request and methodology contracts, including the method-applicability policy         |
| `drizzle/`          | Database schema and migrations for the evidence ledger and audit trail                      |
| `docs/`             | Architecture, methodology, governance decisions, verification records, and roadmap material |

## Governing principles

The authoritative methodology standard is **MIAYAAR-METH-001 v1.1**, whose status is frozen. The runtime methodology registry remains at **v1.2** and preserves its existing calculation configuration. The implementation therefore does not add a coefficient, threshold, fallback, or valuation formula outside the frozen sources.

```text
Property file → input validation → eligible local DLD evidence → rules →
applicable valuation approaches → lower / baseline / upper scenarios →
confidence and warnings → immutable decision record
```

Valuation requests are evaluated through the server. The client never calculates a value, fabricates DCF inputs, or substitutes a local-evidence outcome with a synthetic benchmark.

## Method applicability and official weights

The `shared/valuation/method-applicability.policy.ts` policy transcribes methodology §§4–5 into the application layer. It controls which approaches can be presented and selected for a property type, while `engines/valuation/methodology-v1_2.ts` remains the frozen source for calculation configuration.

| Property type | Sales Comparison | Income Capitalization | Cost Approach  | DCF            |
| ------------- | ---------------- | --------------------- | -------------- | -------------- |
| Apartment     | Applicable       | Applicable            | Not applicable | Applicable     |
| Villa         | Applicable       | Applicable            | Applicable     | Applicable     |
| Townhouse     | Applicable       | Applicable            | Applicable     | Applicable     |
| Office        | Applicable       | Applicable            | Applicable     | Applicable     |
| Retail        | Applicable       | Applicable            | Applicable     | Applicable     |
| Land          | Applicable       | Not applicable        | Not applicable | Applicable     |
| Warehouse     | Applicable       | Not applicable        | Not applicable | Not applicable |

The policy contains the exact lower, baseline, and upper official weight sets for Apartment, Villa, Townhouse, Office, Retail, and Land. Warehouse has no §5 allocation, so no Warehouse weight is introduced. Its existing v1.2 handling remains unchanged.

> **Apartment Cost clarification.** Methodology §4 excludes the Cost Approach for apartments while §5 still publishes a Cost allocation. MIAYAAR excludes the approach before calculation and retains the documented frozen aggregation behavior for the approaches that legitimately run. It does not invent a replacement allocation or a new reweighting rule.

## Validation, evidence, and auditability

Every request requires a district and a positive area. Method-specific submission fields are assessed only for approaches that apply to the selected property type. When a governed public input is supplied, its value and any paired requirement are checked; incomplete or invalid supplied inputs are returned as `INSUFFICIENT_DATA` and recorded in the request audit trail.

Sales Comparison requires eligible local DLD comparable evidence. Income Capitalization accepts annual rent where applicable. Cost Approach checks supported replacement-cost and depreciation inputs where applicable. DCF's complete engine inputs are intentionally not exposed through the public property submission contract and are never constructed by the client or adapter.

If the evidence service cannot establish the required eligible local DLD evidence, the valuation does not produce a certified value.

## Verification snapshot

The §4–§5 implementation was merged through [PR #67](https://github.com/Hichemorca/MIAYAAR/pull/67) and deployed to production on `main@bc492ef`. Its verification included the following results.

| Verification              | Result                              |
| ------------------------- | ----------------------------------- |
| TypeScript check          | Passed                              |
| Vitest                    | Passed: 36 test files and 146 tests |
| Production build          | Passed                              |
| Prettier check            | Passed                              |
| `git diff --check`        | Passed                              |
| GitHub CI                 | Passed                              |
| Netlify Deploy Preview    | Passed                              |
| Netlify production deploy | Published for `main@bc492ef`        |

The UI verification record covers Apartment, Land, and Warehouse applicability states in [`docs/verification/METHOD-APPLICABILITY-UI-VERIFICATION-2026-08-22.md`](./docs/verification/METHOD-APPLICABILITY-UI-VERIFICATION-2026-08-22.md).

## Project History Documentation Index

The historical delivery index links each numbered project stage from PR #2 through PR #67 to its implementation, governance, operations, security, or verification record. It distinguishes merged delivery from open work and flags number gaps rather than inventing historical stages. See [`docs/PROJECT-HISTORY-DOCUMENTATION-INDEX.md`](./docs/PROJECT-HISTORY-DOCUMENTATION-INDEX.md).

## Local development

The full-stack application uses React, TypeScript, Vite, Express, tRPC, Drizzle, PostgreSQL, Netlify Functions, and Vitest. Install the locked dependency graph and run the following commands from the repository root.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm format:check
git diff --check
pnpm dev
```

Database, session, and platform environment values are supplied by the deployment environment. Do not commit an `.env` file. Apply Drizzle changes only after reviewing generated SQL and following the repository migration process.

## Project status

The §4–§5 method-applicability scope is complete and deployed. No subsequent product phase is authorized automatically. Any next capability must begin with a separately approved governance scope; this preserves the frozen methodology, contracts, and evidence-first constraints.

For the governing methodology, see [`docs/VALUATION-METHODOLOGY.md`](./docs/VALUATION-METHODOLOGY.md). For verification and governance records, begin under [`docs/`](./docs/).
