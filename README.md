# MIAYAAR

**MIAYAAR** is an evidence-led property valuation platform for Dubai. It prepares an auditable valuation report from eligible Dubai Land Department transaction evidence, a frozen methodology configuration, and server-side deterministic calculations.

The application does not invent a city-wide proxy when a local evidence gate fails. It returns an explicit evidence-unavailable outcome instead, preserving the basis for the decision request.

| Component | Responsibility |
|---|---|
| `client/` | English React property-file experience and traceable valuation report |
| `server/valuation/` | DLD evidence validation, methodology registry, and local comparable search |
| `server/engines/` | Orchestration, rules, deterministic valuation, confidence, and reporting |
| `shared/valuation/` | Frozen request and methodology contracts shared by the client and server |
| `drizzle/` | Database schema and migrations for the evidence ledger and audit trail |
| `docs/` | Foundational architecture, methodology, roadmap, and engineering decisions |

## Governing principles

The current implementation is governed by **MIAYAAR-METH-001 v1.1**. A valuation request is evaluated by the server through the following decision flow:

```text
Property file → input validation → eligible local DLD evidence → rules →
applicable valuation approaches → lower / baseline / upper scenarios →
confidence and warnings → immutable decision record
```

The deterministic engine considers market comparison, income capitalization, cost, and ten-year DCF approaches. Each approach is disclosed as available or unavailable; methodology weights are normalized only across approaches that can legitimately run.

## Local development

The full-stack application uses React, TypeScript, Vite, Express, tRPC, Drizzle, and Vitest. Install the locked dependency graph and run the following commands from the repository root.

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm dev
```

The database, session, and platform environment values are intentionally supplied by the deployment environment; do not commit an `.env` file. Apply Drizzle changes only after reviewing the generated SQL and following the migration process documented in the project instructions.

## Verification snapshot

The verified browser journey used an apartment profile in Jumeirah Village Circle. The server returned twelve eligible local DLD comparables from a ninety-day window, an explicitly partial valuation, three available valuation approaches, an unavailable cost approach warning, and an immutable decision request identifier. The repository's Vitest suite contains ten passing valuation, rules, confidence, methodology, evidence, and authentication tests.

For the full specification and architectural constraints, begin with the documents under [`docs/`](./docs/).
