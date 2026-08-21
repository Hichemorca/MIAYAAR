# RLS Connection-Role Strategy Review — U-009

**Date:** 2026-08-21  
**Status:** `CONDITIONAL NO-GO`  
**Scope:** Read-only production review and transition design only.  
**Author:** Manus AI

## Decision Context

The production deploy-attestation evidence for commit `78fae457c9147c0c20066e5fc37f9e0c1ecc0ec4` observed `postgres` as both the effective and session connection role. Its reported attributes were `rolsuper=false` and `rolbypassrls=true`. PostgreSQL states that roles with `BYPASSRLS` always bypass row-security policies; this means the existing server connection would not be constrained by RLS even if RLS were enabled on the application tables.[1] [2]

This review records the connection-role blocker discovered after U-007/U-008. It does **not** apply the existing RLS migration, alter a role, alter a grant, change `DATABASE_URL`, read a credential, change Supabase, or modify application behaviour.

## Production Read-Only Inventory

The production inventory was collected through read-only catalog queries against the configured Supabase project. It contains role attributes, ownership, RLS state, policy counts, table grants, default privileges, public sequences, and static server dependency review. No application records were selected.

<!-- prettier-ignore -->
| Inventory item | Observed state | Security significance |
|---|---|---|
| Runtime database role | `current_user=postgres`; `session_user=postgres`; both match | The server uses a direct privileged connection rather than a dedicated application identity. |
| Runtime RLS attribute | `rolbypassrls=true`; `rolsuper=false` | RLS cannot constrain queries executed under the observed connection role.[1] [2] |
| Application-table ownership | All eight reviewed tables are owned by `postgres` | A table owner can normally bypass row security unless row security is forced; ownership must be separated from the runtime role in a least-privilege design.[1] |
| RLS state | Each of the eight tables has `rls_enabled=false`, `force_rls=false`, and zero policies | The current schema has no active row-security barrier on these tables. |
| Direct-role table grants | `anon`, `authenticated`, `service_role`, and `postgres` each hold full table privileges on every reviewed table | The pre-existing privilege surface is broader than the intended public/API exposure boundary. |
| Default privileges in `public` | `postgres` defaults grant full table and sequence privileges, plus function execution, to `anon`, `authenticated`, and `service_role` | A future hardening migration must address defaults as well as existing objects, otherwise newly created objects can reintroduce broad grants. |
| Public identity sequences | Five public sequences are owned by `postgres` | Any future inserting application role needs only the sequence privileges required by the columns it actually writes. |
| Database-client dependency | `server/db.ts` is the single static use of `DATABASE_URL`, creates the `pg` pool, and is the shared path for the reviewed server operations | A runtime-role change is centralised to the secret/connection boundary; it is not a client-side change. |

## Application Access Requirements Observed in Code

The following matrix is a static description of helper operations present in `server/db.ts`. It is an inventory, not an authorization decision. The final policy and per-table/column grants require an owner-approved implementation scope.

<!-- prettier-ignore -->
| Table | Observed server operations | Implication for a future non-bypass runtime role |
|---|---|---|
| `users` | Lookup by `openId`; insert-or-update during OAuth user upsert | Requires a narrowly tested read/write policy and only the insert/update privileges actually used. |
| `methodologyVersions` | Read for governance; helper exists for insert-or-update | The runtime use of the write helper needs confirmation before granting write access. |
| `valuationRequests` | Insert request; update completion status | Requires controlled insert/update access and an RLS policy compatible with the request/audit lifecycle. |
| `valuationAuditEvents` | Insert audit event | Requires controlled append access; no generic delete or truncate requirement was observed. |
| `marketTransactions` | Read for valuation, comparables, Market Intelligence, Evidence Integrity, and governance facts | Requires read access only for the present server paths; DLD import write workflows are not part of this review. |
| `dldImportRuns` | Read latest import in governance snapshot | Requires read access only for the present server path. |
| `dldImportIssues` | No active server helper was identified in the reviewed runtime file | Requires separate confirmation before any future runtime-role grant. |
| `valuationRateLimitWindows` | Prune expired rows; insert-or-update counter | Requires controlled insert/update/delete access limited to the rate-limit workflow. |

## Assessment of the Existing RLS Migration

The reviewed migration `20260821190000_enable_rls_application_tables.sql` only enables RLS. It deliberately creates no policies. That behaviour blocks direct `anon` and `authenticated` access after RLS is enabled, but it leaves the current `postgres`/`BYPASSRLS` application connection unaffected.

If a future application connection changes to a non-bypass, non-owner role before compatible policies are introduced, the policy-free migration would deny that role's table access and can interrupt the server. Consequently, the existing migration must **not** be applied as a stand-alone step in a future connection-role transition.

> **U-009 gate conclusion:** The database role, least-privilege grants, and RLS policies must be designed and tested as one controlled change set. Enabling RLS alone does not satisfy the intended enforcement outcome for the observed connection and can cause an outage for a replacement non-bypass role.

## Transition Options Considered

<!-- prettier-ignore -->
| Option | Description | U-009 assessment |
|---|---|---|
| A — Dedicated non-bypass application login role | Introduce a dedicated, non-owner, non-superuser, `NOBYPASSRLS` role with only approved schema, table, sequence, and function privileges. Pair it with explicit RLS policies, then point the server connection at it after verification. | **Only eligible design direction.** It can make RLS applicable to application queries, subject to a separate approved implementation and policy set. |
| B — Keep the `postgres` connection and enable RLS | Apply the existing policy-free RLS migration while leaving the server connection unchanged. | **Rejected.** The observed `BYPASSRLS` attribute prevents RLS from constraining the server role. |
| C — Retain a privileged credential and switch role at runtime | Connect with `postgres` and rely on a runtime role change. | **Rejected for least privilege.** The long-lived connection credential remains able to assume privileged access; it does not meet the objective of a dedicated constrained connection identity. |

The review deliberately does not name, create, or configure a new production role. This prevents accidental introduction of a new vocabulary, credential, privilege set, or migration before an owner-approved implementation scope exists.

## Required Acceptance Gates for a Future Implementation Scope

Before any RLS/connection-role implementation can move from `CONDITIONAL NO-GO`, all of the following must be specified, implemented in a controlled change set, and evidenced in production:

1. The server's effective and session roles are the approved dedicated application role, match one another, are not a table owner, and report `rolsuper=false` and `rolbypassrls=false`.
2. Every required server operation has an explicit, reviewed table/column privilege and RLS policy. No unexplained `DELETE`, `TRUNCATE`, `REFERENCES`, `TRIGGER`, or broad `ALL` grant remains for the application role.
3. The eight existing tables have RLS enabled with the approved policies, and new-object default privileges cannot recreate the current broad public grants.
4. Direct `anon` and `authenticated` access is denied unless a separately approved policy explicitly permits a documented use case.
5. A controlled verification proves the public `valuation.run` path, administrative governance reads, OAuth user upsert, audit persistence, and shared rate limiter still operate as designed; no valuation output, methodology, weight, coefficient, comparable-selection rule, or API contract changes.
6. The actual change order and rollback runbook are approved. Any rollback that restores the present `postgres` credential restores application availability but also restores RLS bypass, so it is an emergency availability action rather than a successful security state.

## Recommended Next Governance Decision

No technical implementation should start automatically after this review. The owner must decide whether to authorize a separate implementation scope that includes: a dedicated non-bypass application connection role; an explicit privilege matrix; explicit RLS policies compatible with the server workflows; corrected default privileges; test evidence; staged production rollout; and rollback approval.

## References

[1]: https://www.postgresql.org/docs/current/ddl-rowsecurity.html "PostgreSQL — Row Security Policies"
[2]: https://www.postgresql.org/docs/current/role-attributes.html "PostgreSQL — Role Attributes"
[3]: https://www.postgresql.org/docs/current/sql-grant.html "PostgreSQL — GRANT"
