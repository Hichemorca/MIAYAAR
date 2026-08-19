import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const readRepositoryFile = (...segments: string[]) =>
  fs.readFileSync(path.join(repositoryRoot, ...segments), "utf8");

describe("release governance automation", () => {
  test("CI verifies type safety, tests, production build, and whitespace on PRs and main", () => {
    const workflow = readRepositoryFile(".github", "workflows", "ci.yml");

    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("branches: [main]");
    expect(workflow).toContain("push:");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("pnpm check");
    expect(workflow).toContain("pnpm test");
    expect(workflow).toContain("pnpm build");
    expect(workflow).toContain("git diff --check");
  });

  test("GitHub-native alerts create deduplicated issues for CI and Netlify failures", () => {
    const workflow = readRepositoryFile(".github", "workflows", "failure-alerts.yml");
    const operations = readRepositoryFile("docs", "operations", "github-ci-cd-notifications.md");

    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain('workflows: ["MIAYAAR CI"]');
    expect(workflow).toContain("check_run:");
    expect(workflow).toContain("status:");
    expect(workflow).toContain("actions/github-script@v7");
    expect(workflow).toContain("ci-cd-alert");
    expect(workflow).toContain("dedupeKey");
    expect(operations).toContain("Repository watchers");
    expect(operations).toContain("cannot force an individual watcher");
  });

  test("the methodology ADR template preserves canonical-source and evidence-led release gates", () => {
    const template = readRepositoryFile("docs", "ADR", "ADR-TEMPLATE-METHODOLOGY-RELEASE.md");

    for (const requiredSection of [
      "## Release Gate",
      "## Canonical Source and Version Alignment",
      "## Calculation and Evidence Impact",
      "## Contract, API, and Audit Impact",
      "## Validation Plan",
      "## Owner Approval",
      "## Implementation and Release Record",
    ]) {
      expect(template).toContain(requiredSection);
    }

    expect(template).toContain("do not introduce a synthetic value or allocation");
    expect(template).toContain("must be proposed and reviewed **before** an implementation changes");
  });
});
