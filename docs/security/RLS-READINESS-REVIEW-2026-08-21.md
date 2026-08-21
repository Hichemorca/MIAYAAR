# MIAYAAR — RLS Hardening Readiness Review

**Date:** 2026-08-21  
**Scope:** U-006 readiness review only  
**Target:** Supabase project `lrfvfbjkojzlrriyjvrz` (`MIAYAAR`)  
**Change authority:** None — no migration, policy, grant, data operation, application change, or deployment is authorized by this record.

## 1. Review boundary

This is a read-only pre-application review of the RLS design committed in
`supabase/migrations/20260821190000_enable_rls_application_tables.sql`. It does
not authorize running the migration. Any future application remains contingent
on a separate explicit owner decision after this review is complete.

## 2. Read-only inspection evidence

| Check                                 | Observed result                                                                                                                                                    | Readiness relevance                                                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target project                        | `MIAYAAR`, active and healthy, PostgreSQL 17.6.1.155                                                                                                               | Confirms the reviewed production target.                                                                                                                                    |
| Inspection-session identity           | `current_user = postgres`; `session_user = postgres`; database = `postgres`                                                                                        | This confirms the identity of the administrative read-only inspection session only. It is **not** evidence of the deployed Netlify server's `DATABASE_URL` connection role. |
| Supabase security advisor             | Eight `rls_disabled_in_public` findings at `ERROR` level                                                                                                           | Confirms that all intended application tables currently require an RLS decision.                                                                                            |
| Intended tables                       | `users`, `methodologyVersions`, `valuationRequests`, `valuationAuditEvents`, `marketTransactions`, `dldImportRuns`, `dldImportIssues`, `valuationRateLimitWindows` | Matches the design scope; no additional table is authorized in this review.                                                                                                 |
| RLS state and ownership               | All eight tables have `rls_enabled = false`, `force_rls = false`, and table owner `postgres`.                                                                      | The proposed migration aligns with the observed table set and does not use `FORCE ROW LEVEL SECURITY`.                                                                      |
| Public-role grants                    | `anon` and `authenticated` currently hold `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on every reviewed table.                                                      | This is an active external exposure while RLS is disabled; policies must remain absent for direct-client roles under the approved design.                                   |
| Privileged-role properties            | `postgres` and `service_role` report `rolbypassrls = true`; `anon` and `authenticated` report `rolbypassrls = false`.                                              | Server-path validation must prove the deployed workload uses an intended privileged path without revealing credentials.                                                     |
| Existing RLS policies                 | `pg_policies` returns no policy for the eight reviewed tables.                                                                                                     | No pre-existing direct-client policy must be preserved or reconciled.                                                                                                       |
| Foreign-key dependencies              | The review query returns no foreign key whose referencing or referenced table is in the eight-table scope.                                                         | The migration has no foreign-key ordering dependency within this scope.                                                                                                     |
| Application connection implementation | `server/db.ts` constructs the Drizzle/`pg` pool only from `process.env.DATABASE_URL`; it does not create a browser-side Supabase client.                           | The documented server-only access model is present in source. Runtime connection identity remains a release-verification item.                                              |

### 2.1 Current table inventory

| Table                       | Rows at inspection | RLS      | Owner      | Exposure-relevant observation                                                    |
| --------------------------- | -----------------: | -------- | ---------- | -------------------------------------------------------------------------------- |
| `users`                     |                  0 | Disabled | `postgres` | User identity data must not remain direct-client readable or writable.           |
| `methodologyVersions`       |                  2 | Disabled | `postgres` | Methodology-governance records are publicly mutable through current role grants. |
| `valuationRequests`         |                 13 | Disabled | `postgres` | Request payloads require server-only access.                                     |
| `valuationAuditEvents`      |                 85 | Disabled | `postgres` | Audit records require server-only access.                                        |
| `marketTransactions`        |             30,306 | Disabled | `postgres` | DLD-backed evidence records are directly exposed through current role grants.    |
| `dldImportRuns`             |                  0 | Disabled | `postgres` | Import-operation metadata requires server-only access.                           |
| `dldImportIssues`           |                  0 | Disabled | `postgres` | Import-issue metadata requires server-only access.                               |
| `valuationRateLimitWindows` |                  1 | Disabled | `postgres` | Rate-limit state requires server-only access.                                    |

The advisor reports that the eight tables are exposed to the `anon` and
`authenticated` roles while RLS is disabled. It also warns that enabling RLS
without applicable policies blocks access. This review therefore treats the
proposed migration and its server-preservation assumptions as a single
deployment decision, not as an isolated SQL toggle.

## 3. Early risk posture

| Risk                                  | Current evidence                                                                                                | Required evidence before any application                                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct PostgREST exposure             | RLS is disabled on all eight public tables.                                                                     | Demonstrate that direct `anon` and `authenticated` access is denied after application.                                                         |
| Server workflow interruption          | The inspection session uses `postgres`, but the deployed server's actual connection role has not been observed. | Establish the deployed connection role without disclosing credentials and run server-path smoke tests after a separately approved application. |
| Incomplete scope                      | Current security advisor identifies exactly the eight reviewed tables.                                          | Confirm no new in-scope table, view, function, or grant changes the access model at the approval point.                                        |
| Unplanned data or methodology effects | This review has performed no mutation.                                                                          | Keep the migration limited to RLS/policy posture; do not include data, methodology, or engine changes.                                         |
| Policy or relationship collision      | No policy and no foreign-key relationship is currently found within the eight-table scope.                      | Re-run these two read-only inspections immediately before application to detect drift.                                                         |

## 4. Impact simulation

The proposed SQL is a single transaction containing only `ENABLE ROW LEVEL
SECURITY` for the reviewed tables. The observed absence of policies and the
existing role attributes allow the following pre-application simulation without
changing the database.

| Access path                                | Current observed state                                                                         | Expected state immediately after the proposed migration                                 | Readiness conclusion                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Direct `anon`/`authenticated` table access | CRUD grants exist while RLS is disabled.                                                       | The same grants cannot return or modify rows because there is no applicable RLS policy. | This is the intended exposure reduction and must be proven with denied-access checks after application. |
| Table owner `postgres`                     | Owns all eight tables and does not have forced RLS.                                            | Continues to bypass policy enforcement because the migration does not force RLS.        | Expected to remain available for controlled administrative recovery.                                    |
| `service_role`                             | Has `BYPASSRLS`.                                                                               | Continues to bypass policy enforcement.                                                 | Expected to preserve a server path only if the deployed workload is shown to use this intended role.    |
| Deployed `DATABASE_URL` role               | Source confirms a server-only `DATABASE_URL` path, but its runtime role has not been observed. | Unknown until verified in the deployed runtime.                                         | **GO blocker:** do not apply until this role is proven to be the intended privileged path.              |
| Foreign-key integrity                      | No in-scope foreign-key relationship is currently reported.                                    | Unchanged; the migration neither changes constraints nor data.                          | No observed relationship-ordering risk.                                                                 |
| Existing RLS policy behavior               | No in-scope policy exists.                                                                     | No policy is created by the migration.                                                  | No observed policy merge or precedence risk.                                                            |

The design test confirms that the migration neither creates a direct-client
policy nor uses `FORCE ROW LEVEL SECURITY`. It also makes no grant, data,
methodology, or application change. [1]

## 5. Failure signals and rollback runbook

| Trigger                                                                   | Immediate containment                                            | Evidence to preserve                                                                                                  | Controlled recovery                                                                                                                                                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server-path smoke test cannot read or write a required operational record | Stop the rollout before any dependent release or data operation. | Timestamp, deployed commit, affected operation, sanitized server error, and current RLS state for the affected table. | With an explicit incident authorization, run a separate transaction that disables RLS only on the affected reviewed table or tables; then repeat the smoke test and record the result. |
| Direct `anon` or `authenticated` check can still access a row             | Stop the rollout and investigate before declaring success.       | Role used, operation attempted, table, result, current RLS state, and policy inventory.                               | Do **not** add a policy or grant ad hoc. Reinspect role/session identity and migration result; any policy design requires a new owner decision.                                        |
| Pre-application drift is detected                                         | Mark the review stale and do not run the migration.              | Changed table, owner, RLS flag, policy, grant, foreign key, or runtime connection-path evidence.                      | Repeat the read-only readiness review against the new state and obtain a fresh approval.                                                                                               |

The rollback command is not authorized by this review and must never be
pre-executed. Its bounded form is `ALTER TABLE public."<reviewed-table>" DISABLE
ROW LEVEL SECURITY` inside a separate explicit incident transaction. It does
not alter rows, contracts, methodology, valuation behavior, or data values, but
it does restore the prior access-control posture and therefore requires owner
authorization at the time of use.

## 6. Proposed staged-application gates

| Gate                       | Required evidence                                                                                                                                                       | Decision rule                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A — Owner authorization    | A second explicit owner decision naming the reviewed migration and its eight-table scope.                                                                               | No database command may be run without this approval.                                               |
| B — Freshness              | Repeat the read-only inventory of target tables, ownership, RLS flags, policies, grants, role attributes, and foreign-key relationships immediately before application. | Any drift makes this review stale and requires a renewed recommendation.                            |
| C — Server-path identity   | Non-secret, runtime evidence that the deployed server's `DATABASE_URL` path uses an intended privileged role or another explicitly approved RLS-safe access path.       | **Blocking.** The administrator's inspection session cannot satisfy this requirement.               |
| D — Release isolation      | The reviewed migration is byte-for-byte identical to the approved file and is the only database change in the release transaction.                                      | Any added grant, policy, forced-RLS clause, data operation, or unrelated migration is out of scope. |
| E — Immediate verification | Record the post-application RLS state, policy inventory, server smoke-test outcome, and direct-client denial outcome before declaring completion.                       | Failure invokes the documented containment and owner-authorized rollback path.                      |

### 6.1 Post-application acceptance record

The future application record must report these checks without storing a
connection string, token, or other credential.

| Check                 | Required passing result                                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope                 | RLS is enabled on exactly the eight reviewed tables; no ninth table is changed.                                                                                                    |
| Policy posture        | No direct-client policy is introduced by this migration.                                                                                                                           |
| Direct-client posture | A controlled `anon`/`authenticated` verification confirms that records are not readable or mutable through the direct table path.                                                  |
| Server path           | The existing server-only valuation, audit, rate-limit, and governance read paths complete their approved smoke tests using live evidence and no client-side valuation calculation. |
| Functional boundaries | No valuation output, methodology version, weight, coefficient, Core Type, or public API contract changes.                                                                          |
| Recovery readiness    | If a smoke test fails, the owner-authorized rollback procedure is available before any broader release action.                                                                     |

### 6.2 Approved runtime-role evidence mechanism (U-007)

The owner approved a narrowly bounded mechanism to obtain the missing evidence.
It extends the existing signed Netlify `deploySucceeded` event handler rather
than adding an HTTP path, tRPC procedure, client feature, or database write. On
an attested `main` production deployment only, the deployed server's existing
`DATABASE_URL` pool executes one read-only identity query and records only the
effective role, session role, whether they match, and the role's `rolsuper` and
`rolbypassrls` attributes. The record excludes the connection string, hostname,
database name, credentials, user input, valuation data, DLD evidence, and query
failure details. [5] [6]

The mechanism can record either `OBSERVED` or `UNAVAILABLE`; it does not apply
RLS, create a policy, change a grant, or make an RLS application decision. An
`UNAVAILABLE` record leaves Gate C blocked. Even an `OBSERVED` record supplies
only the runtime-role evidence for Gate C; Gates A, B, D, and E remain mandatory
and require their own fresh evidence and a second explicit owner approval.

## 7. Status

**CONDITIONAL NO-GO.** The database evidence confirms the eight-table scope,
current exposure, absence of policies, absence of in-scope foreign keys, and a
bounded rollback path. The approved U-007 mechanism may now collect the missing
runtime-role evidence on a future attested production deployment, but no such
observation exists in this record yet. The administrative inspection role must
not be treated as a substitute for that evidence. No application approval is
implied by this record.

## References

[1]: `supabase/migrations/20260821190000_enable_rls_application_tables.sql` — proposed, unapplied RLS design  
[2]: `docs/security/RLS-HARDENING-DESIGN-2026-08-21.md` — least-privilege policy design  
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security — RLS guidance  
[4]: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public — security advisor remediation reference
[5]: `netlify/functions/deploy-attestation.ts` — signed production deployment event and non-secret role-evidence record
[6]: `server/db.ts` — read-only deployed connection-role observation
