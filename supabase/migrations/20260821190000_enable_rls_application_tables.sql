-- MIAYAAR RLS hardening — REVIEW REQUIRED BEFORE PRODUCTION APPLICATION.
--
-- Scope: enable PostgreSQL Row Level Security on the eight application tables
-- currently reported without RLS. This migration deliberately creates no
-- direct-client policies: PostgreSQL therefore denies rows to `anon` and
-- `authenticated` even if table privileges were granted elsewhere.
--
-- The deployed server connects using DATABASE_URL. Table owners and roles with
-- BYPASSRLS retain their existing server-side access because this migration does
-- not FORCE ROW LEVEL SECURITY. Validate the production connection role before
-- applying; do not apply this file automatically from CI or a development tool.

begin;

alter table public."users" enable row level security;
alter table public."methodologyVersions" enable row level security;
alter table public."valuationRequests" enable row level security;
alter table public."valuationAuditEvents" enable row level security;
alter table public."marketTransactions" enable row level security;
alter table public."dldImportRuns" enable row level security;
alter table public."dldImportIssues" enable row level security;
alter table public."valuationRateLimitWindows" enable row level security;

commit;
