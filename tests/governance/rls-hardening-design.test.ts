import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const migrationPath = path.join(
  repositoryRoot,
  "supabase/migrations/20260821190000_enable_rls_application_tables.sql"
);
const designPath = path.join(
  repositoryRoot,
  "docs/security/RLS-HARDENING-DESIGN-2026-08-21.md"
);
const readinessReviewPath = path.join(
  repositoryRoot,
  "docs/security/RLS-READINESS-REVIEW-2026-08-21.md"
);
const connectionRoleStrategyPath = path.join(
  repositoryRoot,
  "docs/security/RLS-CONNECTION-ROLE-STRATEGY-REVIEW-2026-08-21.md"
);
const applicationRoleMigrationPath = path.join(
  repositoryRoot,
  "supabase/migrations/20260821200000_prepare_least_privilege_application_role_and_rls.sql"
);
const applicationRolePackagePath = path.join(
  repositoryRoot,
  "docs/security/RLS-APPLICATION-ROLE-IMPLEMENTATION-PACKAGE-2026-08-21.md"
);

const protectedTables = [
  "users",
  "methodologyVersions",
  "valuationRequests",
  "valuationAuditEvents",
  "marketTransactions",
  "dldImportRuns",
  "dldImportIssues",
  "valuationRateLimitWindows",
] as const;

describe("RLS hardening design", () => {
  test("enables RLS on exactly the reviewed application tables", () => {
    const migration = readFileSync(migrationPath, "utf8");
    const tableStatements = [
      ...migration.matchAll(
        /alter table public\."([^"]+)" enable row level security;/gi
      ),
    ].map(match => match[1]);

    expect(tableStatements).toEqual(protectedTables);
  });

  test("does not force RLS or create a direct-client policy before server-role validation", () => {
    const migration = readFileSync(migrationPath, "utf8");
    const executableSql = migration.replace(/^--.*$/gm, "");

    expect(executableSql).not.toMatch(/force\s+row\s+level\s+security/i);
    expect(executableSql).not.toMatch(/create\s+policy/i);
    expect(executableSql).not.toMatch(/grant\s+/i);
  });

  test("documents that production application requires a separate owner approval", () => {
    const design = readFileSync(designPath, "utf8");

    expect(design).toContain("**not applied**");
    expect(design).toContain("explicitly authorize database application");
    protectedTables.forEach(table => expect(design).toContain(`\`${table}\``));
  });

  test("preserves the historical readiness record and links later runtime-role evidence", () => {
    const readinessReview = readFileSync(readinessReviewPath, "utf8");

    expect(readinessReview).toContain("**CONDITIONAL NO-GO.**");
    expect(readinessReview).toContain("runtime-role evidence");
    expect(readinessReview).toMatch(/rather\s+than adding an HTTP path/);
    expect(readinessReview).toContain("database write");
    expect(readinessReview).toMatch(/no such\s+observation exists/);
    expect(readinessReview).toContain("second explicit owner approval");
    expect(readinessReview).toContain("### 7.1 Subsequent runtime-role evidence update");
    expect(readinessReview).toContain("rolbypassrls=true");
    expect(readinessReview).toContain("RLS-CONNECTION-ROLE-STRATEGY-REVIEW-2026-08-21.md");
  });

  test("records that the observed production role bypasses RLS and requires a separate transition", () => {
    const strategy = readFileSync(connectionRoleStrategyPath, "utf8");

    expect(strategy).toContain("`current_user=postgres`; `session_user=postgres`");
    expect(strategy).toContain("`rolbypassrls=true`");
    expect(strategy).toContain("**Only eligible design direction.**");
    expect(strategy).toContain("must **not** be applied as a stand-alone step");
    expect(strategy).toContain("No technical implementation should start automatically");
  });

  test("prepares a non-bypass application role with only reviewed relation privileges", () => {
    const migration = readFileSync(applicationRoleMigrationPath, "utf8");

    expect(migration).toContain("create role miayaar_app");
    expect(migration).toContain("nosuperuser");
    expect(migration).toContain("noinherit");
    expect(migration).toContain("nobypassrls");
    expect(migration).toContain("password null");
    expect(migration).toContain('grant select, insert, update on table public."users" to miayaar_app;');
    expect(migration).toContain('grant insert on table public."valuationAuditEvents" to miayaar_app;');
    expect(migration).toContain('grant select on table public."marketTransactions" to miayaar_app;');
    expect(migration).toContain('grant select on table public."dldImportRuns" to miayaar_app;');
    expect(migration).toContain('grant usage, select on sequence public."users_id_seq" to miayaar_app;');
    expect(migration).toContain('alter default privileges in schema public revoke all on tables from public;');
    expect(migration).toContain('alter default privileges in schema public revoke all on sequences from public;');
    expect(migration).not.toMatch(/grant\s+all\s+privileges/i);
    expect(migration).not.toMatch(/grant\s+.*dldImportIssues.*miayaar_app/i);
    expect(migration).not.toMatch(/alter\s+default\s+privileges\s+for\s+role\s+postgres/i);
    expect(migration).not.toMatch(/alter\s+role\s+postgres/i);
  });

  test("pairs RLS with explicit server-only policies and preserves the ingestion boundary", () => {
    const migration = readFileSync(applicationRoleMigrationPath, "utf8");

    protectedTables.forEach(table => {
      expect(migration).toContain(`alter table public."${table}" enable row level security;`);
    });
    expect(migration).toContain('create policy "miayaar_app_users_access"');
    expect(migration).toContain('create policy "miayaar_app_market_transactions_read"');
    expect(migration).toContain('create policy "miayaar_app_rate_limit_windows_access"');
    expect(migration).not.toMatch(/create\s+policy\s+"miayaar_app_dld_import_issues/i);
    expect(migration).not.toMatch(/force\s+row\s+level\s+security/i);
  });

  test("documents the staged application and rollback gate without exposing secrets", () => {
    const implementationPackage = readFileSync(applicationRolePackagePath, "utf8");

    expect(implementationPackage).toContain("**PREPARED / NOT APPLIED.**");
    expect(implementationPackage).toContain("second explicit\nowner decision");
    expect(implementationPackage).toContain("`rolbypassrls=false`");
    expect(implementationPackage).toContain("DLD ingestion script is intentionally out of scope");
    expect(implementationPackage).toContain("Do **not** drop");
    expect(implementationPackage).not.toMatch(/postgres(?:ql)?:\/\//i);
  });
});
