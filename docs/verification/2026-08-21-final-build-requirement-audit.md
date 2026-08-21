# MIAYAAR Final Build — Requirement Audit and Safe Execution Map

**Date:** 2026-08-21  
**Baseline:** `main` after the owner-authorized merge of PR #53  
**Purpose:** Convert the owner’s Final Build Directive into an executable, evidence-linked work map without widening frozen contracts, frozen methodology v1.2, or policy boundaries.

## 1. Governing execution rule

The implementation must complete established capabilities and bind existing outputs to user-facing and administrative workflows. It must not invent values, fields, property types, valuation methods, weights, coefficients, thresholds, fallbacks, indicators, rules, APIs, or enum members. A requirement that cannot be grounded in an existing contract, policy, or methodology record is recorded as **UNRESOLVED** and isolated from executable work. [1] [2] [3]

The public valuation route remains server-evaluated and rate-limited. The browser may collect contract inputs and present server output, but it cannot make valuation, comparable-selection, confidence, methodology, diagnostic, or evidence decisions. [2] [3]

## 2. Baseline component inventory

| Directive area                      | Existing evidence                                                                               | Current status                                       | Safe completion work                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture and frozen contracts   | `core/`, `engines/valuation/`, `shared/valuation/contracts.ts`, Core Types Freeze acceptance    | Implemented                                          | Preserve boundary; test and document non-interference only.                                                                                     |
| DLD pipeline and evidence registry  | Cleaning scripts, DLD import provenance tables, `marketTransactions`, evidence-validation tests | Implemented with evidence-coverage limits            | Present actual source, coverage, import status, and limitations in read-only surfaces.                                                          |
| Property classification             | Existing classifier, seven frozen property types, source-native restrictions                    | Implemented for current contract                     | Present only the seven existing types and contract fields; do not infer project, subtype, legal, zoning, or hotel fields.                       |
| Market Intelligence                 | DLD-only provider and independent service, policy v1.0                                          | Implemented but not exposed to the application route | Add read-only server/UI presentation only if its approved output contract can be surfaced unchanged.                                            |
| Comparable Selection                | Deterministic selection service and per-record exclusion evidence                               | Implemented                                          | Expose already-returned selection/exclusion facts only; do not add hierarchy, fallback, or adjustment logic.                                    |
| Valuation Engine                    | Frozen v1.2 orchestration and four approaches                                                   | Implemented                                          | Keep it canonical; use its returned approach applicability and report data.                                                                     |
| Confidence and evidence             | Existing confidence engine, Evidence Integrity v1.0 service, report components                  | Implemented within bounded scopes                    | Present existing facts, confidence context, and limitations without a new score or classification.                                              |
| Diagnostics and forensics           | Evidence Integrity facts-only surface; forensic diagnostics policy gate                         | Partially implemented / policy-bounded               | Present existing Evidence Integrity facts only. New anomaly, outlier, suspicious-transaction, scale, or forensic findings are UNRESOLVED.       |
| Explainability and reporting        | `ValuationReport` and report-evidence context                                                   | Implemented in part                                  | Improve composition only through returned audit, evidence, method, confidence, and comparable facts.                                            |
| Main valuation UI                   | PR #53 contract-aligned responsive property-file workflow                                       | Implemented                                          | Add progressive disclosure only where an approved applicability rule exists; retain fields otherwise.                                           |
| Administration and governance panel | OAuth, persisted admin role, methodology version table, system admin procedure                  | Partially implemented                                | Build protected read-only visibility first; add governed mutations only where a policy-backed record and append-only audit semantics exist.     |
| Testing and regression              | Contract, engine, UI, security, Netlify, operational, and governance tests                      | Implemented in part                                  | Add targeted admin, authorization, configuration-version, audit, reproducibility, integration, and end-to-end coverage for every added surface. |

## 3. Contract-constrained property and method behavior

The current submission contract accepts exactly `propertyType`, `district`, `areaSqm`, established condition/view/finish fields, and optional declared economic inputs. It does not contain project, parking, legal rights, zoning, valuation purpose, valuation date, a governed subtype, or hospitality attributes. The user interface must not create a parallel model for those missing facts. [2]

The existing `PropertySubmission` contract has no approved type-to-field applicability map and no field-level requiredness matrix beyond its declared TypeScript shape. Thus, type-specific hiding, requiredness changes, and method-specific UI input sections are **UNRESOLVED** until an owner-approved policy names the applicable fields and source of truth. Fields may be grouped progressively for usability, but they may not be represented as inapplicable, required, or excluded by property type without that policy. [1] [2]

Likewise, the four approaches may be named and their server-returned applicability may be reported, but the UI cannot independently decide that a method is available for a type or request method-specific inputs that the contract does not support. [2] [3]

## 4. Administration and historical reproducibility map

| Administration requirement         | Policy-backed source currently available                                 | Executable approach                                                                                       | Boundary                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Methodology status and history     | `methodologyVersions` and the frozen v1.2 registry checksum              | Authenticated, admin-only read surface showing persisted release facts.                                   | The active frozen release is not an editable form.                                                               |
| DLD source and coverage            | DLD import provenance tables and market transaction registry             | Authenticated, admin-only read surface showing actual records, latest import state, and aggregate counts. | No source-identity mutation, scraping, or enrichment.                                                            |
| Property types and contract fields | Frozen submission contract                                               | Authenticated, admin-only read surface generated from central contract metadata.                          | No new property type, field, applicability, or validation rule.                                                  |
| Weights and coefficients           | Frozen methodology v1.2 configuration                                    | Read-only display of source configuration and checksum.                                                   | Editable weights/coefficient configuration is UNRESOLVED until a replacement-release and approval policy exists. |
| Parameters                         | No administered parameter registry is approved.                          | Record as UNRESOLVED.                                                                                     | Do not convert arbitrary constants into admin inputs.                                                            |
| Field applicability                | No approved type-to-field policy exists.                                 | Record as UNRESOLVED.                                                                                     | Do not derive or store an inferred matrix.                                                                       |
| Configuration versioning           | Methodology releases preserve version and checksum already.              | Extend only with immutable, policy-backed records if a concrete mutable configuration scope is approved.  | No silent overwrite and no retroactive effect on historical valuations.                                          |
| Audit log                          | Existing valuation audit events are append-only for valuation execution. | Add a separate append-only administration audit record only for implemented administrative mutations.     | Never rewrite valuation audit events or manufacture prior events.                                                |

## 5. RLS hardening baseline — design only

The connected Supabase project currently reports RLS disabled on the following eight application tables: `users`, `methodologyVersions`, `valuationRequests`, `valuationAuditEvents`, `marketTransactions`, `dldImportRuns`, `dldImportIssues`, and `valuationRateLimitWindows`. No RLS policy or database change has been applied in this phase.

The application uses a server-side PostgreSQL connection from `DATABASE_URL`; the browser uses tRPC routes, not direct Supabase table queries. The RLS design must therefore deny direct `anon` and `authenticated` table access by default while preserving the server’s deployed database role. Because the actual database role and ownership configuration are deployment credentials, the repository will supply migration SQL and policy tests but will not apply it to Supabase until the owner reviews and authorizes the migration. [4]

| Table                       | Application role                     | Intended direct-client posture | Required server preservation                          |
| --------------------------- | ------------------------------------ | ------------------------------ | ----------------------------------------------------- |
| `users`                     | OAuth identity and role lookup       | Deny direct reads/writes       | OAuth upsert and authenticated role resolution.       |
| `methodologyVersions`       | Immutable methodology release record | Deny direct reads/writes       | Frozen-release read and one-time registry bootstrap.  |
| `valuationRequests`         | Valuation request provenance         | Deny direct reads/writes       | Orchestrator create and completion-status update.     |
| `valuationAuditEvents`      | Append-only valuation audit evidence | Deny direct reads/writes       | Orchestrator append-only inserts.                     |
| `marketTransactions`        | DLD evidence registry                | Deny direct reads/writes       | Eligibility, comparable, and market-evidence queries. |
| `dldImportRuns`             | DLD import provenance                | Deny direct reads/writes       | Ingestion/provenance recording and admin read model.  |
| `dldImportIssues`           | DLD ingestion issue evidence         | Deny direct reads/writes       | Ingestion issue recording and admin read model.       |
| `valuationRateLimitWindows` | Shared server rate-limit counter     | Deny direct reads/writes       | Atomic counter increment and bounded pruning.         |

## 6. Unresolved-decision register

| ID    | Requirement gap                                                                     | Affected layer              | Reason it cannot be inferred                                                                                              | Decision needed                                                                                                    |
| ----- | ----------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| U-001 | Property-type field applicability and requiredness                                  | Contract, UI, validation    | No approved type-to-field matrix or contract fields for the requested missing metadata.                                   | Adopt a governed field-applicability policy and, where needed, a contract change.                                  |
| U-002 | Method-aware UI input applicability                                                 | Methodology, UI             | The frozen method outputs do not authorize independent client-side eligibility or additional input fields.                | Adopt an approach-input/applicability policy tied to methodology v1.2 or a successor.                              |
| U-003 | Editable weights and coefficients                                                   | Methodology, administration | v1.2 is frozen and there is no approved replacement-release workflow.                                                     | Approve a versioned methodology-release and approval policy.                                                       |
| U-004 | Editable parameter registry                                                         | Engine, administration      | No list of administrable parameters or validation policies exists.                                                        | Approve each administrable parameter family and its versioning/provenance policy.                                  |
| U-005 | Forensic anomalies, outliers, suspicious or scale findings                          | Diagnostics                 | Existing Evidence Integrity is facts-only and no taxonomy or threshold is approved.                                       | Approve forensic taxonomy, sources, thresholds, and non-interference policy.                                       |
| U-006 | Direct application of RLS policies                                                  | Production database         | A policy migration can affect the database role serving the deployed app.                                                 | Review and approve the tested RLS migration before application.                                                    |
| U-007 | Market Intelligence, Comparable Selection, forensic, or temporal report/API surface | Application API and UI      | The API governance reconciliation permits no new endpoint, client call, report field, or public claim for those services. | Approve a separate surface policy, audience, request/response contract, provenance, and non-interference controls. |

## 7. Safe execution order

The next implementation unit can safely add a protected governance read model, central non-authoritative presentation metadata generated from current contracts, and an RLS migration design with tests. It can also compose existing report facts into the application without creating new analytical outputs. Any configuration mutation must be deferred until it has a policy-backed versioned object, a validation rule, authorization, a reason field, and an append-only audit event.

## 8. Local visual verification notes

The local desktop capture at 1440 × 1000 confirmed that the public home route renders the evidence-led property-file workflow and its English navigation hierarchy from the current repository server. A direct unauthenticated headless capture of `/governance` rendered only the application shell; authenticated administrative visual verification remains pending because the protected route requires a persisted administrator session. The procedure-level authorization test is the current evidence that no governance facts are returned to a non-administrator.

A separate local mobile capture at 390 × 844 confirmed that the public valuation header, evidence boundary, and property-file entry point remain readable without horizontal overflow in the captured viewport after the report-fact presentation update.

## 9. Existing report-fact presentation record

The valuation report now renders the confidence facts and decision trace already returned by the canonical server report. The presentation neither recomputes confidence nor changes the trace, method eligibility, weights, evidence, valuation, or methodology. No Market Intelligence, Comparable Selection, Forensic Diagnostics, or Temporal Backtesting query, endpoint, client call, report field, or UI claim was added: the governing API review reserves those surfaces as `UNRESOLVED_POLICY`.

## References

[1]: Owner-approved MIAYAAR Final Build Directive — task attachment dated 2026-08-21  
[2]: `../../shared/valuation/contracts.ts` — Current frozen property-submission and methodology configuration contract  
[3]: `../ARCHITECTURE.md` — MIAYAAR architecture boundaries and server-only valuation rules  
[4]: `../../server/db.ts` — Server-side PostgreSQL connection path and database operations
[5]: `../governance/API-SURFACE-GOVERNANCE-RECONCILIATION-2026-08-21.md` — Approved API surface boundary
