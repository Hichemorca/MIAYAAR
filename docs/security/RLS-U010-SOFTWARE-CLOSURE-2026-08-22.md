# U-010 — Software closure decision

**Status:** CLOSED AS SOFTWARE-DELIVERED  
**Date:** 2026-08-22  
**Owner decision:** U-010 is complete as a programmatic RLS-hardening delivery.

## 1. Closure statement

U-010 is closed for software delivery. Its applied scope consists of the eight
governed tables' RLS enablement, explicit server-only RLS policies,
least-privilege `miayaar_app` grants, and revocation of direct
`anon`/`authenticated` table privileges. The applied result, verification
evidence, and the accepted temporary `LOGIN + PASSWORD NULL` exception are
recorded in `RLS-U010-ROLLOUT-RECORD-2026-08-21.md`.

The programmatic closure does not restate the final hardening target as already
achieved. The current `miayaar_app` role remains `LOGIN + PASSWORD NULL`; the
single required correction is `rolcanlogin: true → false` through an authorised
Database Administrator or Supabase Support operator. That administrative task
is prepared but deliberately **not executed** in
`RLS-U010-NOLOGIN-ADMINISTRATIVE-CHANGE-PACKAGE-2026-08-22.md`.

| Area                                   | Closure state                              | Boundary retained                                                                                                                           |
| -------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| U-010 software delivery                | **Closed**                                 | No further repository, migration, policy, grant, or application changes are authorised under U-010.                                         |
| `miayaar_app` NOLOGIN                  | **Deferred administrative follow-up**      | Only `ALTER ROLE miayaar_app NOLOGIN;` may be executed by an appropriately privileged operator after a separately authorised change window. |
| Runtime application identity           | **Unchanged and outside closure**          | `DATABASE_URL` remains unchanged; no credential, role membership, or application connection transition is authorised.                       |
| Future public-table default privileges | **Deferred platform-privileged follow-up** | New table grants and policies remain explicit governed migrations until a separately authorised platform operation exists.                  |

## 2. Non-claims

This closure does not claim that the live application session is now constrained
by RLS. The current application connection remains the observed `postgres` role
with `BYPASSRLS`; moving the runtime connection to `miayaar_app` is a separate
security decision with its own acceptance and rollback requirements.

This closure does not authorise `DROP ROLE`, `CREATE ROLE`, password changes,
role membership changes, grant changes, RLS-policy changes, schema changes, or
any return to `LOGIN`. A return to `LOGIN` requires a new owner decision and a
documented operational reason.

## 3. Return to the build track

Security work under U-010 no longer blocks the repository's programmatic RLS
delivery. MIAYAAR returns to its governed build track, whose strategic context
is recorded in `docs/PRODUCT-ROADMAP.md`. That roadmap is not an implementation
backlog; it does not itself authorise a next build phase. No valuation engine,
methodology, data pipeline, API, UI, or other construction phase starts from
this closure without a new explicit owner scope and approval.

## 4. Related records

| Record                                                         | Purpose                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `RLS-U010-ROLLOUT-RECORD-2026-08-21.md`                        | Applied production controls, verification evidence, and temporary LOGIN exception. |
| `RLS-U010-NOLOGIN-ADMINISTRATIVE-CHANGE-PACKAGE-2026-08-22.md` | Administrator-only NOLOGIN command, pre-checks, post-checks, and change record.    |
| `RLS-APPLICATION-ROLE-IMPLEMENTATION-PACKAGE-2026-08-21.md`    | Historical preparation and acceptance-gate context.                                |
| `docs/PRODUCT-ROADMAP.md`                                      | Strategic product context only; it is not an execution authority.                  |
