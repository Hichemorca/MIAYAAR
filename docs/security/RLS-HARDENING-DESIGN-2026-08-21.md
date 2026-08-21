# RLS Hardening Design — Review Required Before Production Application

**Status:** Designed and tested as repository policy; **not applied** to Supabase
**Date:** 2026-08-21
**Scope:** Enable Row Level Security (RLS) on the eight MIAYAAR application tables reported with RLS disabled.

## 1. Security objective

MIAYAAR uses a server-side PostgreSQL connection through `DATABASE_URL`; the browser reaches application data exclusively through the tRPC server. The database therefore does not need to expose any application table directly to Supabase `anon` or `authenticated` roles. [1]

The proposed migration enables RLS and creates **no direct-client policy**. In PostgreSQL, a table with RLS enabled and no applicable policy returns no rows and permits no data modification to roles that are subject to RLS. This gives direct client roles a default-deny posture without inventing per-user ownership rules that the current schema does not contain.

> This design is an access-control boundary, not a substitution for application authorization. tRPC still enforces the public, authenticated, and administrator procedure boundaries.

## 2. Scope

| Table                       | Sensitivity and role                       | Direct-client policy    | Server operation that must continue                      |
| --------------------------- | ------------------------------------------ | ----------------------- | -------------------------------------------------------- |
| `users`                     | OAuth identity, email, role                | No policy; default deny | User upsert and role lookup.                             |
| `methodologyVersions`       | Frozen release checksum and configuration  | No policy; default deny | Runtime release read and initial persistence.            |
| `valuationRequests`         | Property submissions and request lifecycle | No policy; default deny | Request create and status update.                        |
| `valuationAuditEvents`      | Append-only execution audit record         | No policy; default deny | Stage-event insertion.                                   |
| `marketTransactions`        | DLD evidence registry                      | No policy; default deny | Evidence, comparable, and market-context queries.        |
| `dldImportRuns`             | DLD import provenance                      | No policy; default deny | Ingestion provenance and administrative read model.      |
| `dldImportIssues`           | DLD import exception evidence              | No policy; default deny | Ingestion issue recording and administrative read model. |
| `valuationRateLimitWindows` | HMAC-keyed shared rate-limit counter       | No policy; default deny | Atomic counter update and bounded pruning.               |

The migration is intentionally limited to `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`. It does **not** modify table columns, data, indexes, constraints, database roles, grants, client credentials, application routes, methodology, valuation behavior, or audit contents.

## 3. Why the migration does not force RLS

PostgreSQL table owners and roles holding `BYPASSRLS` bypass RLS unless `FORCE ROW LEVEL SECURITY` is set. The existing deployed server role is carried in deployment credentials and has not been independently characterized as an owner, a bypass role, or a restricted application role. Applying `FORCE ROW LEVEL SECURITY` before that verification could stop valuation requests, audit writes, DLD queries, or shared rate limiting.

The migration therefore enables RLS without forcing it. This preserves the currently operating server path while preventing direct client access for ordinary Supabase client roles. A future role-separation migration may introduce restrictive server policies only after staging validation proves every required server operation under the intended database role.

## 4. Required review and staged validation

The migration file is stored at `supabase/migrations/20260821190000_enable_rls_application_tables.sql`. It must not be applied by CI, local development, or an unattended task. The owner must review and explicitly authorize database application after the following validation steps are complete.

| Step | Validation                                                                                                           | Expected result                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | Record the production connection role through an administrator connection using `select current_user, session_user`. | The deployed role is known and documented for the change record.                             |
| 2    | Check bypass attributes through `pg_roles` using an administrator connection.                                        | Whether the server role owns tables or has `BYPASSRLS` is known.                             |
| 3    | Apply the migration first to a compatible staging copy or approved controlled window.                                | Exactly the eight listed tables have `relrowsecurity = true`; `relforcerowsecurity = false`. |
| 4    | Exercise server valuation with evidence, insufficient evidence, and rejected evidence.                               | Request lifecycle and append-only audit writes continue.                                     |
| 5    | Exercise server evidence, comparable-selection, Market Intelligence, confidence, and rate-limit paths.               | Existing reads and atomic rate-limit writes continue.                                        |
| 6    | Test a direct Supabase `anon` and `authenticated` client against each table.                                         | No rows may be read or written; authorization errors are acceptable and expected.            |
| 7    | Inspect `pg_policies` for the eight tables.                                                                          | No direct-client policy has been introduced by this migration.                               |
| 8    | Capture results in the production change record.                                                                     | Owner can approve or reject production application with evidence.                            |

## 5. Validation queries for an authorized administrator

The following are review-time queries, not application code and not automated execution steps:

```sql
select current_user, session_user;

select rolname, rolbypassrls
from pg_roles
where rolname = current_user;

select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by c.relname;

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by tablename, policyname;
```

## 6. Explicit exclusions

This design does not grant a user access to their own valuation history because the product does not yet expose such a route or an approved ownership policy. It does not create public market-data access, data-import administration, RLS bypass mechanisms, a service-role credential in the client, or an administrator capability based on a database policy. It also does not apply the migration to Supabase.

## References

[1]: `../../server/db.ts` — Server-side PostgreSQL connection and application database operations
[2]: `../../drizzle/schema.ts` — Current application table schema and audit/provenance semantics
[3]: `../verification/2026-08-21-final-build-requirement-audit.md` — Final Build requirement audit and RLS baseline
