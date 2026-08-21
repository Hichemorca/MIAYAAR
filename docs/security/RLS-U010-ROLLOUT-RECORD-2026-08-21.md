# U-010 — Production RLS rollout record

**Status:** APPLIED WITH OWNER-ACCEPTED TEMPORARY EXCEPTION  
**Date:** 2026-08-21  
**Scope:** eight governed `public` application tables in Supabase project `lrfvfbjkojzlrriyjvrz`  
**Excluded from scope:** `DATABASE_URL`, credentials, table ownership, business data, valuation methodology, engine logic, API contracts, and client UI.

## 1. Authorised outcome

The owner authorised the staged U-010 rollout. The RLS-enablement migration was
applied first. The least-privilege application-role migration was then applied
atomically after two implementation corrections required by the constrained
Supabase migration executor: default privileges for the platform-owned role
cannot be altered by this executor, and it can create but cannot later alter
role attributes.

The final applied transaction created `miayaar_app`, revoked direct
`anon`/`authenticated` table privileges, granted only the reviewed operations
to `miayaar_app`, and created the server-only RLS policies. No production data
was changed by these schema and privilege operations.

| Acceptance area         | Verified production result                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Role present            | `miayaar_app` exists.                                                                                                                                                                      |
| Role privilege boundary | `rolsuper=false`, `rolcreatedb=false`, `rolcreaterole=false`, `rolinherit=false`, `rolreplication=false`, and `rolbypassrls=false`.                                                        |
| RLS state               | RLS is enabled for `users`, `methodologyVersions`, `valuationRequests`, `valuationAuditEvents`, `marketTransactions`, `dldImportRuns`, `dldImportIssues`, and `valuationRateLimitWindows`. |
| Policy state            | Seven explicit `miayaar_app` policies cover only the reviewed server operations; `dldImportIssues` intentionally has no application-role policy or grant.                                  |
| Direct client access    | No direct table privilege remains for `anon` or `authenticated` on the eight governed tables.                                                                                              |
| Application smoke test  | Production `valuation.run` returned a real v1.2 partial report for a valid public request after the rollout.                                                                               |
| Runtime connection      | Unchanged: the deployed application still connects as `postgres`, whose observed `rolbypassrls=true` continues to bypass RLS.                                                              |

## 2. Accepted temporary LOGIN exception

The approved target posture for `miayaar_app` is `NOLOGIN`. The applied role
instead has `LOGIN` with `PASSWORD NULL`, because the owner-approved migration
used a guarded `CREATE ROLE ... LOGIN PASSWORD NULL` statement and the available
Supabase executor cannot execute a subsequent `ALTER ROLE` correction.

The owner explicitly accepted this as a **temporary technical exception** for
U-010, subject to the following boundaries.

1. The rollout did not create, store, or place a password in repository files,
   environment variables, or the migration; `PASSWORD NULL` is the observed
   role attribute.
2. This acceptance does not treat `LOGIN` as equivalent to the final `NOLOGIN`
   target, nor does it authorise use of the role as an application connection.
3. The final correction to `NOLOGIN` requires a separately scoped,
   owner-approved database-administrator operation. It must not be attempted
   through the current constrained migration executor or by silently dropping
   and recreating the role.
4. This exception does not change the current RLS policy set, the direct-client
   privilege revocations, or the role's `NOBYPASSRLS` attribute.

> The role's temporary LOGIN capability is an accepted deviation, not an
> assertion that the target hardening has been fully achieved. No claim is made
> here about authentication methods controlled outside this migration.

## 3. Explicit residual limits

RLS is now active for the governed tables, but it is not yet enforced against
the live application session because `DATABASE_URL` continues to use the
observed `postgres` role with `BYPASSRLS`. Changing the runtime connection,
provisioning a credential, or adding a role membership remains outside U-010 and
requires a separate owner decision and a new acceptance/rollback plan.

The Supabase migration executor also cannot harden the platform-owned role's
default privileges for future `public` relations. New table grants and policies
must therefore remain explicit governed migrations until a separately approved
platform-privileged default-privilege operation is available.

## 4. Rollback posture

No rollback was required: all accepted U-010 controls and the production
valuation smoke test passed. The permanent `NOLOGIN` correction is not a
rollback and must be handled as a future database-administrator phase. The
existing rollback boundary remains: do not drop `miayaar_app`, disable RLS,
remove policies, alter ownership, or change data automatically.

## 5. Evidence references

This record is read together with the applied migration
`supabase/migrations/20260821200000_prepare_least_privilege_application_role_and_rls.sql`,
the initial RLS migration
`supabase/migrations/20260821190000_enable_rls_application_tables.sql`, and the
implementation package
`docs/security/RLS-APPLICATION-ROLE-IMPLEMENTATION-PACKAGE-2026-08-21.md`.
