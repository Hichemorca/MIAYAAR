-- MIAYAAR U-010 — PREPARED ONLY. DO NOT APPLY WITHOUT A SEPARATE OWNER DECISION.
--
-- This transaction prepares the runtime role and RLS controls documented in
-- docs/security/RLS-APPLICATION-ROLE-IMPLEMENTATION-PACKAGE-2026-08-21.md.
-- It must be applied only after an operator has received a separate approval to
-- change the server connection secret and to run production migrations.
--
-- The role is created with PASSWORD NULL. This file neither knows nor stores a
-- credential. A privileged operator must establish the credential outside this
-- repository during an explicitly approved rollout.

begin;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'miayaar_app') then
    create role miayaar_app
      login
      password null
      nosuperuser
      nocreatedb
      nocreaterole
      noinherit
      noreplication
      nobypassrls;
  end if;
end
$$;

alter role miayaar_app
  login
  nosuperuser
  nocreatedb
  nocreaterole
  noinherit
  noreplication
  nobypassrls;

grant usage on schema public to miayaar_app;

-- Revoke direct-client and broad application-role access before granting only
-- the table operations exercised by the live server code.
revoke all privileges on table public."users" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."methodologyVersions" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."valuationRequests" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."valuationAuditEvents" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."marketTransactions" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."dldImportRuns" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."dldImportIssues" from public, anon, authenticated, miayaar_app;
revoke all privileges on table public."valuationRateLimitWindows" from public, anon, authenticated, miayaar_app;

grant select, insert, update on table public."users" to miayaar_app;
grant select, insert, update on table public."methodologyVersions" to miayaar_app;
grant insert, update on table public."valuationRequests" to miayaar_app;
grant insert on table public."valuationAuditEvents" to miayaar_app;
grant select on table public."marketTransactions" to miayaar_app;
grant select on table public."dldImportRuns" to miayaar_app;
grant select, insert, update, delete on table public."valuationRateLimitWindows" to miayaar_app;

revoke all privileges on sequence public."users_id_seq" from public, anon, authenticated, miayaar_app;
revoke all privileges on sequence public."methodologyVersions_id_seq" from public, anon, authenticated, miayaar_app;
revoke all privileges on sequence public."valuationAuditEvents_id_seq" from public, anon, authenticated, miayaar_app;
revoke all privileges on sequence public."marketTransactions_id_seq" from public, anon, authenticated, miayaar_app;
revoke all privileges on sequence public."dldImportIssues_id_seq" from public, anon, authenticated, miayaar_app;

grant usage, select on sequence public."users_id_seq" to miayaar_app;
grant usage, select on sequence public."methodologyVersions_id_seq" to miayaar_app;
grant usage, select on sequence public."valuationAuditEvents_id_seq" to miayaar_app;

-- The configured Supabase migration executor cannot alter default privileges
-- of the platform-owned `postgres` role. Default-privilege hardening for future
-- relations is therefore a separate platform-privileged follow-up. No future
-- table is implicitly granted to `miayaar_app`; every future application grant
-- and policy still needs its own governed migration.

-- Existing direct-client grants inherited from the platform default privileges
-- must not coexist with this server-only RLS boundary.
revoke all privileges on table public."users" from anon, authenticated;
revoke all privileges on table public."methodologyVersions" from anon, authenticated;
revoke all privileges on table public."valuationRequests" from anon, authenticated;
revoke all privileges on table public."valuationAuditEvents" from anon, authenticated;
revoke all privileges on table public."marketTransactions" from anon, authenticated;
revoke all privileges on table public."dldImportRuns" from anon, authenticated;
revoke all privileges on table public."dldImportIssues" from anon, authenticated;
revoke all privileges on table public."valuationRateLimitWindows" from anon, authenticated;

alter table public."users" enable row level security;
alter table public."methodologyVersions" enable row level security;
alter table public."valuationRequests" enable row level security;
alter table public."valuationAuditEvents" enable row level security;
alter table public."marketTransactions" enable row level security;
alter table public."dldImportRuns" enable row level security;
alter table public."dldImportIssues" enable row level security;
alter table public."valuationRateLimitWindows" enable row level security;

-- The runtime service is a server-only application identity. These policies
-- authorize only the explicit operations granted above; no policy authorizes
-- anon, authenticated, public, or the dedicated DLD import path.
create policy "miayaar_app_users_access"
  on public."users"
  for all
  to miayaar_app
  using (true)
  with check (true);

create policy "miayaar_app_methodology_versions_access"
  on public."methodologyVersions"
  for all
  to miayaar_app
  using (true)
  with check (true);

create policy "miayaar_app_valuation_requests_write"
  on public."valuationRequests"
  for all
  to miayaar_app
  using (true)
  with check (true);

create policy "miayaar_app_valuation_audit_insert"
  on public."valuationAuditEvents"
  for insert
  to miayaar_app
  with check (true);

create policy "miayaar_app_market_transactions_read"
  on public."marketTransactions"
  for select
  to miayaar_app
  using (true);

create policy "miayaar_app_dld_import_runs_read"
  on public."dldImportRuns"
  for select
  to miayaar_app
  using (true);

create policy "miayaar_app_rate_limit_windows_access"
  on public."valuationRateLimitWindows"
  for all
  to miayaar_app
  using (true)
  with check (true);

commit;
