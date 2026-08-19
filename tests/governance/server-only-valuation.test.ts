import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("server-only valuation governance", () => {
  test("does not retain the legacy browser-side valuation engine", () => {
    expect(existsSync(path.join(repositoryRoot, "client/src/lib/valuation.ts"))).toBe(false);
  });
});
