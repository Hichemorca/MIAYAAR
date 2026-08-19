import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import buildStampHandler, { createBuildStamp } from "../../netlify/functions/build-stamp";
import { BUILD_STAMP } from "../../netlify/generated/build-stamp";

describe("Netlify production build stamp", () => {
  it("publishes only the Git commit reference and non-secret deployment context", () => {
    expect(
      createBuildStamp({
        commitRef: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d",
        branch: "main",
        context: "production",
      }),
    ).toEqual({
      schemaVersion: "MIAYAAR-BUILD-STAMP-1",
      commitRef: "81f02ca2d66db6fa1a9fa9dc3e2f94cc8cbfd39d",
      branch: "main",
      context: "production",
    });
  });

  it("uses explicit non-secret unknown markers when Netlify metadata is unavailable", () => {
    expect(createBuildStamp({ commitRef: " ", branch: undefined, context: "" })).toEqual({
      schemaVersion: "MIAYAAR-BUILD-STAMP-1",
      commitRef: "unknown",
      branch: "unknown",
      context: "unknown",
    });
  });

  it("serves the minimal non-cacheable stamp captured at build time through GET", async () => {
    const response = await buildStampHandler(new Request("https://miayaar.netlify.app/_miayaar/build"));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(createBuildStamp(BUILD_STAMP));
  });

  it("rejects methods other than GET", async () => {
    const response = await buildStampHandler(new Request("https://miayaar.netlify.app/_miayaar/build", { method: "POST" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(await response.json()).toEqual({ error: { code: "METHOD_NOT_ALLOWED", message: "GET is required." } });
  });

  it("captures only the public Netlify build metadata during the build", () => {
    const generatedPath = resolve(process.cwd(), "netlify/generated/build-stamp.ts");
    const previous = existsSync(generatedPath) ? readFileSync(generatedPath, "utf8") : undefined;

    try {
      execFileSync(process.execPath, ["scripts/write-build-stamp.mjs"], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          COMMIT_REF: "c0393b6da5cae1f0c3b835486366e07d4fcf6d49",
          BRANCH: "main",
          CONTEXT: "production",
        },
      });

      expect(readFileSync(generatedPath, "utf8")).toContain('"commitRef": "c0393b6da5cae1f0c3b835486366e07d4fcf6d49"');
      expect(readFileSync(generatedPath, "utf8")).toContain('"branch": "main"');
      expect(readFileSync(generatedPath, "utf8")).toContain('"context": "production"');
      expect(readFileSync(generatedPath, "utf8")).not.toContain("DATABASE_URL");
    } finally {
      if (previous === undefined) {
        rmSync(generatedPath, { force: true });
      } else {
        writeFileSync(generatedPath, previous);
      }
    }
  });
});
