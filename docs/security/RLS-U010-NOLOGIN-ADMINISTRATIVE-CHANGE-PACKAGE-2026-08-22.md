# U-010 — NOLOGIN administrative change package

**Status:** PREPARED FOR DATABASE ADMINISTRATOR / SUPABASE SUPPORT EXECUTION ONLY  
**Date:** 2026-08-22  
**Requested change:** set `miayaar_app.rolcanlogin` from `true` to `false`  
**Execution authority:** Database Administrator or Supabase Support with role-attribute administration authority

## 1. Strict boundary

This package is limited to the existing `miayaar_app` role. It does not modify
application code, a repository migration, `DATABASE_URL`, a password,
membership, object grants, RLS state, RLS policies, table ownership, schema, or
business data. It must not be executed through the constrained Supabase
migration executor that applied U-010.

The only intended database-state difference is:

| Attribute                                | Required pre-change value | Required post-change value |
| ---------------------------------------- | ------------------------: | -------------------------: |
| `pg_roles.rolcanlogin` for `miayaar_app` |                    `true` |                    `false` |

No `DROP ROLE`, `CREATE ROLE`, password change, membership change, grant,
revoke, policy change, RLS alteration, or automatic reversion to `LOGIN` is
authorised. Any future reversion to `LOGIN` requires a separate owner decision
and a documented operational reason.

## 2. Why the current executor cannot apply the correction

The observed Supabase migration executor had sufficient authority to create
`miayaar_app` but failed atomically when attempting to alter its role attributes.
The role-attribute operation is controlled by a platform-managed hierarchy that
the executor cannot administer. This was observed during U-010 while the
executor was able to apply the table grants and RLS policies. The correct
remedy is therefore a narrowly authorised administrative operation, not a
repository migration workaround, role recreation, or application change.

> This package does not assert that the constrained executor can apply the
> statement below. It explicitly requires a Database Administrator or Supabase
> Support operator with the necessary role-administration authority.

## 3. Pre-check SQL — capture before the administrative change

Run the following as a read-only evidence collection. Save its complete result
with the change ticket. The policy query is intentionally detailed so the
post-change output can be compared for equality; the role-change statement must
not affect any of those rows.

```sql
begin read only;

-- A. Record all security-relevant role attributes. Do not query credentials.
select
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolinherit,
  rolreplication,
  rolbypassrls
from pg_roles
where rolname = 'miayaar_app';

-- B. Confirm that the role has no role memberships.
select
  parent.rolname as member_of,
  member.rolname as member_name,
  membership.admin_option
from pg_auth_members as membership
join pg_roles as parent on parent.oid = membership.roleid
join pg_roles as member on member.oid = membership.member
where member.rolname = 'miayaar_app'
order by parent.rolname;

-- C. Record the exact table and sequence privileges currently held by the role.
select
  table_name,
  privilege_type
from information_schema.role_table_grants
where grantee = 'miayaar_app'
  and table_schema = 'public'
  and table_name in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by table_name, privilege_type;

select
  object_name as sequence_name,
  privilege_type
from information_schema.role_usage_grants
where grantee = 'miayaar_app'
  and object_schema = 'public'
  and object_name in (
    'users_id_seq',
    'methodologyVersions_id_seq',
    'valuationAuditEvents_id_seq',
    'marketTransactions_id_seq',
    'dldImportIssues_id_seq'
  )
order by sequence_name, privilege_type;

-- D. Record RLS state and every policy definition on the eight governed tables.
select
  tablename,
  rowsecurity,
  forcerowsecurity
from pg_tables
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
order by tablename;

select
  table_name,
  policy_name,
  permissive,
  roles,
  command,
  qual,
  with_check
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
order by table_name, policy_name;

-- E. Confirm that direct client roles retain no table privilege.
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and table_schema = 'public'
  and table_name in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by grantee, table_name, privilege_type;

commit;
```

The expected result for membership is **zero rows**. The direct-client grant
query is also expected to return **zero rows**. The other pre-check queries are
the immutable comparison baseline for the post-check, except for the single
approved `rolcanlogin` value.

## 4. Administrative execution SQL — only statement

Run this statement **once**, after the pre-check evidence has been retained and
only while acting with the approved Database Administrator or Supabase Support
authority.

```sql
ALTER ROLE miayaar_app NOLOGIN;
```

## 5. Post-check SQL — prove the sole intended delta

Run the following immediately after the administrative statement. Save its
complete result beside the pre-check evidence.

```sql
begin read only;

-- A. The only approved attribute difference is rolcanlogin=false.
select
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolinherit,
  rolreplication,
  rolbypassrls
from pg_roles
where rolname = 'miayaar_app';

-- B. Membership must remain empty.
select
  parent.rolname as member_of,
  member.rolname as member_name,
  membership.admin_option
from pg_auth_members as membership
join pg_roles as parent on parent.oid = membership.roleid
join pg_roles as member on member.oid = membership.member
where member.rolname = 'miayaar_app'
order by parent.rolname;

-- C. Object grants must match the captured pre-check output exactly.
select
  table_name,
  privilege_type
from information_schema.role_table_grants
where grantee = 'miayaar_app'
  and table_schema = 'public'
  and table_name in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by table_name, privilege_type;

select
  object_name as sequence_name,
  privilege_type
from information_schema.role_usage_grants
where grantee = 'miayaar_app'
  and object_schema = 'public'
  and object_name in (
    'users_id_seq',
    'methodologyVersions_id_seq',
    'valuationAuditEvents_id_seq',
    'marketTransactions_id_seq',
    'dldImportIssues_id_seq'
  )
order by sequence_name, privilege_type;

-- D. RLS state and policy definitions must match the pre-check output exactly.
select
  tablename,
  rowsecurity,
  forcerowsecurity
from pg_tables
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
order by tablename;

select
  table_name,
  policy_name,
  permissive,
  roles,
  command,
  qual,
  with_check
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
order by table_name, policy_name;

-- E. Direct-client grants must remain absent.
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and table_schema = 'public'
  and table_name in (
    'users',
    'methodologyVersions',
    'valuationRequests',
    'valuationAuditEvents',
    'marketTransactions',
    'dldImportRuns',
    'dldImportIssues',
    'valuationRateLimitWindows'
  )
order by grantee, table_name, privilege_type;

commit;
```

The change is accepted only when the role query returns `rolcanlogin=false` and
`rolbypassrls=false`; the membership and direct-client queries both return zero
rows; and every other post-check row matches its pre-check counterpart exactly.

## 6. Application non-impact verification

The production application is still configured to connect as `postgres` with
`BYPASSRLS`; this package explicitly leaves `DATABASE_URL` unchanged. The
administrative statement therefore cannot alter the deployed application's
connection identity, database schema, grants, RLS policies, or valuation logic.

After the Database Administrator has completed the post-check, record the
existing production build identity with this read-only request:

```bash
curl -fsS https://miayaar.netlify.app/_miayaar/build
```

This is the permitted application non-impact evidence for this narrowly scoped
change. Do not invoke `valuation.run` solely for this change record because it
is unnecessary to prove an isolated role-login attribute change and may create
normal application audit activity.

## 7. Concise change record

| Field                       | Record                                                                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change ID                   | U-010-NOLOGIN-ADMINISTRATIVE                                                                                                                                                                 |
| Executor                    | Named Database Administrator or Supabase Support operator only                                                                                                                               |
| Intended database delta     | `miayaar_app.rolcanlogin: true → false`                                                                                                                                                      |
| SQL executed                | `ALTER ROLE miayaar_app NOLOGIN;`                                                                                                                                                            |
| Required unchanged controls | `rolbypassrls=false`; all other listed role attributes; memberships; grants; RLS state; RLS policies; direct-client grant absence; application connection identity                           |
| Explicitly excluded         | `DATABASE_URL`, passwords, role recreation, `DROP ROLE`, `CREATE ROLE`, membership, grants, policies, schema, data, application code, migration files, valuation engine, methodology, and UI |
| Reversion                   | Prohibited by default. `LOGIN` may be restored only with a separate owner decision and documented operational cause.                                                                         |

## 8. Completion boundary

This repository package is not a request to execute production SQL through the
available connector. It is complete when the Database Administrator or Supabase
Support operator receives the pre-check, change, and post-check instructions.
The database change itself remains pending until such an authorised operator
executes it and retains the requested evidence.
