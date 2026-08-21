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

  test("keeps the readiness review conditional until the deployed server role is evidenced", () => {
    const readinessReview = readFileSync(readinessReviewPath, "utf8");

    expect(readinessReview).toContain("**CONDITIONAL NO-GO.**");
    expect(readinessReview).toContain(
      "runtime role used by the deployed server"
    );
    expect(readinessReview).toContain("second explicit owner decision");
  });
});
