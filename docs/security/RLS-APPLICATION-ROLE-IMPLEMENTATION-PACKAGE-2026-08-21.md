# RLS application-role implementation package — U-010

**Status:** **PREPARED / NOT APPLIED.** This package is a review artifact. It
does not authorize any database change, connection-secret change, deployment,
or production use of the new role.

## 1. Purpose and governing evidence

The U-007 production role evidence observed `current_user=postgres` and
`session_user=postgres`, with `rolsuper=false` and `rolbypassrls=true`. The
U-009 review established that the current role owns the eight reviewed tables,
that RLS is disabled, and that the runtime server needs both reads and narrowly
defined writes. A role with `BYPASSRLS` bypasses row-security policies, so
enabling RLS while retaining this connection would not meet the intended control
boundary. [PostgreSQL row security][postgres-row-security]

This package therefore prepares one server-only role, `miayaar_app`, which is
not a table owner, is not a superuser, is `NOINHERIT`, and is `NOBYPASSRLS`. It
does not add a direct-client path. The platform's server-only valuation boundary
and the existing RLS readiness review remain authoritative.

## 2. Prepared artifacts

| Artifact                                                              | Purpose                                                                                                      | Application status |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| `20260821200000_prepare_least_privilege_application_role_and_rls.sql` | Creates or hardens the role, restricts table/sequence access, enables RLS, and defines policies.             | **Not applied**    |
| `rls-hardening-design.test.ts`                                        | Ensures the migration remains explicit about role attributes, table coverage, policies, and non-application. | Runs in CI only    |
| This document                                                         | Defines preconditions, acceptance checks, rollback, and known boundaries.                                    | Documentation only |

The migration creates a login role with `PASSWORD NULL` only when it does not
already exist. No password or connection string appears in repository files. A
privileged operator must establish its credential through the approved secret
management path only after a separate owner decision. Its default-privilege
statements intentionally operate as the authenticated migration executor rather
than naming `postgres` as a separate role, because Supabase grants that executor
role-creation authority without superuser authority to alter another role's
default privileges.

## 3. Least-privilege matrix

| Relation                    | `miayaar_app` privilege                | Runtime reason                                                           | RLS policy            | Explicitly excluded                                 |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------ | --------------------- | --------------------------------------------------- |
| `users`                     | `SELECT`, `INSERT`, `UPDATE`           | OAuth user lookup and controlled upsert of the current identity.         | `FOR ALL`             | `DELETE`, `TRUNCATE`, ownership                     |
| `methodologyVersions`       | `SELECT`, `INSERT`, `UPDATE`           | Read frozen release; limited canonical upsert when absent.               | `FOR ALL`             | `DELETE`, `TRUNCATE`, ownership                     |
| `valuationRequests`         | `INSERT`, `UPDATE`                     | Persist request then record terminal status.                             | `FOR ALL`             | `SELECT`, `DELETE`, `TRUNCATE`, ownership           |
| `valuationAuditEvents`      | `INSERT`                               | Append the server decision trail.                                        | `FOR INSERT`          | `SELECT`, `UPDATE`, `DELETE`, `TRUNCATE`, ownership |
| `marketTransactions`        | `SELECT`                               | Comparable selection, Market Intelligence, and Evidence Integrity reads. | `FOR SELECT`          | all write operations, ownership                     |
| `dldImportRuns`             | `SELECT`                               | Read latest import provenance for the governance surface.                | `FOR SELECT`          | all write operations, ownership                     |
| `dldImportIssues`           | none                                   | No live application helper accesses this relation.                       | no application policy | all operations                                      |
| `valuationRateLimitWindows` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | Atomic public-valuation rate-limit window upsert and bounded pruning.    | `FOR ALL`             | `TRUNCATE`, ownership                               |

The role receives `USAGE, SELECT` only on the three observed sequences used by
runtime inserts: `users_id_seq`, `methodologyVersions_id_seq`, and
`valuationAuditEvents_id_seq`. It receives no access to DLD import sequences.
The standalone DLD ingestion script is intentionally out of scope: it remains a
separate operational path and must receive its own governed role decision if its
connection is ever separated from the current privileged operator role.

## 4. Policy boundary

The application uses one trusted server identity; no established runtime
attribute supplies a row-level user or tenant identity to PostgreSQL. The
prepared policies therefore allow the **server-only role** to execute only the
operation class listed in the table above. They do not assert per-user ownership
or introduce a new business access rule. `anon`, `authenticated`, `public`, and
the DLD ingestion path receive no policy in this package.

This is deliberate: inventing a row predicate without an approved, propagated
identity claim would be a policy invention and could deny valid server work or
create a false isolation claim. Any future direct-client or user-scoped data
model requires a separate policy decision and cannot reuse these policies by
assumption.

## 5. Required approval and staged rollout

No item below is authorized by preparation or by a PR merge. A **second explicit
owner decision** is required before a privileged operator may perform the steps.

1. Review the migration SQL, this matrix, and the absence of direct-client data
   access in the deployed application.
2. Confirm that the existing `postgres` connection is retained as the immediate
   operational rollback route and that no simultaneous schema or methodology
   change is bundled.
3. Apply both the existing RLS-enable migration and the U-010 migration through
   the approved production migration path, as one controlled database release.
4. Provision the new role's credential outside version control, update the
   server-side connection secret through the approved secret-management flow,
   and deploy the application connection change.
5. Use the protected governance role-evidence surface to prove
   `effectiveRole=miayaar_app`, `sessionRole=miayaar_app`, `rolsuper=false`, and
   `rolbypassrls=false`.
6. Run the approved smoke checks for login/user synchronization, frozen
   methodology resolution, public `valuation.run`, audit append, rate limiting,
   comparable evidence reads, Market Intelligence, Evidence Integrity, and the
   governance read model. Confirm that direct client access remains denied.
7. Record the release result and retain the existing `postgres` connection only
   as the documented rollback path until a later hardening decision changes it.

## 6. Acceptance criteria

The change may be considered effective only if all of the following are true.

- The role-evidence query returns the four values in step 5 exactly.
- Each application operation in the matrix succeeds through the deployed server.
- The DLD import path has not received application-role grants implicitly.
- `anon` and `authenticated` have no table privilege or RLS policy on the eight
  relations.
- No connection URL, password, host, or query text is surfaced in logs, UI, API
  responses, source control, or documentation.
- The migration verification includes default privileges for relations created
  by `postgres` in `public` after the cutover.

## 7. Rollback boundary

If any acceptance check fails after a separately authorized rollout, first
restore the previously approved server-side connection secret and redeploy that
connection only. This returns the runtime path to its known `postgres` behavior
while preserving tables and evidence for diagnosis. Do **not** drop
`miayaar_app`, disable RLS, remove policies, change table ownership, or alter
data as an automatic rollback action. Any database rollback SQL requires a new
review and explicit owner decision because it may weaken an active security
boundary.

## 8. Explicit non-go items

- No SQL in this package has been applied to Supabase.
- No `DATABASE_URL`, secret, password, role membership, table ownership, or
  deployment configuration has been changed.
- `FORCE ROW LEVEL SECURITY` is intentionally absent; this package does not
  redefine owner behavior.
- No valuation methodology, weights, coefficients, comparables, Market
  Intelligence output, Evidence Integrity result, API contract, or client UI
  behavior has changed.
- This package does not authorize production rollout. The RLS gate remains
  **CONDITIONAL NO-GO** until the separate rollout decision and acceptance
  checks are complete.

[postgres-row-security]: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
