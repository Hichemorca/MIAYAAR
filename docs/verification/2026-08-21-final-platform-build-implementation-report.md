# Final Platform Build — Implementation Report

**Status:** Local implementation complete; pull request pending  
**Branch:** `feature/final-platform-build`  
**Baseline:** `main` at `90be1d0`, which includes the merged UI Reference Rebuild  
**Date:** 2026-08-21

## 1. Delivery boundary

This delivery completes the policy-backed work that can be safely implemented from the current `main` branch. It adds a protected, read-only governance surface; exposes existing server-returned confidence and decision-trace facts in the canonical valuation report; records an un-applied least-privilege RLS migration; and adds targeted regression coverage.

It deliberately does **not** create new valuation inputs, methods, weights, coefficients, comparables, confidence calculations, taxonomies, source-collection paths, API endpoints for Market Intelligence or forensic services, or client-side calculations. Requirements needing a governing policy remain explicitly recorded as `UNRESOLVED` rather than inferred.

## 2. Implemented capabilities

| Capability                       | Implementation                                                                                                                                                            | Governing boundary retained                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Protected governance overview    | Adds `governance.overview`, an `adminProcedure` query that returns existing release, methodology, contract, DLD-provenance, and audit-summary facts.                      | Read-only query; no action changes configuration, methodology, data, valuation, or audit history.                        |
| Governance page                  | Adds the English `/governance` route within the existing `DashboardLayout`. It handles loading, unavailable storage, and empty audit evidence without fabricating values. | Existing authentication and administrator role checks remain authoritative. Public requests receive no governance facts. |
| Frozen methodology evidence      | Displays the current methodology identifier and checksum from the existing registry.                                                                                      | It presents source facts only; it cannot edit parameters, weights, or methodology releases.                              |
| Persisted release evidence       | Reads the existing `methodology_versions` records and provides a bounded unavailable state if storage cannot be queried.                                                  | Existing records are neither edited nor backfilled.                                                                      |
| Contract and provenance evidence | Displays the property-type registry from the central enum and an aggregate DLD summary derived from stored records.                                                       | No new vocabulary, source normalization, DLD ingestion, or provenance assertion is introduced.                           |
| Audit evidence                   | Provides a bounded summary of existing valuation audit-event categories and recency where stored evidence is available.                                                   | No audit event is created, altered, or replayed.                                                                         |
| Canonical valuation report       | Adds presentation of already returned confidence facts and the existing decision trace.                                                                                   | The browser does not compute, transform, rank, or augment confidence, evidence, methods, or values.                      |
| RLS hardening package            | Adds a least-privilege SQL migration and a security-design record for all eight observed production tables.                                                               | The migration was **not applied** to Supabase and must not be applied without separate review and approval.              |

## 3. Security and database posture

The RLS design covers `users`, `methodology_versions`, `valuation_requests`, `valuation_audit_events`, `market_transactions`, `dld_transactions`, `dld_ingestion_runs`, and `dld_ingestion_audit_events`. It enables RLS and uses deny-by-default public policies, allowing only the intended `service_role` server path to access the application tables.

> This is a reviewed migration artifact, not a database change. Supabase production data, schema, roles, RLS state, and policies have not been modified in this delivery.

The migration and its design tests verify that no policy grants to `anon`, `authenticated`, or `public` are introduced and that no `INSERT`, `UPDATE`, or `DELETE` policy is present. The separate design document records the deployment prerequisite, rollback procedure, and evidence required before application.

## 4. API and UI surface decisions

| Surface                     | Result                    | Reason                                                                                            |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `valuation.run`             | Unchanged                 | The public valuation boundary, server-only computation, and established rate limit remain intact. |
| `evidenceIntegrity.report`  | Unchanged                 | Evidence Integrity stays facts-only and separate from confidence or price classification.         |
| `governance.overview`       | Added, administrator-only | It reads existing facts needed for authorized governance visibility; it has no mutation path.     |
| Market Intelligence API/UI  | Not added                 | API-surface governance requires a separately approved surface policy and contract.                |
| Comparable Selection API/UI | Not added                 | The deterministic selection service has no approved public or report surface.                     |
| Forensic Diagnostics API/UI | Not added                 | The current policy gate is documentation-only and forbids taxonomy or diagnostic output.          |
| Temporal Backtesting API/UI | Not added                 | No approved endpoint, audience, or result contract exists.                                        |
| Conditional property fields | Not added                 | No approved property-type-to-field applicability matrix exists.                                   |

## 5. Changed files

| File                                                                   | Purpose                                                                                         |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `server/db.ts`                                                         | Adds guarded, read-only governance summary helpers based on existing tables and registry facts. |
| `server/routers.ts`                                                    | Adds the administrator-only `governance.overview` query.                                        |
| `client/src/App.tsx`                                                   | Registers the protected `/governance` route.                                                    |
| `client/src/components/DashboardLayout.tsx`                            | Adds the governance navigation entry inside the existing authenticated shell.                   |
| `client/src/pages/Governance.tsx`                                      | Adds the English read-only governance interface and bounded unavailable state.                  |
| `client/src/components/ValuationReport.tsx`                            | Presents existing confidence facts and decision trace without calculation.                      |
| `client/src/index.css`                                                 | Adds responsive styling for the report-fact presentation.                                       |
| `supabase/migrations/20260821190000_enable_rls_application_tables.sql` | Adds an un-applied, reviewed RLS-hardening migration.                                           |
| `docs/security/RLS-HARDENING-DESIGN-2026-08-21.md`                     | Records the RLS threat model, policy intent, deployment conditions, and rollback.               |
| `docs/verification/2026-08-21-final-build-requirement-audit.md`        | Records executable requirements, completed evidence, and unresolved governance decisions.       |
| `tests/governance/governance-admin-surface.test.ts`                    | Covers authorization, read-only exposure, and unavailable storage handling.                     |
| `tests/governance/rls-hardening-design.test.ts`                        | Covers the un-applied RLS migration’s least-privilege constraints.                              |
| `tests/ui/valuation-report-presentation.test.ts`                       | Covers confidence and decision-trace presentation as server-returned facts.                     |
| `todo.md`                                                              | Preserves the completed work and pending owner-governed decisions.                              |

## 6. Verification evidence

| Check                               | Result        | Evidence                                                                                                                                                                                   |
| ----------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript                          | Passed        | `pnpm check` completed without errors.                                                                                                                                                     |
| Regression and governance tests     | Passed        | `pnpm test`: **34 test files, 123 tests passed**.                                                                                                                                          |
| Production build                    | Passed        | `pnpm build` completed successfully. The existing Vite chunk-size advisory remains non-blocking.                                                                                           |
| Incremental formatting              | Passed        | `pnpm format:check` passed for all files eligible under the repository’s incremental-baseline policy.                                                                                      |
| Diff whitespace                     | Passed        | `git diff --check` completed without errors.                                                                                                                                               |
| Desktop public route                | Passed        | Local Chromium capture at 1440 × 1000 confirmed the public evidence-led valuation workflow remains available.                                                                              |
| Mobile public route                 | Passed        | Local Chromium capture at 390 × 844 confirmed the valuation header, evidence boundary, and property-file entry point remain readable without horizontal overflow in the captured viewport. |
| Public governance route             | Passed        | Local unauthenticated capture of `/governance` revealed no governance data; procedure tests additionally prove admin-only access.                                                          |
| Authenticated governance screenshot | Not performed | Requires an existing persisted administrator session; authorization is verified at procedure level.                                                                                        |
| Supabase migration application      | Not performed | Explicitly outside the approved scope pending separate migration review.                                                                                                                   |

## 7. Requirements intentionally unresolved

| Identifier | Requirement                                                                       | Status and required decision                                                                                  |
| ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| U-001      | Property-type conditional field applicability                                     | `UNRESOLVED`; approve a type-to-field matrix, including requiredness and evidence provenance.                 |
| U-002      | Hotel/hospitality and general-industrial treatment                                | `UNRESOLVED`; approve property types or a documented mapping.                                                 |
| U-003      | Administrative mutation and version activation                                    | `UNRESOLVED`; approve actor roles, validation, activation, immutability, rollback, and audit-event semantics. |
| U-004      | Market Intelligence, Comparable Selection, forensic, and temporal API/UI surfaces | `UNRESOLVED`; approve audience, contract, provenance, disclosure, and non-interference controls.              |
| U-005      | Forensic taxonomy and thresholds                                                  | `UNRESOLVED`; approve taxonomy, sources, thresholds, timing, and valuation non-interference.                  |
| U-006      | Production RLS application                                                        | Pending; review and explicitly approve the supplied migration before any Supabase change.                     |

## 8. Non-regression declaration

This build does not modify the frozen Core Types, valuation engine, methodology v1.2, weights, coefficients, comparable-selection rules, valuation request input contract, DLD evidence pipeline, public valuation API semantics, or existing historical valuation records. No data migration has been applied, no customer content has been fabricated, and no value is produced where local evidence is insufficient.

## References

[1]: `2026-08-21-final-build-requirement-audit.md` — Executable requirement map and unresolved-decision register  
[2]: `../security/RLS-HARDENING-DESIGN-2026-08-21.md` — RLS hardening design and deployment conditions  
[3]: `../governance/API-SURFACE-GOVERNANCE-RECONCILIATION-2026-08-21.md` — Governing API-surface boundary  
[4]: `../../supabase/migrations/20260821190000_enable_rls_application_tables.sql` — Un-applied RLS migration
